import React from 'react';
import { BADGES } from '../data/badges';
import { StudentProfile } from '../types';
import { 
  X, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  Crosshair, 
  Activity, 
  Maximize2, 
  Divide, 
  Zap, 
  Layers, 
  Flame, 
  Crown,
  Compass,
  Medal,
  Shield,
  HeartHandshake,
  GitMerge,
  Repeat
} from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Crosshair: <Crosshair className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Maximize2: <Maximize2 className="w-5 h-5" />,
  Divide: <Divide className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Medal: <Medal className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  GitMerge: <GitMerge className="w-5 h-5" />,
  Repeat: <Repeat className="w-5 h-5" />,
};

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  if (!isOpen) return null;

  const unlockedSet = new Set(profile.unlockedBadges);
  const totalBadges = BADGES.length;
  const unlockedCount = profile.unlockedBadges.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_b65e9819.png"
              alt="Escudo"
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Insignias Coleccionables Marianitas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Desbloqueadas: <strong>{unlockedCount} de {totalBadges}</strong> insignias · Lema: <em>"Ternura que acompaña, Firmeza que transforma"</em>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const icon = ICON_MAP[badge.iconName] || <Award className="w-5 h-5" />;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'border-blue-300 dark:border-blue-800/80 bg-gradient-to-br from-blue-50/50 to-amber-50/30 dark:from-slate-900 dark:to-slate-850 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-[#0D47A1] text-amber-300 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? icon : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {badge.title}
                    </h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">+{badge.xpReward} XP</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-right pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D47A1] text-white hover:bg-blue-900 cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
