'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Users, 
  Share2,
  Lock,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: {
    earned: number;
    total: number;
    percentage: number;
    points: number;
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  target: Target,
  flame: Flame,
  book: BookOpen,
  users: Users,
  share: Share2,
  zap: Zap
};

const rarityColors = {
  common: {
    bg: 'bg-slate-700',
    border: 'border-slate-600',
    text: 'text-slate-300',
    gradient: 'from-slate-600 to-slate-700'
  },
  rare: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-700'
  },
  epic: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    gradient: 'from-purple-500 to-purple-700'
  },
  legendary: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    gradient: 'from-yellow-400 via-orange-500 to-red-500'
  }
};

export default function AchievementsPanel() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      const response = await fetch('/api/gamification/achievements');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('[Achievements] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const filteredAchievements = selectedRarity === 'all' 
    ? data.achievements 
    : data.achievements.filter(a => a.rarity === selectedRarity);

  const earnedAchievements = data.achievements.filter(a => a.earned);
  const inProgressAchievements = data.achievements.filter(a => !a.earned && a.progress && a.progress > 0);

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          value={data.stats.earned.toString()} 
          label="Conquistas" 
          sublabel={`de ${data.stats.total}`}
          icon={Trophy}
          color="yellow"
        />
        <StatCard 
          value={`${data.stats.percentage}%`} 
          label="Completo" 
          sublabel="Progresso"
          icon={Target}
          color="blue"
        />
        <StatCard 
          value={data.stats.points.toString()} 
          label="Pontos" 
          sublabel="Totais"
          icon={Star}
          color="purple"
        />
        <StatCard 
          value={inProgressAchievements.length.toString()} 
          label="Em Progresso" 
          sublabel="Conquistas"
          icon={Zap}
          color="green"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold">Progresso Geral</span>
          <span className="text-slate-400">{data.stats.earned}/{data.stats.total}</span>
        </div>
        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.stats.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <button
            key={rarity}
            onClick={() => setSelectedRarity(rarity)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRarity === rarity
                ? 'bg-primary text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {rarity === 'all' ? 'Todas' : 
             rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            const colors = rarityColors[achievement.rarity];
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  achievement.earned 
                    ? `${colors.bg} ${colors.border}` 
                    : 'bg-slate-800/50 border-slate-700 opacity-75'
                }`}
              >
                {/* Earned Badge */}
                {achievement.earned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Locked Overlay */}
                {!achievement.earned && !achievement.progress && (
                  <div className="absolute inset-0 bg-slate-950/50 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-slate-600" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${achievement.earned ? 'text-white' : 'text-slate-400'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {achievement.description}
                    </p>

                    {/* Progress Bar */}
                    {achievement.progress !== undefined && achievement.max_progress && !achievement.earned && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progresso</span>
                          <span>{achievement.progress}/{achievement.max_progress}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.max_progress) * 100}%` }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Points & Rarity */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                        {achievement.points} XP
                      </span>
                      <span className={`text-xs capitalize ${colors.text}`}>
                        {achievement.rarity}
                      </span>
                    </div>

                    {/* Earned Date */}
                    {achievement.earned && achievement.earned_at && (
                      <p className="text-xs text-slate-500 mt-2">
                        Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Recently Earned Section */}
      {earnedAchievements.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Conquistadas Recentemente</h3>
          <div className="flex flex-wrap gap-3">
            {earnedAchievements
              .sort((a, b) => new Date(b.earned_at || 0).getTime() - new Date(a.earned_at || 0).getTime())
              .slice(0, 5)
              .map(achievement => {
                const Icon = iconMap[achievement.icon] || Trophy;
                const colors = rarityColors[achievement.rarity];
                
                return (
                  <div 
                    key={achievement.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}
                  >
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {achievement.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  value, 
  label, 
  sublabel, 
  icon: Icon,
  color 
}: { 
  value: string; 
  label: string; 
  sublabel: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-500/10 text-yellow-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-green-500/10 text-green-400'
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-xs text-slate-500">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}
