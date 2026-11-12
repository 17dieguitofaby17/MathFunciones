import React, { useState, useEffect } from 'react';
import { ExclusiveChallenge, StudentProfile } from '../types';
import { EXCLUSIVE_CHALLENGES } from '../data/exclusiveChallenges';
import { FunctionPlotter } from './FunctionPlotter';
import { MathFormula } from './MathFormula';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Flame, 
  Sparkles, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Trophy, 
  Shield, 
  Crown, 
  ArrowRight,
  Lightbulb,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';

interface ExclusiveChallengesViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onCheckBadges: (profile: StudentProfile) => void;
}

export const ExclusiveChallengesView: React.FC<ExclusiveChallengesViewProps> = ({
  profile,
  onUpdateProfile,
  onCheckBadges,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<'15:00' | '18:00'>('15:00');
  const [simulateAllUnlocked, setSimulateAllUnlocked] = useState<boolean>(true); // Enabled by default for easy evaluation
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentSecond = currentTime.getSeconds();

  // Natural unlock status based on clock
  const is15UnlockedNaturally = currentHour >= 15;
  const is18UnlockedNaturally = currentHour >= 18;

  const isSlotUnlocked = (slot: '15:00' | '18:00') => {
    if (simulateAllUnlocked) return true;
    if (slot === '15:00') return is15UnlockedNaturally;
    if (slot === '18:00') return is18UnlockedNaturally;
    return false;
  };

  // Find challenge for active slot
  const activeChallenge = EXCLUSIVE_CHALLENGES.find(c => c.slot === selectedSlot) || EXCLUSIVE_CHALLENGES[0];
  const isCompleted = !!profile.exclusiveChallengesCompleted[activeChallenge.id];

  // Count total exclusive completed
  const exclusiveCompletedCount = profile.stats.exclusiveCount || Object.keys(profile.exclusiveChallengesCompleted || {}).length;

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted || isCompleted) return;
    sound.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || hasSubmitted) return;

    const opt = activeChallenge.options.find(o => o.id === selectedOptionId);
    const isCorrect = !!opt?.isCorrect;

    setHasSubmitted(true);
    setShowExplanation(true);

    if (isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D47A1', '#DC2626', '#F59E0B', '#10B981']
      });

      const updatedCompleted = {
        ...profile.exclusiveChallengesCompleted,
        [activeChallenge.id]: {
          timestamp: Date.now(),
          score: activeChallenge.doubleXp,
          slot: activeChallenge.slot
        }
      };

      const updatedStats = {
        ...profile.stats,
        totalAnswered: profile.stats.totalAnswered + 1,
        totalCorrect: profile.stats.totalCorrect + 1,
        exclusiveCount: Object.keys(updatedCompleted).length,
      };

      if (activeChallenge.topic) {
        updatedStats.correctByTopic[activeChallenge.topic] = (updatedStats.correctByTopic[activeChallenge.topic] || 0) + 1;
      }

      const updatedProfile: StudentProfile = {
        ...profile,
        xp: profile.xp + activeChallenge.doubleXp,
        streak: profile.streak + 1,
        exclusiveChallengesCompleted: updatedCompleted,
        stats: updatedStats
      };

      onUpdateProfile(updatedProfile);
      onCheckBadges(updatedProfile);
    } else {
      sound.playIncorrect();
      const updatedStats = {
        ...profile.stats,
        totalAnswered: profile.stats.totalAnswered + 1,
      };

      const updatedProfile: StudentProfile = {
        ...profile,
        streak: 0,
        stats: updatedStats
      };

      onUpdateProfile(updatedProfile);
    }
  };

  // Time formatting
  const formattedTime = currentTime.toLocaleTimeString('es-EC', { hour12: false });

  // Calculate countdown to next slot
  const getNextCountdown = () => {
    let targetHour = 15;
    if (currentHour >= 15 && currentHour < 18) {
      targetHour = 18;
    } else if (currentHour >= 18) {
      targetHour = 39; // 15 + 24 (tomorrow 15:00)
    }
    const currentTotalSecs = currentHour * 3600 + currentMinute * 60 + currentSecond;
    const targetTotalSecs = targetHour * 3600;
    const diff = targetTotalSecs - currentTotalSecs;

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Double XP & Live Clock */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#B91C1C] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Doble Puntaje (2X XP) & Doble Participación</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Desafíos Exclusivos Programados (15h00 & 18h00)
            </h2>
            <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
              Ejercicios especiales de alto valor académico. Se activan diariamente a las <strong>15:00 pm</strong> y a las <strong>18:00 pm</strong>. ¡Colecciona 10, 20 y 30 desafíos para ganar insignias legendarias!
            </p>
          </div>

          {/* Clock Widget & Test Mode Switch */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-2 shrink-0">
            <div className="text-[10px] text-blue-200 uppercase font-semibold flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Hora del Sistema</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white tracking-wider">
              {formattedTime}
            </div>
            <div className="text-[11px] text-amber-300 font-semibold">
              Próximo Reto en: <span className="font-mono font-bold">{getNextCountdown()}</span>
            </div>

            {/* Test Mode Switch */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-center gap-2">
              <label className="text-[10px] text-blue-100 cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={simulateAllUnlocked}
                  onChange={(e) => setSimulateAllUnlocked(e.target.checked)}
                  className="rounded text-[#0D47A1] cursor-pointer"
                />
                <span>Modo Demostración (Desbloquear Ambos)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Collectible Badges Milestone Progress (10, 20, 30) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>Insignias Coleccionables por Desafíos Resueltos</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Has completado <strong>{exclusiveCompletedCount}</strong> desafíos exclusivos de las 15h00 y 18h00.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0D47A1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
            {exclusiveCompletedCount} / 30 Máximo
          </span>
        </div>

        {/* 3 Milestone Badges Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Milestone 1: 10 Desafíos */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
            exclusiveCompletedCount >= 10
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-400/40'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-75'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              exclusiveCompletedCount >= 10
                ? 'bg-[#B45309] text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              🥉
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Coleccionista Bronce
              </div>
              <div className="text-[10px] text-slate-500">Meta: 10 Desafíos (+300 XP)</div>
              {/* Mini progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (exclusiveCompletedCount / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestone 2: 20 Desafíos */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
            exclusiveCompletedCount >= 20
              ? 'border-slate-400 bg-slate-100/70 dark:bg-slate-800/60 ring-1 ring-slate-400/40'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-75'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              exclusiveCompletedCount >= 20
                ? 'bg-slate-400 text-slate-900 shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              🥈
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Coleccionista Plata
              </div>
              <div className="text-[10px] text-slate-500">Meta: 20 Desafíos (+600 XP)</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (exclusiveCompletedCount / 20) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestone 3: 30 Desafíos */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
            exclusiveCompletedCount >= 30
              ? 'border-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/30 ring-2 ring-yellow-400/60'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-75'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              exclusiveCompletedCount >= 30
                ? 'bg-[#F59E0B] text-slate-950 shadow-md animate-bounce'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              🥇
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Oro Legendario Marianita
              </div>
              <div className="text-[10px] text-slate-500">Meta: 30 Desafíos (+1200 XP)</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (exclusiveCompletedCount / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Selector: 15h00 vs 18h00 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedSlot('15:00');
            setSelectedOptionId(null);
            setHasSubmitted(false);
            setShowExplanation(false);
          }}
          className={`flex-1 p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            selectedSlot === '15:00'
              ? 'border-[#0D47A1] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#0D47A1]/30 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] dark:text-blue-400">
              ⏰ Franja 15h00 (Vespertina)
            </span>
            {isSlotUnlocked('15:00') ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Disponible</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Activa a las 15:00</span>
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Reto Vespertino · Doble Puntaje
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Composición & Funciones Racionales (+100 XP · +2 Participación)
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedSlot('18:00');
            setSelectedOptionId(null);
            setHasSubmitted(false);
            setShowExplanation(false);
          }}
          className={`flex-1 p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            selectedSlot === '18:00'
              ? 'border-[#DC2626] bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-[#DC2626]/30 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626] dark:text-rose-400">
              ⏰ Franja 18h00 (Crepuscular)
            </span>
            {isSlotUnlocked('18:00') ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Disponible</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Activa a las 18:00</span>
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Reto Crepuscular · Doble Puntaje
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Función Inversa & Parábolas (+100 XP · +2 Participación)
          </div>
        </button>
      </div>

      {/* Active Challenge Stage */}
      {isSlotUnlocked(selectedSlot) ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question & Options (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0D47A1] text-white">
                  {activeChallenge.slotName}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  {activeChallenge.topic}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>+{activeChallenge.doubleXp} XP (2X)</span>
                <span>·</span>
                <span>+{activeChallenge.participationPoints} Pts</span>
              </div>
            </div>

            {/* Formula Block */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Funciones Involucradas
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0D47A1] dark:text-blue-400 font-math">
                <MathFormula formula={activeChallenge.functionFormula} />
              </div>
              {activeChallenge.secondaryFormula && (
                <div className="text-base sm:text-lg font-bold text-[#DC2626] dark:text-rose-400 font-math">
                  <MathFormula formula={activeChallenge.secondaryFormula} />
                </div>
              )}
            </div>

            {/* Prompt */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeChallenge.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {activeChallenge.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (hasSubmitted) {
                  if (opt.isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/30';
                  } else {
                    optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#0D47A1] bg-blue-50/50 dark:bg-blue-950/30 text-[#0D47A1] dark:text-blue-300 ring-2 ring-[#0D47A1]/30';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={hasSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium leading-snug">{opt.text}</div>
                      {hasSubmitted && opt.explanationNote && (
                        <div className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                          {opt.explanationNote}
                        </div>
                      )}
                    </div>
                    {hasSubmitted && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {hasSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOptionId}
                  className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedOptionId
                      ? 'bg-[#0D47A1] hover:bg-blue-900 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Reclamar Doble Puntaje (+{activeChallenge.doubleXp} XP)</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  ¡Desafío completado! Has sumado participación y puntos dobles a tu récord.
                </div>
              )}
            </div>
          </div>

          {/* Right Zone: Graph & Step-by-Step (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Visualización Cartesiana del Reto</span>
                <span className="text-[10px] text-[#0D47A1] font-semibold">{activeChallenge.functionType}</span>
              </div>
              <FunctionPlotter
                config={activeChallenge.graphConfig}
                height={260}
                interactive={true}
              />
            </div>

            {showExplanation && (
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:to-slate-850 rounded-2xl p-5 border border-blue-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#0D47A1] dark:text-blue-400 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>{activeChallenge.stepByStepSolution.title}</span>
                </div>
                <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Desarrollo: </strong>
                    {activeChallenge.stepByStepSolution.formulaBreakdown}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Dominio & Rango: </strong>
                    {activeChallenge.stepByStepSolution.domainExplanation}
                  </p>
                  <div className="p-2.5 rounded-lg bg-blue-100/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#0D47A1] dark:text-blue-300 text-[11px] font-medium">
                    <span className="font-bold">Consejo Marianita: </span>
                    {activeChallenge.stepByStepSolution.pedagogicalTip}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Locked Slot Screen */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Este reto se activará a las {selectedSlot}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Conéctate a la hora programada para resolver el ejercicio en vivo y obtener el doble de puntos y participación.
            </p>
          </div>
          <button
            onClick={() => setSimulateAllUnlocked(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0D47A1] text-white cursor-pointer"
          >
            Activar Modo Prueba para Resolver Ahora
          </button>
        </div>
      )}
    </div>
  );
};
