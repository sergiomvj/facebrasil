import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'facebrasil_ig_webhook_2026';

// ─── GET — Meta Webhook Verification Handshake ─────────────────────────────
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode      = searchParams.get('hub.mode');
    const token     = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Instagram Webhook] Verificação bem-sucedida');
        return new Response(challenge, { status: 200 });
    }

    console.warn('[Instagram Webhook] Falha na verificação', { mode, token });
    return new Response('Forbidden', { status: 403 });
}

// ─── POST — Receive Events ─────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log('[Instagram Webhook] Evento recebido:', JSON.stringify(payload).slice(0, 500));

        const entries = payload?.entry || [];

        for (const entry of entries) {
            const changes = entry?.changes || [];
            const messaging = entry?.messaging || [];

            // ── Handle "changes" (comments, mentions, likes) ──
            for (const change of changes) {
                const field = change.field as string;
                const value = change.value || {};

                let eventType = field;
                let mediaId: string | undefined;
                let senderId: string | undefined;
                let message: string | undefined;

                if (field === 'comments') {
                    eventType = 'comment';
                    mediaId = value.media?.id;
                    senderId = value.from?.id;
                    message = value.text;
                } else if (field === 'mentions') {
                    eventType = 'mention';
                    mediaId = value.media_id;
                    senderId = value.commenter_id;
                    message = value.text;
                } else if (field === 'story_insights') {
                    eventType = 'story_insight';
                } else if (field === 'feed') {
                    eventType = 'feed_update';
                    mediaId = value.media_id;
                }

                await supabaseAdmin.from('instagram_events').insert({
                    event_type: eventType,
                    object: payload.object,
                    sender_id: senderId || null,
                    media_id: mediaId || null,
                    message: message || null,
                    raw_payload: { entry_id: entry.id, field, value },
                });
            }

            // ── Handle "messaging" (DMs via Instagram Messenger) ──
            for (const msg of messaging) {
                const senderId = msg.sender?.id;
                const text = msg.message?.text;
                const attachments = msg.message?.attachments;

                await supabaseAdmin.from('instagram_events').insert({
                    event_type: 'direct_message',
                    object: 'instagram',
                    sender_id: senderId || null,
                    message: text || (attachments ? '[Mídia]' : null),
                    raw_payload: msg,
                });
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (err: any) {
        console.error('[Instagram Webhook] Erro:', err);
        // Always return 200 to Meta so it doesn't retry aggressively
        return NextResponse.json({ status: 'error', message: err.message }, { status: 200 });
    }
}
