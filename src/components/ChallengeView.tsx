import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  Check, 
  Flame, 
  BookOpen, 
  Lightbulb 
} from 'lucide-react';
import { Question, StudentProfile, MathTopic } from '../types';
import { FunctionPlotter } from './FunctionPlotter';
import { MathFormula } from './MathFormula';
import { sound } from '../utils/audio';

interface ChallengeViewProps {
  questions: Question[];
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onCheckBadges: (profile: StudentProfile) => void;
}

const LEVEL_INFO = [
  { level: 1, title: 'Nivel 1: Rectas, Lineales & Afines', desc: 'Pendientes, ordenadas al origen, cortes (x,0) y (0,y)', icon: '📐' },
  { level: 2, title: 'Nivel 2: Cuadráticas & Parábolas', desc: 'Vértice (h,k), concavidad, discriminante y rango acotado', icon: '⚡' },
  { level: 3, title: 'Nivel 3: Racionales & Radicales', desc: 'Asíntotas verticales/horizontales y raíces pares ≥ 0', icon: '🔍' },
  { level: 4, title: 'Nivel 4: Exponenciales & Logaritmos', desc: 'Curvas de crecimiento, base e inversa, asíntotas', icon: '🚀' },
  { level: 5, title: 'Nivel 5: Valor Absoluto & Por Partes', desc: 'Vértice en V y condiciones por intervalos', icon: '🧩' },
  { level: 6, title: 'Nivel 6: Desafío Maestro Integrador', desc: 'Análisis global completo tipo evaluación quimestral', icon: '👑' },
];

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  questions,
  profile,
  onUpdateProfile,
  onCheckBadges,
}) => {
  const [activeLevel, setActiveLevel] = useState<number>(profile.unlockedLevel || 1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Filter questions for active level
  const levelQuestions = questions.filter((q) => q.level === activeLevel);
  const activeQuestion = levelQuestions[currentQuestionIndex] || levelQuestions[0];

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    sound.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !activeQuestion || hasSubmitted) return;

    const selectedOption = activeQuestion.options.find((o) => o.id === selectedOptionId);
    const isCorrect = !!selectedOption?.isCorrect;

    setHasSubmitted(true);
    setShowExplanation(true);

    let newStreak = profile.streak;
    let earnedXp = 0;
    const currentCompleted = { ...profile.completedQuestions };
    const currentStats = { ...profile.stats };

    currentStats.totalAnswered += 1;
    const topicKey = activeQuestion.topic as MathTopic;
    currentStats.totalByTopic[topicKey] = (currentStats.totalByTopic[topicKey] || 0) + 1;

    if (isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#881337', '#1E3A8A', '#D97706', '#10B981']
      });

      newStreak += 1;
      // Multiplier based on streak
      const multiplier = newStreak >= 5 ? 1.5 : newStreak >= 3 ? 1.2 : 1.0;
      earnedXp = Math.round(activeQuestion.xpReward * multiplier);

      currentStats.totalCorrect += 1;
      currentStats.correctByTopic[topicKey] = (currentStats.correctByTopic[topicKey] || 0) + 1;

      currentCompleted[activeQuestion.id] = {
        correct: true,
        attempts: (currentCompleted[activeQuestion.id]?.attempts || 0) + 1,
        timestamp: Date.now()
      };

      // Check level unlock condition: if solved at least 2 questions in current level, unlock next!
      let newUnlockedLevel = profile.unlockedLevel;
      if (activeLevel === profile.unlockedLevel && activeLevel < 6) {
        const solvedInLevel = levelQuestions.filter(q => currentCompleted[q.id]?.correct).length + 1;
        if (solvedInLevel >= Math.min(2, levelQuestions.length)) {
          newUnlockedLevel = activeLevel + 1;
          sound.playLevelUp();
        }
      }

      const updatedProfile: StudentProfile = {
        ...profile,
        xp: profile.xp + earnedXp,
        streak: newStreak,
        unlockedLevel: newUnlockedLevel,
        completedQuestions: currentCompleted,
        stats: currentStats,
      };

      onUpdateProfile(updatedProfile);
      onCheckBadges(updatedProfile);
    } else {
      sound.playIncorrect();
      newStreak = 0;

      currentCompleted[activeQuestion.id] = {
        correct: false,
        attempts: (currentCompleted[activeQuestion.id]?.attempts || 0) + 1,
        timestamp: Date.now()
      };

      const updatedProfile: StudentProfile = {
        ...profile,
        streak: 0,
        completedQuestions: currentCompleted,
        stats: currentStats,
      };

      onUpdateProfile(updatedProfile);
      onCheckBadges(updatedProfile);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setShowExplanation(false);

    if (currentQuestionIndex + 1 < levelQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Loop back to start of level or invite to next level
      setCurrentQuestionIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Selector Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ruta de Aprendizaje Marianita</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#0D47A1] dark:bg-blue-950 dark:text-blue-300">
                6 Niveles Progresivos
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desbloquea cada nivel resolviendo desafíos de tipos de funciones, dominios, rangos y gráficas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Nivel Actual:</span>
            <span className="px-2 py-1 rounded bg-[#0D47A1] text-white font-mono">
              {profile.unlockedLevel} / 6
            </span>
          </div>
        </div>

        {/* Level Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {LEVEL_INFO.map((item) => {
            const isUnlocked = item.level <= profile.unlockedLevel;
            const isActive = activeLevel === item.level;
            const completedCount = questions.filter(
              (q) => q.level === item.level && profile.completedQuestions[q.id]?.correct
            ).length;

            return (
              <button
                key={item.level}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    setActiveLevel(item.level);
                    setCurrentQuestionIndex(0);
                    setSelectedOptionId(null);
                    setHasSubmitted(false);
                    setShowExplanation(false);
                  }
                }}
                disabled={!isUnlocked}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isActive
                    ? 'border-[#0D47A1] bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-[#0D47A1]/30 shadow-sm'
                    : isUnlocked
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    : 'border-slate-200/50 dark:border-slate-800/40 bg-slate-50/60 dark:bg-slate-950/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">{item.icon}</span>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : completedCount > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <Check className="w-3 h-3 inline mr-0.5" />
                      {completedCount}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  Nivel {item.level}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {item.title.split(':')[1] || item.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Challenge Card */}
      {activeQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Question & Interactive Options (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0D47A1] text-white">
                  Nivel {activeQuestion.level}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {activeQuestion.topic}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ejercicio {currentQuestionIndex + 1} de {levelQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{activeQuestion.xpReward} XP</span>
              </div>
            </div>

            {/* Function Formula Display */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Función a Analizar
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0D47A1] dark:text-blue-400 font-math tracking-wide">
                <MathFormula formula={activeQuestion.functionFormula} />
              </div>
              {activeQuestion.secondaryFormula && (
                <div className="text-base sm:text-lg font-bold text-[#DC2626] dark:text-rose-400 font-math mt-1">
                  <MathFormula formula={activeQuestion.secondaryFormula} />
                </div>
              )}
              <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span>Tipo: <strong>{activeQuestion.functionType}</strong></span>
                <span>·</span>
                <span>Dificultad: <strong>{activeQuestion.difficulty}</strong></span>
              </div>
            </div>

            {/* Question Prompt */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {activeQuestion.prompt}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (hasSubmitted) {
                  if (option.isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/30';
                  } else {
                    optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#881337] bg-rose-50/50 dark:bg-rose-950/30 text-[#881337] dark:text-rose-300 ring-2 ring-[#881337]/30';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={hasSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium leading-snug">{option.text}</div>
                      {hasSubmitted && option.explanationNote && (
                        <div className="text-xs mt-1.5 text-slate-600 dark:text-slate-400">
                          {option.explanationNote}
                        </div>
                      )}
                    </div>
                    {hasSubmitted && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {hasSubmitted && isSelected && !option.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedOptionId
                      ? 'bg-[#0D47A1] hover:bg-blue-900 text-white shadow-md hover:shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Verificar Respuesta</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-[#DC2626] hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar al Siguiente Ejercicio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Zone: Interactive Graph & Step-by-Step Explanation (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Graph of the Exercise */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Visualizador Cartesiano en Vivo
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {activeQuestion.functionFormula}
                </span>
              </div>

              <FunctionPlotter
                config={activeQuestion.graphConfig}
                height={260}
                interactive={true}
              />

              {/* Functional Attributes Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Dominio</div>
                  <div className="font-math font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {activeQuestion.domain}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Rango</div>
                  <div className="font-math font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {activeQuestion.range}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Corte con Eje Y</div>
                  <div className="font-math font-bold text-rose-800 dark:text-rose-400 text-xs">
                    {activeQuestion.yIntercept}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Cortes con Eje X</div>
                  <div className="font-math font-bold text-emerald-800 dark:text-emerald-400 text-xs truncate">
                    {activeQuestion.xIntercepts.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Pedagogical Explanation Card */}
            {showExplanation && (
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-rose-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 rounded-2xl p-5 border border-amber-200 dark:border-slate-700 shadow-sm space-y-3.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{activeQuestion.stepByStepSolution.title}</span>
                </div>

                <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Procedimiento: </strong>
                    {activeQuestion.stepByStepSolution.formulaBreakdown}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Dominio & Rango: </strong>
                    {activeQuestion.stepByStepSolution.domainExplanation} {activeQuestion.stepByStepSolution.rangeExplanation}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Cortes con Ejes: </strong>
                    {activeQuestion.stepByStepSolution.interceptsExplanation}
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-[11px] font-medium flex items-start gap-2">
                    <span className="font-bold shrink-0">Consejo Marianita:</span>
                    <span>{activeQuestion.stepByStepSolution.pedagogicalTip}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          No hay ejercicios disponibles en este nivel.
        </div>
      )}
    </div>
  );
};
