/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getProfile, 
  saveProfile, 
  getAllQuestions, 
  saveCustomQuestion, 
  deleteCustomQuestion, 
  getLeaderboard, 
  checkAndAwardBadges,
  getRankTitle
} from './utils/storage';
import { StudentProfile, Question } from './types';
import { Header } from './components/Header';
import { ChallengeView } from './components/ChallengeView';
import { ExclusiveChallengesView } from './components/ExclusiveChallengesView';
import { FunctionLab } from './components/FunctionLab';
import { ExamSimulator } from './components/ExamSimulator';
import { QuestionBankManager } from './components/QuestionBankManager';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { RegistrationModal } from './components/RegistrationModal';
import { BadgesModal } from './components/BadgesModal';
import { SyncModal } from './components/SyncModal';
import { sound } from './utils/audio';
import { 
  Sparkles, 
  BarChart3, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Flame, 
  ShieldCheck,
  Compass,
  ArrowRight,
  Zap,
  Clock,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(getProfile);
  const [questions, setQuestions] = useState<Question[]>(getAllQuestions);
  const [currentTab, setCurrentTab] = useState<'challenges' | 'exclusive' | 'lab' | 'exam' | 'bank' | 'leaderboard' | 'teacher'>('challenges');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string | null>(null);

  // Check if student has valid registration (2 names and 2 surnames = 4 words)
  const isStudentRegistered = 
    profile.name && 
    profile.name !== 'Estudiante Marianita' && 
    profile.name.trim().split(/\s+/).filter(Boolean).length >= 4;

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(!isStudentRegistered);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    saveProfile(updated);
  };

  const handleRegisterStudent = (fullName: string, course: string) => {
    const updated: StudentProfile = {
      ...profile,
      name: fullName,
      course: course,
    };
    handleUpdateProfile(updated);
    setIsRegistrationModalOpen(false);
  };

  const handleCheckBadges = (currentProf: StudentProfile) => {
    const { updatedProfile, newlyUnlocked } = checkAndAwardBadges(currentProf);
    if (newlyUnlocked.length > 0) {
      sound.playBadgeUnlocked();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#0D47A1', '#DC2626', '#F59E0B']
      });
      setNewBadgeToast(newlyUnlocked[0]);
      setTimeout(() => setNewBadgeToast(null), 4500);
    }
    setProfile(updatedProfile);
  };

  const handleAddQuestion = (newQ: Question) => {
    const updated = saveCustomQuestion(newQ);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = deleteCustomQuestion(id);
    setQuestions(updated);
  };

  const handleImportQuestions = (imported: Question[]) => {
    let current = questions;
    imported.forEach((q) => {
      current = saveCustomQuestion(q);
    });
    setQuestions(current);
  };

  const leaderboardEntries = getLeaderboard(profile);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Contract with Official Crest & Colors */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          sound.playClick();
          setCurrentTab(tab);
        }}
        profile={profile}
        onOpenBadges={() => {
          sound.playClick();
          setIsBadgesModalOpen(true);
        }}
        onOpenSync={() => {
          sound.playClick();
          setIsSyncModalOpen(true);
        }}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Institutional Hero Banner with Logo & Official Poster */}
        {currentTab === 'challenges' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#B91C1C] text-white shadow-xl border border-blue-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 relative z-10">
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                    <img
                      src="/assets/aistudio/image_b65e9819.png"
                      alt="Escudo"
                      className="w-4 h-4 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span>2dos de Bachillerato & 2do Técnico</span>
                  </div>

                  <span className="font-motto text-amber-300 text-base font-bold tracking-wide">
                    "Ternura que acompaña, Firmeza que transforma"
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  MATH<span className="text-amber-300">FUNCIONES</span>
                </h1>
                
                <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                  Plataforma oficial de gamificación matemática de la <strong>U.E. "Santa Mariana de Jesús"</strong>. Supervisada por el <strong>Mgs. DIEGO AULLA</strong>. Domina tipos de funciones, dominios, rangos, cortes, <strong>composición de funciones (f ∘ g)</strong> y <strong>función inversa (f⁻¹)</strong>.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentTab('exclusive');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ring-2 ring-amber-400/50"
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Retos 15h00 & 18h00 (Doble XP)</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentTab('lab');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-300" />
                    <span>Laboratorio Gráfico</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setCurrentTab('teacher');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Panel Docente</span>
                  </button>
                </div>
              </div>

              {/* Official Poster & Mascot Graphic */}
              <div className="lg:col-span-5 hidden lg:block">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 transform hover:scale-[1.02] transition-transform duration-300 max-h-64 bg-white/5 backdrop-blur-sm">
                  <img
                    src="/assets/aistudio/image_a1394f25.png"
                    alt="Santa Mariana de Jesús - Ternura que acompaña, Firmeza que transforma"
                    className="w-full h-64 object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-bold text-white tracking-wide">
                      U.E. Santa Mariana de Jesús · Riobamba
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Progressive Levels & Challenges */}
        {currentTab === 'challenges' && (
          <ChallengeView
            questions={questions}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onCheckBadges={handleCheckBadges}
          />
        )}

        {/* Tab 2: Exclusive 15:00 & 18:00 Challenges (2X Points & Collectibles) */}
        {currentTab === 'exclusive' && (
          <ExclusiveChallengesView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onCheckBadges={handleCheckBadges}
          />
        )}

        {/* Tab 3: Function Lab & Dynamic Sandbox (Composición e Inversa) */}
        {currentTab === 'lab' && <FunctionLab />}

        {/* Tab 4: Exam Simulator */}
        {currentTab === 'exam' && (
          <ExamSimulator
            questions={questions}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onCheckBadges={handleCheckBadges}
          />
        )}

        {/* Tab 5: Question Bank Manager */}
        {currentTab === 'bank' && (
          <QuestionBankManager
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onImportQuestions={handleImportQuestions}
          />
        )}

        {/* Tab 6: Leaderboard */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboardEntries}
            currentProfile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* Tab 7: Teacher Dashboard (Mgs. Diego Aulla) */}
        {currentTab === 'teacher' && (
          <TeacherDashboardView
            currentProfile={profile}
            leaderboardEntries={leaderboardEntries}
          />
        )}
      </main>

      {/* Footer with Attribution to Mgs. DIEGO AULLA */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_b65e9819.png"
              alt="Escudo"
              className="w-6 h-6 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-extrabold text-[#0D47A1] dark:text-blue-400 text-sm tracking-wide">
              MATHFUNCIONES
            </span>
          </div>

          {/* Teacher Credit */}
          <div className="p-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-sm">
            <GraduationCap className="w-4 h-4 text-[#0D47A1] dark:text-blue-400 shrink-0" />
            <span>Desarrollado y Supervisado por: <strong className="text-[#0D47A1] dark:text-blue-300">Mgs. DIEGO AULLA - DOCENTE DE MATEMATICA</strong></span>
          </div>
        </div>
      </footer>

      {/* First-time Mandatory Registration Modal (Requires 2 names & 2 surnames) */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onRegister={handleRegisterStudent}
        currentProfile={profile}
      />

      {/* Badges Modal */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        profile={profile}
      />

      {/* Sync / Offline Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        profile={profile}
        onRestoreProfile={(restored) => {
          handleUpdateProfile(restored);
        }}
      />

      {/* Badge Toast Notification */}
      {newBadgeToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0D47A1] text-white shadow-2xl border border-blue-700 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
              ¡Nueva Insignia Coleccionable Desbloqueada!
            </div>
            <div className="text-xs font-bold">
              Felicitaciones Marianita, sigue sumando logros en MATHFUNCIONES
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
