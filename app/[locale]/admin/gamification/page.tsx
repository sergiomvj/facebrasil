'use client';

import React from 'react';
import { motion } from 'framer-motion';
import XPHUD from '@/components/XPHUD';
import AchievementsPanel from '@/components/AchievementsPanel';
import { useXP } from '@/hooks/useXP';
import { 
  Trophy, 
  Target, 
  Flame, 
  Crown,
  Gamepad2,
  BarChart3
} from 'lucide-react';

export default function GamificationPage() {
  const { data: xpData, loading: xpLoading } = useXP();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Gamificação
          </h1>
          <p className="text-slate-400">Acompanhe seu progresso, conquistas e nível</p>
        </div>
        
        {/* XP HUD Preview */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-slate-500 mb-2">Preview do seu status</p>
          <XPHUD />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl p-6 border border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Nível Atual</p>
              <p className="text-3xl font-black text-white">
                {xpLoading ? '...' : xpData?.level || 1}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">XP Total</p>
              <p className="text-3xl font-black text-white">
                {xpLoading ? '...' : (xpData?.xp || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Progresso</p>
              <p className="text-3xl font-black text-white">
                {xpLoading ? '...' : `${xpData?.progress || 0}%`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress to Next Level */}
      {!xpLoading && xpData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="font-bold text-white">Progresso para o Próximo Nível</h3>
                <p className="text-sm text-slate-400">
                  {xpData.xpForNextLevel - xpData.xpForCurrentLevel} XP restantes para o nível {xpData.level + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">{xpData.level}</span>
              <span className="text-slate-500 mx-2">→</span>
              <span className="text-2xl font-black text-primary">{xpData.level + 1}</span>
            </div>
          </div>
          
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpData.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-orange-500 rounded-full"
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-slate-500">
            <span>{xpData.xpForCurrentLevel} XP</span>
            <span>{xpData.xpForNextLevel} XP</span>
          </div>
        </motion.div>
      )}

      {/* How to Earn XP */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Como Ganhar XP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { action: 'Ler artigo', xp: 50, icon: '📖', desc: 'Por cada artigo lido (15s+)' },
            { action: 'Login diário', xp: 20, icon: '📅', desc: 'Uma vez por dia' },
            { action: 'Compartilhar', xp: 30, icon: '📤', desc: 'Cada compartilhamento' },
            { action: 'Clicar em anúncio', xp: 30, icon: '🎯', desc: 'Por clique válido' },
            { action: 'Comentar', xp: 15, icon: '💬', desc: 'Por comentário' },
            { action: 'Curtir', xp: 5, icon: '❤️', desc: 'Por curtida' },
            { action: 'Ver anúncio', xp: 1, icon: '👁️', desc: 'Por visualização' },
            { action: 'Conquistas', xp: '50-500', icon: '🏆', desc: 'Por badge obtido' }
          ].map((item, index) => (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-medium text-white">{item.action}</p>
              <p className="text-sm text-primary font-bold">+{item.xp} XP</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Conquistas
        </h3>
        <AchievementsPanel />
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Top Leitores
        </h3>
        <p className="text-slate-500 text-sm">
          Em breve: Ranking dos leitores mais engajados do portal!
        </p>
      </div>
    </div>
  );
}
