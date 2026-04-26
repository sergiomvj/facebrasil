import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PACKAGES } from '@/lib/stripe-packages';

export async function POST(req: NextRequest) {
  try {
    const { packageCode, leadId, email } = await req.json();

    if (!packageCode || !leadId) {
      return NextResponse.json({ error: 'Missing package code or lead ID' }, { status: 400 });
    }

    const pkg = STRIPE_PACKAGES[packageCode.toUpperCase()];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Pegar o locale atual da URL de origem ou usar o padrão
    const referer = req.headers.get('referer');
    const locale = referer?.includes('/en/') ? 'en' : referer?.includes('/es/') ? 'es' : 'pt';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            product_data: {
              name: pkg.name,
              description: pkg.description,
            },
            unit_amount: pkg.priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/${locale}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${locale}/advertise/cancel?lead_id=${leadId}`,
      customer_email: email,
      metadata: {
        leadId,
        packageCode,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
