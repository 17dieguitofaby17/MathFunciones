import React, { useState, useEffect } from 'react';
import { Question, StudentProfile, MathTopic } from '../types';
import { FunctionPlotter } from './FunctionPlotter';
import { MathFormula } from './MathFormula';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  RotateCcw, 
  Award, 
  Sparkles, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface ExamSimulatorProps {
  questions: Question[];
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onCheckBadges: (profile: StudentProfile) => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  questions,
  profile,
  onUpdateProfile,
  onCheckBadges,
}) => {
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60); // 15 mins
  const [isTimed, setIsTimed] = useState<boolean>(true);

  // Start exam
  const handleStartExam = () => {
    sound.playClick();
    // Select balanced questions and shuffle options A/B/C/D
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 8).map((q) => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random()),
    }));
    setSelectedQuestions(picked);
    setUserAnswers({});
    setCurrentIndex(0);
    setTimeLeftSeconds(12 * 60);
    setExamStarted(true);
    setExamFinished(false);
  };

  // Timer effect
  useEffect(() => {
    if (!examStarted || examFinished || !isTimed) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished, isTimed]);

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (examFinished) return;
    sound.playClick();
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleFinishExam = () => {
    setExamFinished(true);

    let correctCount = 0;
    const topicStats: Record<MathTopic, { correct: number; total: number }> = {
      tipo: { correct: 0, total: 0 },
      dominio: { correct: 0, total: 0 },
      rango: { correct: 0, total: 0 },
      cortes: { correct: 0, total: 0 },
      grafica: { correct: 0, total: 0 },
      integral: { correct: 0, total: 0 },
      composicion: { correct: 0, total: 0 },
      inversa: { correct: 0, total: 0 },
    };

    selectedQuestions.forEach((q) => {
      const selectedOptionId = userAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      const isCorrect = correctOpt && correctOpt.id === selectedOptionId;

      const tKey = q.topic as MathTopic;
      topicStats[tKey].total += 1;

      if (isCorrect) {
        correctCount += 1;
        topicStats[tKey].correct += 1;
      }
    });

    const scoreOutOf10 = Number(((correctCount / selectedQuestions.length) * 10).toFixed(1));

    if (scoreOutOf10 >= 7) {
      sound.playLevelUp();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#881337', '#D97706', '#1E3A8A']
      });
    } else {
      sound.playIncorrect();
    }

    const updatedProfile: StudentProfile = {
      ...profile,
      xp: profile.xp + correctCount * 30,
      stats: {
        ...profile.stats,
        examsTaken: profile.stats.examsTaken + 1,
        highestExamScore: Math.max(profile.stats.highestExamScore, scoreOutOf10),
      },
    };

    onUpdateProfile(updatedProfile);
    onCheckBadges(updatedProfile);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Evaluation results calculation
  const totalQuestions = selectedQuestions.length;
  const answeredCount = Object.keys(userAnswers).length;
  let correctCount = 0;
  if (examFinished) {
    selectedQuestions.forEach((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt && userAnswers[q.id] === correctOpt.id) {
        correctCount += 1;
      }
    });
  }
  const score = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(1)) : 0;

  const currentQ = selectedQuestions[currentIndex];

  return (
    <div className="space-y-6">
      {!examStarted ? (
        /* Welcome / Setup Screen */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[#881337] flex items-center justify-center mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Simulador de Evaluación de Funciones
            </h2>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-400 mt-1">
              Unidad Educativa Santa Mariana de Jesús · Riobamba
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Prepárate para tus evaluaciones quimestrales y pruebas de 2do de Bachillerato. El simulador presenta 8 preguntas aleatorias sobre Tipos de funciones, Dominio, Rango, Cortes con los ejes y Gráficas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Reactivos</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">8 Preguntas</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Tiempo</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">12 Minutos</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Escala</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Sobre 10.0 pts</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartExam}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#881337] hover:bg-rose-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Comenzar Evaluación
            </button>
          </div>
        </div>
      ) : !examFinished ? (
        /* Active Exam View */
        <div className="space-y-5">
          {/* Top Bar with Timer and Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pregunta {currentIndex + 1} de {selectedQuestions.length}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                Respondidas: {answeredCount}/{totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[#881337] dark:text-rose-300 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={handleFinishExam}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Entregar Evaluación
              </button>
            </div>
          </div>

          {/* Question Index Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {selectedQuestions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#881337] text-white ring-2 ring-[#881337]/30 shadow-sm'
                      : isAnswered
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Stage */}
          {currentQ && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Question & Options (7 Cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-[#881337]">
                    Tema: {currentQ.topic.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    Nivel {currentQ.level}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
                  <div className="text-xl font-bold font-math text-[#0D47A1] dark:text-blue-400">
                    <MathFormula formula={currentQ.functionFormula} />
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.prompt}
                </h3>

                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = userAnswers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#881337] bg-rose-50/50 dark:bg-rose-950/40 text-[#881337] dark:text-rose-300 ring-2 ring-[#881337]/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(selectedQuestions.length - 1, prev + 1))}
                    disabled={currentIndex === selectedQuestions.length - 1}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#881337] text-white disabled:opacity-40 cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              {/* Live Cartesian Plot (5 Cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gráfica de Referencia
                </div>
                <FunctionPlotter
                  config={currentQ.graphConfig}
                  height={250}
                  interactive={true}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Evaluation Results / Diagnostic Certificate */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          {/* Institutional Report Header */}
          <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-5 space-y-1">
            <img
              src="/MathFunciones/assets/aistudio/image_b65e9819.png"
              alt="Escudo"
              className="w-12 h-14 object-contain mx-auto mb-1"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs font-bold text-[#0D47A1] tracking-wider uppercase">
              Unidad Educativa "Santa Mariana de Jesús" · Riobamba
            </div>
            <div className="font-motto text-amber-600 dark:text-amber-400 font-bold text-base">
              "Ternura que acompaña, Firmeza que transforma"
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Informe de Evaluación: MATHFUNCIONES
            </h2>
            <div className="text-xs text-slate-500">
              Estudiante: <strong>{profile.name}</strong> · Curso: <strong>{profile.course}</strong>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/60 via-amber-50/40 to-blue-50/40 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Calificación Obtenida
            </div>
            <div className="text-4xl sm:text-5xl font-black font-math text-[#0D47A1] dark:text-blue-400">
              {score} <span className="text-xl font-normal text-slate-500">/ 10.0</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {score >= 9 ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ★ ¡Excelente Dominio de Funciones! Desempeño Sobresaliente.
                </span>
              ) : score >= 7 ? (
                <span className="text-blue-700 dark:text-blue-400 font-bold">
                  ✓ Nivel Aceptable Alcanzado. Buen trabajo con margen de perfeccionamiento.
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  ▲ Requiere refuerzo pedagógico en Dominios y Puntos de Corte.
                </span>
              )}
            </div>
          </div>

          {/* Results per Question Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Revisión Detallada por Reactivo
            </h3>
            <div className="space-y-2">
              {selectedQuestions.map((q, idx) => {
                const userOptId = userAnswers[q.id];
                const correctOpt = q.options.find((o) => o.isCorrect);
                const isCorrect = correctOpt && correctOpt.id === userOptId;

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {idx + 1}. {q.prompt}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Función: <span className="font-math font-semibold">{q.functionFormula}</span> · Correcta: {correctOpt?.text}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={handleStartExam}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0D47A1] hover:bg-blue-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer no-print"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar con Nuevos Ejercicios</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
