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
