// @ts-ignore
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27' as any, // Adicionando cast para evitar erros de tipo se o SDK atualizar
  appInfo: {
    name: 'Facebrasil Portal',
    version: '1.0.0',
  },
});
