import React from 'react';
import { Flame, Award, Cloud, CloudOff, Zap, BarChart3, BookOpen, Database, Sparkles, GraduationCap } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  currentTab: 'challenges' | 'exclusive' | 'lab' | 'exam' | 'bank' | 'leaderboard' | 'teacher';
  setCurrentTab: (tab: 'challenges' | 'exclusive' | 'lab' | 'exam' | 'bank' | 'leaderboard' | 'teacher') => void;
  profile: StudentProfile;
  onOpenBadges: () => void;
  onOpenSync: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  onOpenBadges,
  onOpenSync,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-950/15 dark:border-blue-900/40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      {/* Top Institutional Strip */}
      <div className="bg-[#0D47A1] text-white px-4 py-1.5 text-center text-[11px] font-medium tracking-wide flex items-center justify-between shadow-inner">
        <div className="hidden sm:flex items-center gap-2 text-blue-100 font-semibold">
          <span>U.E. "SANTA MARIANA DE JESÚS" · RIOBAMBA</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-2">
          <span className="text-amber-300 font-bold font-motto text-sm sm:text-base tracking-wide">
            "Ternura que acompaña, Firmeza que transforma"
          </span>
        </div>
        <button
          onClick={onOpenSync}
          className="hidden sm:flex items-center gap-1.5 text-xs text-blue-100 hover:text-white transition-colors cursor-pointer"
          title="Estado de conexión y respaldo"
        >
          {isOnline ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px]">Conectado</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px]">Modo Offline</span>
            </>
          )}
        </button>
      </div>

      {/* Main Top Bar: Official Shield - Brand MATHFUNCIONES - Navigation - Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone with Official Crest */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/MathFunciones/assets/aistudio/image_b65e9819.png"
            alt="Escudo Oficial Santa Mariana de Jesús"
            className="w-10 h-11 object-contain drop-shadow-sm shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight text-[#0D47A1] dark:text-blue-400 whitespace-nowrap">
              MATH<span className="text-[#DC2626]">FUNCIONES</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold -mt-1 hidden sm:block">
              2do BGU & 2do Técnico · Mgs. Diego Aulla
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('challenges')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'challenges'
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Niveles</span>
          </button>

          {/* Exclusive Challenges Tab with 2X Badge */}
          <button
            onClick={() => setCurrentTab('exclusive')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'exclusive'
                ? 'bg-[#DC2626] text-white shadow-sm ring-2 ring-[#DC2626]/30'
                : 'text-[#DC2626] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Retos 15h & 18h (2X)</span>
          </button>

          <button
            onClick={() => setCurrentTab('lab')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'lab'
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laboratorio</span>
          </button>

          <button
            onClick={() => setCurrentTab('exam')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'exam'
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Simulador</span>
          </button>

          <button
            onClick={() => setCurrentTab('bank')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'bank'
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Banco</span>
          </button>

          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'leaderboard'
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Clasificación</span>
          </button>

          {/* Teacher Monitoring Panel Tab */}
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'teacher'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-900'
            }`}
            title="Panel de Monitoreo Docente en Tiempo Real"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Panel Docente</span>
          </button>
        </nav>

        {/* Action / Student Profile Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {profile.isTeacher ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-sm ring-2 ring-amber-300">
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>Docente: Mgs. Diego Aulla</span>
            </div>
          ) : (
            <>
              {/* Streak Flame */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold"
                title={`Racha actual: ${profile.streak} respuestas correctas`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span className="font-mono tabular-nums">{profile.streak}</span>
              </div>

              {/* XP Pill */}
              <div
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#0D47A1] dark:text-blue-300 text-xs font-black"
                title="Puntos de experiencia acumulados"
              >
                <span className="text-amber-500 font-mono">✦</span>
                <span className="font-mono tabular-nums">{profile.xp}</span>
                <span className="text-[10px] text-slate-500 font-semibold">XP</span>
              </div>
            </>
          )}

          {/* Badges Button */}
          <button
            onClick={onOpenBadges}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Insignias y logros coleccionables"
          >
            <Award className="w-4 h-4 text-[#F59E0B]" />
            {profile.unlockedBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {profile.unlockedBadges.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setCurrentTab('challenges')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${
            currentTab === 'challenges' ? 'bg-[#0D47A1] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Niveles
        </button>
        <button
          onClick={() => setCurrentTab('exclusive')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'exclusive' ? 'bg-[#DC2626] text-white' : 'text-[#DC2626] font-bold'
          }`}
        >
          <Zap className="w-3 h-3 fill-amber-300" />
          <span>Retos 2X</span>
        </button>
        <button
          onClick={() => setCurrentTab('lab')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${
            currentTab === 'lab' ? 'bg-[#0D47A1] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Lab
        </button>
        <button
          onClick={() => setCurrentTab('exam')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${
            currentTab === 'exam' ? 'bg-[#0D47A1] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Examen
        </button>
        <button
          onClick={() => setCurrentTab('bank')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${
            currentTab === 'bank' ? 'bg-[#0D47A1] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Banco
        </button>
        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${
            currentTab === 'leaderboard' ? 'bg-[#0D47A1] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Ranking
        </button>
        <button
          onClick={() => setCurrentTab('teacher')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'teacher' ? 'bg-amber-600 text-white' : 'text-amber-700 font-bold'
          }`}
        >
          <GraduationCap className="w-3 h-3" />
          <span>Docente</span>
        </button>
      </div>
    </header>
  );
};
