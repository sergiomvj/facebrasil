import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Platform = 'instagram_carousel' | 'instagram_caption' | 'twitter' | 'facebook';

const PLATFORM_SPECS: Record<Platform, { size: '1024x1024' | '1792x1024' | '1024x1792'; label: string }> = {
    instagram_carousel: { size: '1024x1024', label: 'Instagram Carrossel (1:1)' },
    instagram_caption:  { size: '1024x1024', label: 'Instagram Post (1:1)' },
    twitter:            { size: '1792x1024', label: 'X/Twitter Post (16:9)' },
    facebook:           { size: '1792x1024', label: 'Facebook Post (16:9)' },
};

function buildImagePrompt(platform: Platform, articleTitle: string, contentHint: string): string {
    const styleBase = `Editorial photojournalistic style, professional news photography, 
dramatic lighting, high contrast, cinematic composition, documentary feel, 
NO text overlays, NO logos, NO watermarks, realistic and authentic.`;

    const brazilContext = `Subject relates to Brazilian immigrant community in the United States, 
multicultural, diaspora themes, urban American settings with Brazilian cultural undertones.`;

    const platformStyle: Record<Platform, string> = {
        instagram_carousel: `Square format (1:1). Bold graphic treatment, strong visual metaphor suitable for 
Instagram carousel first slide. Eye-catching, scroll-stopping composition.`,
        instagram_caption: `Square format (1:1). Emotionally resonant scene for Instagram feed. 
Warm tones, human element, authentic moment.`,
        twitter: `Widescreen landscape (16:9). Clean editorial composition, news-worthy scene. 
Professional journalistic photography appropriate for Twitter/X.`,
        facebook: `Widescreen landscape (16:9). Community-focused, warm and inclusive visual. 
Facebook audience: families and community groups.`,
    };

    return `${styleBase}

${brazilContext}

Platform: ${PLATFORM_SPECS[platform].label}
${platformStyle[platform]}

Article theme: "${articleTitle}"
Visual context: ${contentHint}

Create a single powerful editorial image that represents this theme. 
No people's faces should be clearly identifiable. Prefer symbolic, 
atmospheric, or environmental compositions.`;
}

export async function POST(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const { platform, articleTitle, contentHint, sessionId } = await req.json() as {
            platform: string;
            articleTitle: string;
            contentHint: string;
            sessionId?: string;
        };

        if (!platform || !articleTitle) {
            return NextResponse.json({ error: 'platform e articleTitle são obrigatórios' }, { status: 400 });
        }

        let specPlatform = platform as Platform;
        let isSlide = false;
        let slideNumber = '';
        if (platform.startsWith('instagram_carousel_slide_')) {
            specPlatform = 'instagram_carousel';
            isSlide = true;
            slideNumber = platform.replace('instagram_carousel_slide_', '');
        }

        const spec = PLATFORM_SPECS[specPlatform];
        if (!spec) {
            return NextResponse.json({ error: 'Plataforma inválida: ' + platform }, { status: 400 });
        }

        // Generate with DALL-E 3
        const imageResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: buildImagePrompt(specPlatform, articleTitle, contentHint),
            n: 1,
            size: spec.size,
            quality: 'standard',
            style: 'natural',
        });

        const imageItem = imageResponse.data?.[0];
        if (!imageItem?.url) throw new Error('DALL-E não retornou URL de imagem');
        const imageUrl = imageItem.url;

        // Download the image from OpenAI (temporary URL, expires in ~1h)
        const imgBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());

        // Upload to Supabase Storage bucket "waterfall-images"
        const fileName = `${sessionId || 'unsaved'}/${platform}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('waterfall-images')
            .upload(fileName, imgBuffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('waterfall-images')
            .getPublicUrl(uploadData.path);

        // If sessionId provided, update the session's images JSONB
        if (sessionId) {
            const { data: session } = await supabaseAdmin
                .from('waterfall_sessions')
                .select('images, slide_images')
                .eq('id', sessionId)
                .single();

            if (isSlide) {
                const currentSlideImages = ((session as any)?.slide_images) || {};
                await supabaseAdmin
                    .from('waterfall_sessions')
                    .update({ slide_images: { ...currentSlideImages, [slideNumber]: publicUrl } })
                    .eq('id', sessionId);
            } else {
                const currentImages = ((session as any)?.images) || {};
                await supabaseAdmin
                    .from('waterfall_sessions')
                    .update({ images: { ...currentImages, [platform]: publicUrl } })
                    .eq('id', sessionId);
            }
        }

        return NextResponse.json({ success: true, imageUrl: publicUrl });

    } catch (error: any) {
        console.error('[Waterfall Image API] Erro:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
