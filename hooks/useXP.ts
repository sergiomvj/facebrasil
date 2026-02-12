'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface XPData {
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  achievements: any[];
}

interface UseXPReturn {
  data: XPData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  gainXP: (type: string, distinctId?: string) => Promise<any>;
  grantXP: (type: string, distinctId?: string) => Promise<number>;
}

export function useXP(): UseXPReturn {
  const { isSignedIn } = useUser();
  const [data, setData] = useState<XPData>({
    xp: 0,
    level: 1,
    xpForCurrentLevel: 0,
    xpForNextLevel: 100,
    progress: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchXP = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gamification/xp/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch XP data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData({
          xp: result.xp,
          level: result.level,
          xpForCurrentLevel: result.xpForCurrentLevel,
          xpForNextLevel: result.xpForNextLevel,
          progress: result.progress,
          achievements: result.achievements || []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const gainXP = useCallback(async (type: string, distinctId?: string) => {
    if (!isSignedIn) {
      return { success: false, error: 'Not signed in' };
    }

    try {
      const response = await fetch('/api/gamification/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, distinctId }),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar dados locais
        await fetchXP();
        
        // Emitir evento global
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('xp_gained', {
            detail: { type, points: result.points }
          }));
        }
      }

      return result;
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Network error' 
      };
    }
  }, [isSignedIn, fetchXP]);

  useEffect(() => {
    fetchXP();

    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchXP, 60000);

    // Escutar eventos de XP
    const handleXPGained = () => fetchXP();
    window.addEventListener('xp_gained', handleXPGained);

    return () => {
      clearInterval(interval);
      window.removeEventListener('xp_gained', handleXPGained);
    };
  }, [fetchXP]);

  // Função simplificada que retorna apenas os pontos (para compatibilidade)
  const grantXP = useCallback(async (type: string, distinctId?: string): Promise<number> => {
    const result = await gainXP(type, distinctId);
    return result.success ? (result.points || 0) : 0;
  }, [gainXP]);

  return {
    data,
    loading,
    error,
    refresh: fetchXP,
    gainXP,
    grantXP
  };
}
