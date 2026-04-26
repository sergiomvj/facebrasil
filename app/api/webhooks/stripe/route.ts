import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Missing stripe-signature or webhook secret');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      const leadId = session.metadata?.leadId;
      const packageCode = session.metadata?.packageCode;

      if (leadId) {
        console.log(`[Stripe Webhook] Payment completed for Lead ID: ${leadId}`);
        
        // Atualizar o lead no Supabase
        const { error } = await (supabaseAdmin as any)
          .from('advertising_leads')
          .update({
            status: 'won', // Mark as won/paid
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          })
          .eq('id', leadId);

        if (error) {
          console.error(`[Stripe Webhook] Database update error: ${error.message}`);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
      break;

    case 'checkout.session.expired':
      // Opcional: lidar com sessões expiradas
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Configuração para permitir o corpo bruto (importante para o Stripe)
export const config = {
  api: {
    bodyParser: false,
  },
};
