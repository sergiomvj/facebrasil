export interface StripePackage {
  id: string; // 'A', 'B', 'C'
  name: string;
  description: string;
  priceAmount: number; // Em centavos (USD $100.00 = 10000)
  currency: string;
}

export const STRIPE_PACKAGES: Record<string, StripePackage> = {
  A: {
    id: 'A',
    name: 'Pacote A',
    description: '60 anúncios tamanho A + 100% BÔNUS (Total: 120)',
    priceAmount: 20000, // $200.00
    currency: 'usd',
  },
  B: {
    id: 'B',
    name: 'Pacote B',
    description: '60 anúncios tamanho B + 100% BÔNUS (Total: 120)',
    priceAmount: 50000, // $500.00
    currency: 'usd',
  },
  C: {
    id: 'C',
    name: 'Pacote C',
    description: '60 anúncios tamanho C + 100% BÔNUS (Total: 120)',
    priceAmount: 100000, // $1000.00
    currency: 'usd',
  },
};
