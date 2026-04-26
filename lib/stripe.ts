// @ts-ignore
import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY || 'dummy_for_build';
// Log a warning in development if missing, instead of crashing the build
if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(secret, {
  apiVersion: '2025-01-27' as any, // Adicionando cast para evitar erros de tipo se o SDK atualizar
  appInfo: {
    name: 'Facebrasil Portal',
    version: '1.0.0',
  },
});
