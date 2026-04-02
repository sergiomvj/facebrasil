import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'facebrasil_ig_webhook_2026';

// ─── GET — Meta Webhook Verification Handshake ────────────────────────────────
// Meta sends: GET ?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=NUMBER
// We must respond with the hub.challenge value (plain text, 200 OK)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode      = searchParams.get('hub.mode');
    const token     = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // ── Meta verification handshake ──────────────────────────────────────────
    if (mode === 'subscribe') {
        if (token === VERIFY_TOKEN) {
            console.log('[Instagram Webhook] ✅ Verificação Meta bem-sucedida');
            return new Response(challenge ?? '', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }
        // Token present but wrong — reject
        console.warn('[Instagram Webhook] ❌ Token inválido recebido:', token);
        return new Response('Forbidden: invalid verify_token', { status: 403 });
    }

    // ── Plain GET (browser, health check, etc.) — return 200 + status info ──
    return NextResponse.json({
        status: 'ok',
        webhook: 'Instagram / Meta Webhook — Facebrasil',
        endpoint: 'https://fbr.news/api/instagram',
        events: ['comments', 'mentions', 'messages', 'story_insights', 'feed'],
        ready: true,
    });
}

// ─── POST — Receive Events from Meta ─────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log('[Instagram Webhook] Evento recebido:', JSON.stringify(payload).slice(0, 500));

        const entries = payload?.entry || [];

        for (const entry of entries) {
            const changes   = entry?.changes   || [];
            const messaging = entry?.messaging || [];

            // ── changes: comments, mentions, story, feed ─────────────────────
            for (const change of changes) {
                const field = change.field as string;
                const value = change.value || {};

                let eventType = field;
                let mediaId: string | undefined;
                let senderId: string | undefined;
                let message: string | undefined;

                switch (field) {
                    case 'comments':
                        eventType = 'comment';
                        mediaId   = value.media?.id;
                        senderId  = value.from?.id;
                        message   = value.text;
                        break;
                    case 'mentions':
                        eventType = 'mention';
                        mediaId   = value.media_id;
                        senderId  = value.commenter_id;
                        message   = value.text;
                        break;
                    case 'story_insights':
                        eventType = 'story_insight';
                        break;
                    case 'feed':
                        eventType = 'feed_update';
                        mediaId   = value.media_id;
                        break;
                }

                await supabaseAdmin.from('instagram_events').insert({
                    event_type:  eventType,
                    object:      payload.object ?? null,
                    sender_id:   senderId  ?? null,
                    media_id:    mediaId   ?? null,
                    message:     message   ?? null,
                    raw_payload: { entry_id: entry.id, field, value },
                });
            }

            // ── messaging: DMs ────────────────────────────────────────────────
            for (const msg of messaging) {
                await supabaseAdmin.from('instagram_events').insert({
                    event_type:  'direct_message',
                    object:      'instagram',
                    sender_id:   msg.sender?.id   ?? null,
                    message:     msg.message?.text ?? (msg.message?.attachments ? '[Mídia]' : null),
                    raw_payload: msg,
                });
            }
        }

        // Meta expects 200 — always
        return NextResponse.json({ status: 'ok' });

    } catch (err: any) {
        console.error('[Instagram Webhook] Erro no processamento:', err);
        // Still return 200 so Meta doesn't retry aggressively
        return NextResponse.json({ status: 'error', message: err.message });
    }
}
