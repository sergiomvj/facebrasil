import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Load credentials from DB ──────────────────────────────────────────────
async function loadCredentials(platform: string): Promise<Record<string, string> | null> {
    const { data } = await supabaseAdmin
        .from('social_credentials')
        .select('credentials')
        .eq('platform', platform)
        .single();
    return (data?.credentials as Record<string, string>) || null;
}

// ─── Log the post result ───────────────────────────────────────────────────
async function logPost(sessionId: string, platform: string, contentType: string, result: {
    success: boolean; postId?: string; postUrl?: string; error?: string;
}) {
    await supabaseAdmin.from('waterfall_posts').insert({
        session_id: sessionId,
        platform,
        content_type: contentType,
        post_id: result.postId || null,
        post_url: result.postUrl || null,
        status: result.success ? 'published' : 'error',
        error_message: result.error || null,
        published_at: result.success ? new Date().toISOString() : null,
    });
}

// ─── POST Facebook ─────────────────────────────────────────────────────────
async function postFacebook(
    creds: Record<string, string>,
    text: string,
    imageUrl?: string
): Promise<{ postId: string; postUrl: string }> {
    const pageId = creds.page_id;
    const token = creds.page_access_token;

    if (!pageId || !token) throw new Error('Credenciais Facebook incompletas: page_id e page_access_token são obrigatórios');

    const endpoint = imageUrl
        ? `https://graph.facebook.com/v19.0/${pageId}/photos`
        : `https://graph.facebook.com/v19.0/${pageId}/feed`;

    const body = new URLSearchParams();
    body.set('access_token', token);
    if (imageUrl) {
        body.set('url', imageUrl);
        body.set('caption', text);
    } else {
        body.set('message', text);
    }

    const res = await fetch(endpoint, { method: 'POST', body });
    const data = await res.json();

    if (!res.ok || data.error) throw new Error(data.error?.message || `Facebook API error: ${res.status}`);

    const postId = data.id as string;
    return {
        postId,
        postUrl: `https://www.facebook.com/${postId.replace('_', '/posts/')}`,
    };
}

// ─── POST Instagram Carousel ────────────────────────────────────────────────
async function postInstagramCarousel(
    creds: Record<string, string>,
    caption: string,
    slideImageUrls: string[]
): Promise<{ postId: string; postUrl: string }> {
    const igAccountId = creds.ig_account_id;
    const token = creds.access_token;

    if (!igAccountId || !token) throw new Error('Credenciais Instagram incompletas: ig_account_id e access_token são obrigatórios');
    if (slideImageUrls.length === 0) throw new Error('Nenhuma imagem de slide gerada. Gere as imagens dos slides primeiro.');

    const base = `https://graph.facebook.com/v19.0/${igAccountId}`;

    // Step 1: Create item containers
    const mediaIds: string[] = [];
    for (const imgUrl of slideImageUrls) {
        const body = new URLSearchParams({
            image_url: imgUrl,
            is_carousel_item: 'true',
            access_token: token,
        });
        const res = await fetch(`${base}/media`, { method: 'POST', body });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(`Erro criando item: ${data.error?.message}`);
        mediaIds.push(data.id);
    }

    // Step 2: Create carousel container
    const carouselBody = new URLSearchParams({
        media_type: 'CAROUSEL',
        caption,
        children: mediaIds.join(','),
        access_token: token,
    });
    const carouselRes = await fetch(`${base}/media`, { method: 'POST', body: carouselBody });
    const carouselData = await carouselRes.json();
    if (!carouselRes.ok || carouselData.error) throw new Error(`Erro criando carrossel: ${carouselData.error?.message}`);

    // Step 3: Publish
    const publishBody = new URLSearchParams({
        creation_id: carouselData.id,
        access_token: token,
    });
    const publishRes = await fetch(`${base}/media_publish`, { method: 'POST', body: publishBody });
    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) throw new Error(`Erro publicando: ${publishData.error?.message}`);

    const postId = publishData.id as string;
    return {
        postId,
        postUrl: `https://www.instagram.com/p/${postId}/`,
    };
}

// ─── POST Instagram Caption (single image) ──────────────────────────────────
async function postInstagramCaption(
    creds: Record<string, string>,
    caption: string,
    imageUrl: string
): Promise<{ postId: string; postUrl: string }> {
    const igAccountId = creds.ig_account_id;
    const token = creds.access_token;

    if (!igAccountId || !token) throw new Error('Credenciais Instagram incompletas');
    if (!imageUrl) throw new Error('Imagem obrigatória para post no Instagram. Gere a imagem primeiro.');

    const base = `https://graph.facebook.com/v19.0/${igAccountId}`;

    // Create media container
    const mediaBody = new URLSearchParams({ image_url: imageUrl, caption, access_token: token });
    const mediaRes = await fetch(`${base}/media`, { method: 'POST', body: mediaBody });
    const mediaData = await mediaRes.json();
    if (!mediaRes.ok || mediaData.error) throw new Error(`Erro criando media: ${mediaData.error?.message}`);

    // Publish
    const publishBody = new URLSearchParams({ creation_id: mediaData.id, access_token: token });
    const publishRes = await fetch(`${base}/media_publish`, { method: 'POST', body: publishBody });
    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) throw new Error(`Erro publicando: ${publishData.error?.message}`);

    return {
        postId: publishData.id,
        postUrl: `https://www.instagram.com/`,
    };
}

// ─── POST Twitter ───────────────────────────────────────────────────────────
async function postTwitter(
    creds: Record<string, string>,
    text: string,
    imageUrl?: string
): Promise<{ postId: string; postUrl: string }> {
    const { api_key, api_secret, access_token, access_token_secret } = creds;
    if (!api_key || !api_secret || !access_token || !access_token_secret) {
        throw new Error('Credenciais Twitter incompletas: api_key, api_secret, access_token e access_token_secret são obrigatórios');
    }

    const client = new TwitterApi({
        appKey: api_key,
        appSecret: api_secret,
        accessToken: access_token,
        accessSecret: access_token_secret,
    });
    const rw = client.readWrite;

    let mediaId: string | undefined;
    if (imageUrl) {
        try {
            // Download image and upload to Twitter
            const imgBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
            const uploadResult = await rw.v1.uploadMedia(Buffer.from(imgBuffer), { mimeType: 'image/png' });
            mediaId = uploadResult;
        } catch {
            // Post without image if upload fails
        }
    }

    const tweetPayload: { text: string; media?: { media_ids: [string] } } = { text };
    if (mediaId) tweetPayload.media = { media_ids: [mediaId] };

    const tweet = await rw.v2.tweet(tweetPayload);
    const tweetId = tweet.data.id;

    return {
        postId: tweetId,
        postUrl: `https://x.com/i/web/status/${tweetId}`,
    };
}

// ─── POST Twitter Thread ─────────────────────────────────────────────────────
async function postTwitterThread(
    creds: Record<string, string>,
    tweets: string[]
): Promise<{ postId: string; postUrl: string }> {
    const { api_key, api_secret, access_token, access_token_secret } = creds;
    if (!api_key || !api_secret || !access_token || !access_token_secret) {
        throw new Error('Credenciais Twitter incompletas');
    }

    const client = new TwitterApi({
        appKey: api_key,
        appSecret: api_secret,
        accessToken: access_token,
        accessSecret: access_token_secret,
    });
    const rw = client.readWrite;

    let lastId: string | undefined;
    let firstId: string | undefined;

    for (const text of tweets) {
        const payload: { text: string; reply?: { in_reply_to_tweet_id: string } } = { text };
        if (lastId) payload.reply = { in_reply_to_tweet_id: lastId };

        const tweet = await rw.v2.tweet(payload);
        if (!firstId) firstId = tweet.data.id;
        lastId = tweet.data.id;
    }

    return {
        postId: firstId!,
        postUrl: `https://x.com/i/web/status/${firstId}`,
    };
}

// ─── Main Handler ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            platform,    // 'facebook' | 'instagram_carousel' | 'instagram_caption' | 'twitter_tweet' | 'twitter_thread'
            contentType, // for logging
            sessionId,
            text,
            texts,       // for thread (array)
            imageUrl,
            slideImageUrls, // for carousel (array)
        } = body;

        const creds = await loadCredentials(
            platform.startsWith('instagram') ? 'instagram' :
            platform.startsWith('twitter') ? 'twitter' : 'facebook'
        );

        if (!creds) {
            return NextResponse.json({
                error: 'Credenciais não configuradas. Vá em Configurações de Redes Sociais e adicione suas credenciais.',
                notConfigured: true,
            }, { status: 400 });
        }

        let result: { postId: string; postUrl: string };

        switch (platform) {
            case 'facebook':
                result = await postFacebook(creds, text, imageUrl);
                break;
            case 'instagram_carousel':
                result = await postInstagramCarousel(creds, text, slideImageUrls || []);
                break;
            case 'instagram_caption':
                result = await postInstagramCaption(creds, text, imageUrl);
                break;
            case 'twitter_tweet':
                result = await postTwitter(creds, text, imageUrl);
                break;
            case 'twitter_thread':
                result = await postTwitterThread(creds, texts || [text]);
                break;
            default:
                return NextResponse.json({ error: 'Plataforma inválida' }, { status: 400 });
        }

        if (sessionId) {
            await logPost(sessionId, platform, contentType || platform, { success: true, ...result });
        }

        return NextResponse.json({ success: true, ...result });

    } catch (error: any) {
        console.error('[Waterfall Post API]', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
