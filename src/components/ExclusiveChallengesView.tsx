import React, { useState, useEffect, useMemo } from 'react';
import { ExclusiveChallenge, StudentProfile } from '../types';
import { EXCLUSIVE_CHALLENGES } from '../data/exclusiveChallenges';
import { FunctionPlotter } from './FunctionPlotter';
import { MathFormula } from './MathFormula';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Lightbulb,
  Zap,
  PenTool,
  EyeOff,
  RotateCcw,
  Check
} from 'lucide-react';

interface ExclusiveChallengesViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onCheckBadges: (profile: StudentProfile) => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ExclusiveChallengesView: React.FC<ExclusiveChallengesViewProps> = ({
  profile,
  onUpdateProfile,
  onCheckBadges,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<'15:00' | '18:00'>('15:00');
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState<number>(0);
  const [simulateAllUnlocked, setSimulateAllUnlocked] = useState<boolean>(false);

  // Per-rubric-step answers: { dominio: 'r_opt_...', asintotas: '...', ... }
  const [rubricAnswers, setRubricAnswers] = useState<Record<string, string>>({});
  const [developmentNotes, setDevelopmentNotes] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [earnedRubricScore, setEarnedRubricScore] = useState<number>(0);
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentSecond = currentTime.getSeconds();

  const is15UnlockedNaturally = currentHour >= 15;
  const is18UnlockedNaturally = currentHour >= 18;

  const isSlotUnlocked = (slot: '15:00' | '18:00') => {
    if (profile.isTeacher || simulateAllUnlocked) return true;
    if (slot === '15:00') return is15UnlockedNaturally;
    if (slot === '18:00') return is18UnlockedNaturally;
    return false;
  };

  const slotChallenges = useMemo(
    () => EXCLUSIVE_CHALLENGES.filter((c) => c.slot === selectedSlot),
    [selectedSlot]
  );

  const rawChallenge: ExclusiveChallenge =
    slotChallenges[selectedChallengeIndex] || slotChallenges[0];

  // Dynamically shuffle A/B/C/D options inside each rubric step
  const activeChallenge: ExclusiveChallenge = useMemo(() => {
    return {
      ...rawChallenge,
      rubricSteps: rawChallenge.rubricSteps.map((step) => ({
        ...step,
        options: shuffleArray(step.options),
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawChallenge.id, shuffleSeed]);

  const isCompletedPreviously = !!profile.exclusiveChallengesCompleted[activeChallenge.id];
  const exclusiveCompletedCount =
    profile.stats.exclusiveCount || Object.keys(profile.exclusiveChallengesCompleted || {}).length;

  const resetFormState = () => {
    setRubricAnswers({});
    setDevelopmentNotes('');
    setHasSubmitted(false);
    setEarnedRubricScore(0);
    setShuffleSeed(Date.now());
  };

  const handleSelectRubricOption = (stepId: string, optionId: string) => {
    if (hasSubmitted) return;
    sound.playClick();
    setRubricAnswers((prev) => ({ ...prev, [stepId]: optionId }));
  };

  const allStepsAnswered =
    activeChallenge.rubricSteps.every((step) => Boolean(rubricAnswers[step.id]));

  const handleSubmitRubric = () => {
    if (!allStepsAnswered || hasSubmitted) return;

    let totalPoints = 0;
    activeChallenge.rubricSteps.forEach((step) => {
      const chosenId = rubricAnswers[step.id];
      const opt = step.options.find((o) => o.id === chosenId);
      if (opt?.isCorrect) {
        totalPoints += step.maxPoints;
      }
    });

    const roundedPoints = Number(totalPoints.toFixed(2));
    setEarnedRubricScore(roundedPoints);
    setHasSubmitted(true);

    const passed = roundedPoints >= 1.75; // >= 70% of 2.50 points

    if (passed) {
      sound.playCorrect();
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0D47A1', '#DC2626', '#F59E0B', '#10B981'],
      });

      const alreadyDone = !!profile.exclusiveChallengesCompleted[activeChallenge.id];
      const updatedCompleted = {
        ...profile.exclusiveChallengesCompleted,
        [activeChallenge.id]: {
          timestamp: Date.now(),
          score: roundedPoints,
          slot: activeChallenge.slot,
        },
      };

      const xpToAdd = alreadyDone ? 0 : activeChallenge.doubleXp;
      const updatedStats = {
        ...profile.stats,
        totalAnswered: profile.stats.totalAnswered + 1,
        totalCorrect: profile.stats.totalCorrect + 1,
        exclusiveCount: Object.keys(updatedCompleted).length,
      };
      if (activeChallenge.topic) {
        updatedStats.correctByTopic[activeChallenge.topic] =
          (updatedStats.correctByTopic[activeChallenge.topic] || 0) + 1;
      }

      const updatedProfile: StudentProfile = {
        ...profile,
        xp: profile.xp + xpToAdd,
        streak: profile.streak + 1,
        exclusiveChallengesCompleted: updatedCompleted,
        stats: updatedStats,
      };

      onUpdateProfile(updatedProfile);
      onCheckBadges(updatedProfile);
    } else {
      sound.playIncorrect();
      const updatedProfile: StudentProfile = {
        ...profile,
        streak: 0,
        stats: {
          ...profile.stats,
          totalAnswered: profile.stats.totalAnswered + 1,
        },
      };
      onUpdateProfile(updatedProfile);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('es-EC', { hour12: false });

  const getNextCountdown = () => {
    let targetHour = 15;
    if (currentHour >= 15 && currentHour < 18) {
      targetHour = 18;
    } else if (currentHour >= 18) {
      targetHour = 39;
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#B91C1C] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Evaluación Analítica Detallada · Doble Puntaje (2X XP)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Desafíos Exclusivos Programados (15h00 pm & 18h00 pm)
            </h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Ejercicios de <strong>2,50 puntos</strong> que requieren desarrollo analítico completo (sin gráfica visible hasta resolver). Completa <strong>Dominio, Asíntotas, Ceros/Cortes, Rango, Intervalos C⁺/C⁻ y Gráfica</strong>. ¡Colecciona 10, 20 y 30 retos!
            </p>
          </div>

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

            {!profile.isTeacher ? (
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-center gap-2">
                <label className="text-[10px] text-blue-100 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={simulateAllUnlocked}
                    onChange={(e) => setSimulateAllUnlocked(e.target.checked)}
                    className="rounded text-[#0D47A1] cursor-pointer"
                  />
                  <span>Modo Práctica Libre</span>
                </label>
              </div>
            ) : (
              <div className="pt-1 border-t border-white/10 text-[10px] font-bold text-emerald-300">
                ✓ Desbloqueo Total Docente
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Badges 10 / 20 / 30 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>Insignias Coleccionables por Desafíos Resueltos (15 por Franja · 30 Total)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Has aprobado <strong>{exclusiveCompletedCount}</strong> desafíos exclusivos con desarrollo completo.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0D47A1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
            {exclusiveCompletedCount} / 30 Completados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${exclusiveCompletedCount >= 10 ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-80'}`}>
            <div className="w-10 h-10 rounded-xl bg-[#B45309] text-white flex items-center justify-center text-lg shrink-0">🥉</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Coleccionista Bronce</div>
              <div className="text-[10px] text-slate-500">Meta: 10 Desafíos (+300 XP)</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.min(100, (exclusiveCompletedCount / 10) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${exclusiveCompletedCount >= 20 ? 'border-slate-400 bg-slate-100/70 dark:bg-slate-800/60' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-80'}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-400 text-slate-900 flex items-center justify-center text-lg shrink-0">🥈</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Coleccionista Plata</div>
              <div className="text-[10px] text-slate-500">Meta: 20 Desafíos (+600 XP)</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: `${Math.min(100, (exclusiveCompletedCount / 20) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${exclusiveCompletedCount >= 30 ? 'border-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-80'}`}>
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-slate-950 flex items-center justify-center text-lg shrink-0">🥇</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Oro Legendario Marianita</div>
              <div className="text-[10px] text-slate-500">Meta: 30 Desafíos (+1200 XP)</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(100, (exclusiveCompletedCount / 30) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Selector: 15h00 vs 18h00 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedSlot('15:00');
            setSelectedChallengeIndex(0);
            resetFormState();
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedSlot === '15:00'
              ? 'border-[#0D47A1] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#0D47A1]/30 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] dark:text-blue-400">
              ⏰ Franja 15h00 pm (Vespertina)
            </span>
            {isSlotUnlocked('15:00') ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Disponible
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Activa a las 15:00
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            15 Retos Analíticos de Desarrollo (2,50 pts c/u)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Incluye Exponenciales, Logarítmicas, Racionales y Valor Absoluto
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedSlot('18:00');
            setSelectedChallengeIndex(0);
            resetFormState();
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedSlot === '18:00'
              ? 'border-[#DC2626] bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-[#DC2626]/30 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626] dark:text-rose-400">
              ⏰ Franja 18h00 pm (Crepuscular)
            </span>
            {isSlotUnlocked('18:00') ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Disponible
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Activa a las 18:00
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            15 Retos Crepusculares de Desarrollo (2,50 pts c/u)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Análisis completo con Rúbrica · +2 Participación & Doble XP
          </div>
        </button>
      </div>

      {/* Active Challenge Stage */}
      {isSlotUnlocked(selectedSlot) ? (
        <div className="space-y-5">
          {/* 15-Challenge Index Strip */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Selecciona Ejercicio de la Franja {selectedSlot} (15 problemas analíticos):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {slotChallenges.map((c, idx) => {
                const done = !!profile.exclusiveChallengesCompleted[c.id];
                const isActive = idx === selectedChallengeIndex;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedChallengeIndex(idx);
                      resetFormState();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#0D47A1] text-white shadow-sm ring-2 ring-[#0D47A1]/30'
                        : done
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {done && <Check className="w-3 h-3" />}
                    <span>Reto #{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Analytical Development Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Problem, Blank Development Notebook & 6-Step Rubric */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0D47A1] text-white">
                    {activeChallenge.slotName}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    (2,50 Puntos)
                  </span>
                  {isCompletedPreviously && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ Aprobado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>+{activeChallenge.doubleXp} XP (2X)</span>
                  <span>·</span>
                  <span>+{activeChallenge.participationPoints} Pts</span>
                </div>
              </div>

              {/* Function Statement */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Analice y Grafique la siguiente función
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D47A1] dark:text-blue-400 font-math py-1">
                  <MathFormula formula={activeChallenge.functionFormula} />
                </div>
                <div className="text-xs text-slate-500">
                  Tipo: <strong>{activeChallenge.functionType}</strong> · No se puede resolver a simple vista
                </div>
              </div>

              {/* Blank Workspace / Development Notebook */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#0D47A1]" />
                  <span>Espacio en Blanco para Desarrollo Paso a Paso (Borrador de Procedimiento):</span>
                </label>
                <textarea
                  value={developmentNotes}
                  onChange={(e) => setDevelopmentNotes(e.target.value)}
                  disabled={hasSubmitted}
                  rows={4}
                  placeholder="Desarrolla aquí tu procedimiento:&#10;1) Dominio y restricciones...&#10;2) Asíntotas (A.V. / A.H.)...&#10;3) Cortes con X e Y (f(x)=0, f(0))...&#10;4) Rango e intervalos C⁺ y C⁻..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D47A1] leading-relaxed"
                />
              </div>

              {/* 6-Part Analytical Rubric Steps */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Evaluación Analítica por Rúbrica (6 Criterios = 2,50 Puntos)
                </div>

                {activeChallenge.rubricSteps.map((step) => {
                  const chosenId = rubricAnswers[step.id];
                  return (
                    <div
                      key={step.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#0D47A1] dark:text-blue-400">
                          {step.prompt}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300 shrink-0">
                          {step.maxPoints.toFixed(2).replace('.', ',')} P
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {step.options.map((opt, oIdx) => {
                          const isSelected = chosenId === opt.id;
                          let optClass =
                            'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-800 dark:text-slate-200';
                          if (hasSubmitted) {
                            if (opt.isCorrect) {
                              optClass =
                                'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/40';
                            } else if (isSelected && !opt.isCorrect) {
                              optClass =
                                'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500/40';
                            } else {
                              optClass = 'opacity-50 border-slate-200 dark:border-slate-800';
                            }
                          } else if (isSelected) {
                            optClass =
                              'border-[#0D47A1] bg-blue-50 dark:bg-blue-950/40 text-[#0D47A1] dark:text-blue-300 ring-2 ring-[#0D47A1]/30';
                          }

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectRubricOption(step.id, opt.id)}
                              disabled={hasSubmitted}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${optClass}`}
                            >
                              <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 text-slate-700 dark:text-slate-300">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold leading-snug">{opt.text}</div>
                                {hasSubmitted && opt.explanationNote && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    {opt.explanationNote}
                                  </div>
                                )}
                              </div>
                              {hasSubmitted && opt.isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                              {hasSubmitted && isSelected && !opt.isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit / Result Bar */}
              <div className="pt-2 space-y-3">
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitRubric}
                    disabled={!allStepsAnswered}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      allStepsAnswered
                        ? 'bg-[#0D47A1] hover:bg-blue-900 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>
                      {allStepsAnswered
                        ? `Calificar Desarrollo Completo (+${activeChallenge.doubleXp} XP)`
                        : `Completa los 6 pasos de la rúbrica (${Object.keys(rubricAnswers).length}/6)`}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-xl border text-center space-y-1 ${
                        earnedRubricScore >= 1.75
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="text-sm font-black">
                        Nota Obtenida en Rúbrica: {earnedRubricScore.toFixed(2).replace('.', ',')} / 2,50 Puntos
                      </div>
                      <div className="text-xs">
                        {earnedRubricScore >= 1.75
                          ? '¡Excelente desarrollo analítico! Gráfica desbloqueada y puntos dobles sumados.'
                          : 'Necesitas al menos 1,75 / 2,50 puntos para aprobar. Revisa la gráfica y vuelve a intentarlo.'}
                      </div>
                    </div>

                    <button
                      onClick={resetFormState}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reintentar con Alternativas Barajadas</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Rubric Table + Blind Graph Gate + Full Solution */}
            <div className="lg:col-span-5 space-y-4">
              {/* Official Rubric Table (Matching Reference Image) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                <div className="text-xs font-extrabold text-center text-slate-900 dark:text-white">
                  Rúbrica de Calificación de Cada Ejercicio (2,50 P)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-left">Descripción</th>
                        <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center">100%</th>
                        <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center">50%</th>
                        <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-center">25%</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-300">
                      {[
                        ['Dominio', '0,25 P', '0,13 P', '0,06 P'],
                        ['Asíntotas', '0,25 P', '0,13 P', '0,06 P'],
                        ['Ceros – Raíces o P.C. Ejes', '1 P', '0,5 P', '0,25 P'],
                        ['Rango', '0,25 P', '0,13 P', '0,06 P'],
                        ['Intervalos de C⁺ y C⁻', '0,25 P', '0,13 P', '0,06 P'],
                        ['Gráfica', '0,5 P', '0,25 P', '0,13 P'],
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-200 dark:border-slate-800 px-2 py-1 font-semibold">{row[0]}</td>
                          <td className="border border-slate-200 dark:border-slate-800 px-2 py-1 text-center font-mono">{row[1]}</td>
                          <td className="border border-slate-200 dark:border-slate-800 px-2 py-1 text-center font-mono">{row[2]}</td>
                          <td className="border border-slate-200 dark:border-slate-800 px-2 py-1 text-center font-mono">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blind Graph Panel: Hidden until submitted so it cannot be solved at a glance */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Visualización Cartesiana de Comprobación</span>
                  <span className="text-[10px] text-[#0D47A1] font-semibold">{activeChallenge.functionType}</span>
                </div>

                {hasSubmitted ? (
                  <FunctionPlotter
                    config={activeChallenge.graphConfig}
                    height={260}
                    interactive={true}
                  />
                ) : (
                  <div className="h-[240px] rounded-xl bg-slate-100/80 dark:bg-slate-950/70 border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center">
                      <EyeOff className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Gráfica Oculta Durante el Análisis
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      Para evitar respuestas a simple vista, realiza el desarrollo analítico en los 6 criterios de la izquierda. La gráfica interactiva se desbloqueará al calificar.
                    </p>
                  </div>
                )}
              </div>

              {/* Full Analytical Solution after submission */}
              {hasSubmitted && (
                <div className="bg-gradient-to-br from-blue-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-5 border border-blue-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#0D47A1] dark:text-blue-400 font-bold text-sm">
                    <Lightbulb className="w-4 h-4" />
                    <span>{activeChallenge.stepByStepSolution.title}</span>
                  </div>
                  <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    <p>
                      <strong className="text-slate-900 dark:text-white">Desarrollo Analítico: </strong>
                      {activeChallenge.stepByStepSolution.formulaBreakdown}
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-white">Cortes e Intervalos: </strong>
                      {activeChallenge.stepByStepSolution.interceptsExplanation}{' '}
                      {activeChallenge.stepByStepSolution.graphObservation}
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
        </div>
      ) : (
        /* Locked Slot Screen */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Este desafío se activará a las {selectedSlot} pm
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Conéctate a las <strong>15:00 pm</strong> o <strong>18:00 pm</strong> para resolver los retos analíticos detallados de 2,50 puntos y obtener Doble Puntaje.
            </p>
          </div>
          <button
            onClick={() => setSimulateAllUnlocked(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0D47A1] text-white cursor-pointer hover:bg-blue-900 transition-colors"
          >
            Activar Modo Práctica Libre para Resolver Ahora
          </button>
        </div>
      )}
    </div>
  );
};
