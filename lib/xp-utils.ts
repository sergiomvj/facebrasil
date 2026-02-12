// @ts-nocheck
// Utilitário para ganhar XP no sistema de gamificação

export type XPType = 
  | 'READ_ARTICLE'
  | 'DAILY_LOGIN'
  | 'SHARE'
  | 'VIEW_AD'
  | 'CLICK_AD'
  | 'COMMENT'
  | 'LIKE'
  | 'COMPLETE_PROFILE';

interface XPGainResult {
  success: boolean;
  points?: number;
  skipped?: boolean;
  message?: string;
  error?: string;
}

/**
 * Ganha XP para o usuário atual
 * @param type - Tipo de ação que gerou XP
 * @param distinctId - ID único para evitar duplicatas (ex: ID do artigo)
 * @returns Resultado da operação
 */
export async function gainXP(type: XPType, distinctId?: string): Promise<XPGainResult> {
  try {
    const response = await fetch('/api/gamification/xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        distinctId: distinctId || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to gain XP',
      };
    }

    const result = await response.json();

    // Emitir evento para atualizar o XPHUD
    if (result.success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp_gained', {
        detail: { type, points: result.points }
      }));
    }

    return {
      success: result.success,
      points: result.points,
      skipped: result.skipped,
      message: result.message,
    };
  } catch (error) {
    console.error('[gainXP] Error:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}

/**
 * Ganha XP ao ler um artigo (evita duplicatas por artigo)
 * @param articleId - ID do artigo lido
 */
export async function gainXPForReading(articleId: string): Promise<XPGainResult> {
  return gainXP('READ_ARTICLE', articleId);
}

/**
 * Ganha XP para login diário
 */
export async function gainXPForDailyLogin(): Promise<XPGainResult> {
  const today = new Date().toISOString().split('T')[0];
  return gainXP('DAILY_LOGIN', today);
}

/**
 * Ganha XP ao compartilhar conteúdo
 * @param contentId - ID do conteúdo compartilhado
 */
export async function gainXPForSharing(contentId: string): Promise<XPGainResult> {
  return gainXP('SHARE', contentId);
}

/**
 * Ganha XP ao ver um anúncio
 * @param adId - ID do anúncio
 */
export async function gainXPForAdView(adId: string): Promise<XPGainResult> {
  return gainXP('VIEW_AD', adId);
}

/**
 * Ganha XP ao clicar em anúncio
 * @param adId - ID do anúncio
 */
export async function gainXPForAdClick(adId: string): Promise<XPGainResult> {
  return gainXP('CLICK_AD', adId);
}

/**
 * Ganha XP ao comentar
 * @param commentId - ID do comentário
 */
export async function gainXPForComment(commentId: string): Promise<XPGainResult> {
  return gainXP('COMMENT', commentId);
}

/**
 * Ganha XP ao curtir
 * @param contentId - ID do conteúdo curtido
 */
export async function gainXPForLike(contentId: string): Promise<XPGainResult> {
  return gainXP('LIKE', contentId);
}
