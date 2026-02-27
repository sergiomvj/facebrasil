// @ts-nocheck
'use client';

import { supabase } from '@/lib/supabase';

/**
 * Converte pontos de reputação em Facetas ($FC)
 * Taxa de conversão sugerida: 1000 pontos = 1 $FC
 */
export async function convertPointsToFacets(userId: string, pointsAmount: number) {
    if (pointsAmount <= 0) throw new Error('Quantidade inválida');

    // Buscar reputação atual
    const { data: rep, error: fetchError } = await supabase
        .from('user_reputation')
        .select('total_points, facets_balance')
        .eq('user_id', userId)
        .single();

    if (fetchError || !rep) throw new Error('Erro ao buscar reputação');
    if (rep.total_points < pointsAmount) throw new Error('Pontos insuficientes');

    const facetsToAdd = pointsAmount / 1000;
    const newPoints = rep.total_points - pointsAmount;
    const newFacets = (Number(rep.facets_balance) || 0) + facetsToAdd;

    // Atualizar no banco
    const { error: updateError } = await supabase
        .from('user_reputation')
        .update({
            total_points: newPoints,
            facets_balance: newFacets,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (updateError) throw new Error('Erro ao processar conversão');

    // Registrar log de XP (opcional, como débito)
    await supabase.from('xp_logs').insert([{
        user_id: userId,
        amount: -pointsAmount,
        reason: 'conversion_to_facets',
        created_at: new Date().toISOString()
    }]);

    return { success: true, newPoints, newFacets };
}

/**
 * Resgata uma oferta de parceiro usando Facetas ($FC)
 */
export async function redeemPartnerOffer(userId: string, offerId: string) {
    // 1. Buscar a oferta e o saldo do usuário
    const [
        { data: offer, error: offerError },
        { data: rep, error: repError }
    ] = await Promise.all([
        supabase.from('partner_offers').select('*').eq('id', offerId).single(),
        supabase.from('user_reputation').select('facets_balance').eq('user_id', userId).single()
    ]);

    if (offerError || !offer) throw new Error('Oferta não encontrada');
    if (repError || !rep) throw new Error('Erro ao buscar saldo');

    const cost = Number(offer.facetas_price);
    const balance = Number(rep.facets_balance) || 0;

    if (balance < cost) {
        throw new Error(`Saldo insuficiente. Você precisa de ${cost} $FC, mas tem ${balance.toFixed(2)} $FC.`);
    }

    // 2. Deduzir o saldo
    const newBalance = balance - cost;
    const { error: updateError } = await supabase
        .from('user_reputation')
        .update({ facets_balance: newBalance })
        .eq('user_id', userId);

    if (updateError) throw new Error('Erro ao processar resgate');

    // 3. Registrar o resgate (opcional: criar tabela de resgates se necessário)
    // Para agora, apenas retornamos sucesso
    return { success: true, newBalance, message: `Você resgatou: ${offer.title}!` };
}
