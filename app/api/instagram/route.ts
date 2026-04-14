import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'facebrasil_ig_webhook_2026';

// GET - Meta Webhook Verification Handshake
// Meta sends: GET ?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=NUMBER
// We must respond with the hub.challenge value (plain text, 200 OK)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe') {
        if (token === VERIFY_TOKEN) {
            console.log('[Instagram Webhook] Meta verification succeeded');
            return new Response(challenge ?? '', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        console.warn('[Instagram Webhook] Invalid verification token received:', token);
        return new Response('Forbidden: invalid verify_token', { status: 403 });
    }

    return NextResponse.json({
        status: 'ok',
        webhook: 'Instagram / Meta Webhook - Facebrasil',
        endpoint: 'https://fbr.news/api/instagram',
        events: ['comments', 'mentions', 'messages', 'story_insights', 'feed'],
        ready: true,
    });
}

// POST - Receive Events from Meta
export async function POST(req: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const payload = await req.json();
        console.log('[Instagram Webhook] Evento recebido:', JSON.stringify(payload).slice(0, 500));

        const entries = payload?.entry || [];

        for (const entry of entries) {
            const changes = entry?.changes || [];
            const messaging = entry?.messaging || [];

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
                        mediaId = value.media?.id;
                        senderId = value.from?.id;
                        message = value.text;
                        break;
                    case 'mentions':
                        eventType = 'mention';
                        mediaId = value.media_id;
                        senderId = value.commenter_id;
                        message = value.text;
                        break;
                    case 'story_insights':
                        eventType = 'story_insight';
                        break;
                    case 'feed':
                        eventType = 'feed_update';
                        mediaId = value.media_id;
                        break;
                }

                await (supabaseAdmin as any).from('instagram_events').insert({
                    event_type: eventType,
                    object: payload.object ?? null,
                    sender_id: senderId ?? null,
                    media_id: mediaId ?? null,
                    message: message ?? null,
                    raw_payload: { entry_id: entry.id, field, value },
                });
            }

            for (const msg of messaging) {
                await (supabaseAdmin as any).from('instagram_events').insert({
                    event_type: 'direct_message',
                    object: 'instagram',
                    sender_id: msg.sender?.id ?? null,
                    message: msg.message?.text ?? (msg.message?.attachments ? '[Midia]' : null),
                    raw_payload: msg,
                });
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (err: any) {
        console.error('[Instagram Webhook] Erro no processamento:', err);
        return NextResponse.json({ status: 'error', message: err.message });
    }
}
