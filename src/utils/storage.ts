import { StudentProfile, Question, LeaderboardEntry } from '../types';
import { INITIAL_QUESTIONS } from '../data/questionBank';
import { BADGES } from '../data/badges';

const PROFILE_KEY = 'marianita_math_profile_v5';
const QUESTIONS_KEY = 'marianita_math_custom_questions_v5';
const LEADERBOARD_KEY = 'marianita_math_registered_students_v5';
const DB_RESET_FLAG = 'marianita_math_db_reset_v5_done';

export const DEFAULT_PROFILE: StudentProfile = {
  id: 'student_' + Math.random().toString(36).substring(2, 9),
  name: 'Estudiante Marianita',
  course: '2do BGU "A"',
  accessCodeVerified: false,
  isTeacher: false,
  avatarId: 'marianita_scholar',
  xp: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  lives: 5,
  maxLives: 5,
  unlockedLevel: 1,
  completedQuestions: {},
  exclusiveChallengesCompleted: {},
  unlockedBadges: [],
  stats: {
    totalAnswered: 0,
    totalCorrect: 0,
    correctByTopic: {
      tipo: 0,
      dominio: 0,
      rango: 0,
      cortes: 0,
      grafica: 0,
      integral: 0,
      composicion: 0,
      inversa: 0
    },
    totalByTopic: {
      tipo: 0,
      dominio: 0,
      rango: 0,
      cortes: 0,
      grafica: 0,
      integral: 0,
      composicion: 0,
      inversa: 0
    },
    examsTaken: 0,
    highestExamScore: 0,
    exclusiveCount: 0
  }
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [];

/**
 * Purge all previous test database records (v1-v4 and legacy keys) once
 * so the database starts completely clean for real student registrations.
 */
export function purgeLegacyDatabasesIfNeeded(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (localStorage.getItem(DB_RESET_FLAG) === 'true') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('marianita_math_') &&
        !k.endsWith('_v5') &&
        k !== DB_RESET_FLAG
      ) {
        keysToRemove.push(k);
      }
      if (k.startsWith('reto_funciones') || k.startsWith('mathfunciones_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
    localStorage.setItem(DB_RESET_FLAG, 'true');
  } catch (e) {
    console.error('Error purging legacy database keys', e);
  }
}

export function resetEntireDatabase(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('marianita_math_') || k.startsWith('reto_funciones'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
    localStorage.setItem(DB_RESET_FLAG, 'true');
  } catch (e) {
    console.error('Error resetting database', e);
  }
}

export function getProfile(): StudentProfile {
  try {
    purgeLegacyDatabasesIfNeeded();
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const fresh: StudentProfile = {
        ...DEFAULT_PROFILE,
        id: 'student_' + Math.random().toString(36).substring(2, 9),
      };
      saveProfile(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      exclusiveChallengesCompleted: parsed.exclusiveChallengesCompleted || {},
      stats: {
        ...DEFAULT_PROFILE.stats,
        ...parsed.stats,
        exclusiveCount: parsed.stats?.exclusiveCount || Object.keys(parsed.exclusiveChallengesCompleted || {}).length || 0,
      }
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage', e);
  }
}

export function getAllQuestions(): Question[] {
  try {
    const rawCustom = localStorage.getItem(QUESTIONS_KEY);
    const custom: Question[] = rawCustom ? JSON.parse(rawCustom) : [];
    return [...INITIAL_QUESTIONS, ...custom];
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveCustomQuestion(newQ: Question): Question[] {
  try {
    const rawCustom = localStorage.getItem(QUESTIONS_KEY);
    const custom: Question[] = rawCustom ? JSON.parse(rawCustom) : [];
    const updated = [newQ, ...custom.filter(q => q.id !== newQ.id)];
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
    return [...INITIAL_QUESTIONS, ...updated];
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function deleteCustomQuestion(id: string): Question[] {
  try {
    const rawCustom = localStorage.getItem(QUESTIONS_KEY);
    const custom: Question[] = rawCustom ? JSON.parse(rawCustom) : [];
    const updated = custom.filter(q => q.id !== id);
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
    return [...INITIAL_QUESTIONS, ...updated];
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function checkAndAwardBadges(profile: StudentProfile): { updatedProfile: StudentProfile; newlyUnlocked: string[] } {
  const unlocked = new Set(profile.unlockedBadges);
  const newlyUnlocked: string[] = [];

  // Milestone Collectible Badges: 10, 20, 30 Exclusive Challenges
  const exclusiveCount = profile.stats.exclusiveCount || Object.keys(profile.exclusiveChallengesCompleted || {}).length;

  if (exclusiveCount >= 10 && !unlocked.has('desafio_10')) {
    unlocked.add('desafio_10');
    newlyUnlocked.push('desafio_10');
  }

  if (exclusiveCount >= 20 && !unlocked.has('desafio_20')) {
    unlocked.add('desafio_20');
    newlyUnlocked.push('desafio_20');
  }

  if (exclusiveCount >= 30 && !unlocked.has('desafio_30')) {
    unlocked.add('desafio_30');
    newlyUnlocked.push('desafio_30');
  }

  // Institutional Motto Badge: Ternura y Firmeza
  if (profile.stats.totalCorrect >= 15 && !unlocked.has('ternura_y_firmeza')) {
    unlocked.add('ternura_y_firmeza');
    newlyUnlocked.push('ternura_y_firmeza');
  }

  // Composición de Funciones
  if ((profile.stats.correctByTopic.composicion || 0) >= 1 && !unlocked.has('maestro_composicion')) {
    unlocked.add('maestro_composicion');
    newlyUnlocked.push('maestro_composicion');
  }

  // Función Inversa
  if ((profile.stats.correctByTopic.inversa || 0) >= 1 && !unlocked.has('maestro_inversa')) {
    unlocked.add('maestro_inversa');
    newlyUnlocked.push('maestro_inversa');
  }

  // Primer Paso
  if (profile.stats.totalCorrect >= 1 && !unlocked.has('primer_paso')) {
    unlocked.add('primer_paso');
    newlyUnlocked.push('primer_paso');
  }

  // Maestro Lineal
  if (profile.unlockedLevel >= 2 && !unlocked.has('maestro_lineal')) {
    unlocked.add('maestro_lineal');
    newlyUnlocked.push('maestro_lineal');
  }

  // Cazador de Cortes
  if ((profile.stats.correctByTopic.cortes || 0) >= 5 && !unlocked.has('cazador_cortes')) {
    unlocked.add('cazador_cortes');
    newlyUnlocked.push('cazador_cortes');
  }

  // Arquitecto de Parábolas
  if (profile.unlockedLevel >= 3 && !unlocked.has('arquitecto_parabolas')) {
    unlocked.add('arquitecto_parabolas');
    newlyUnlocked.push('arquitecto_parabolas');
  }

  // Explorador del Dominio
  if ((profile.stats.correctByTopic.dominio || 0) >= 5 && !unlocked.has('explorador_dominio')) {
    unlocked.add('explorador_dominio');
    newlyUnlocked.push('explorador_dominio');
  }

  // Guardián de Asíntotas
  if (profile.unlockedLevel >= 4 && !unlocked.has('guardian_asintotas')) {
    unlocked.add('guardian_asintotas');
    newlyUnlocked.push('guardian_asintotas');
  }

  // Viajero Trascendente
  if (profile.unlockedLevel >= 5 && !unlocked.has('viajero_trascendente')) {
    unlocked.add('viajero_trascendente');
    newlyUnlocked.push('viajero_trascendente');
  }

  // Maestro Especiales
  if (profile.unlockedLevel >= 6 && !unlocked.has('maestro_especiales')) {
    unlocked.add('maestro_especiales');
    newlyUnlocked.push('maestro_especiales');
  }

  // Racha Fuego
  if (profile.streak >= 5 && !unlocked.has('racha_fuego')) {
    unlocked.add('racha_fuego');
    newlyUnlocked.push('racha_fuego');
  }

  // Excelencia Evaluación
  if (profile.stats.highestExamScore >= 9 && !unlocked.has('excelencia_evaluacion')) {
    unlocked.add('excelencia_evaluacion');
    newlyUnlocked.push('excelencia_evaluacion');
  }

  // Gran Sabio
  if (profile.xp >= 1200 && profile.unlockedLevel >= 6 && !unlocked.has('gran_sabio_funciones')) {
    unlocked.add('gran_sabio_funciones');
    newlyUnlocked.push('gran_sabio_funciones');
  }

  // Calculate bonus XP from new badges
  let bonusXp = 0;
  newlyUnlocked.forEach(badgeId => {
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      bonusXp += badge.xpReward;
    }
  });

  const updatedProfile: StudentProfile = {
    ...profile,
    xp: profile.xp + bonusXp,
    unlockedBadges: Array.from(unlocked)
  };

  saveProfile(updatedProfile);
  if (!updatedProfile.isTeacher && updatedProfile.accessCodeVerified) {
    registerOrUpdateStudentInLeaderboard(updatedProfile);
  }
  return { updatedProfile, newlyUnlocked };
}

export function getLeaderboard(currentProfile: StudentProfile): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD;

    // In teacher mode, simply return the student list sorted by XP
    if (currentProfile.isTeacher) {
      return list.filter(e => e.id !== currentProfile.id).sort((a, b) => b.xp - a.xp);
    }

    // Only add user entry if they are a real registered student
    const isRegistered = currentProfile.name && currentProfile.name !== 'Estudiante Marianita' && currentProfile.accessCodeVerified;
    if (!isRegistered) {
      return list;
    }

    const currentLevelTitle = getRankTitle(currentProfile.xp);
    const userEntry: LeaderboardEntry = {
      id: currentProfile.id,
      name: currentProfile.name + ' (Tú)',
      course: currentProfile.course,
      avatar: '🌟',
      xp: currentProfile.xp,
      streak: currentProfile.streak,
      badgesCount: currentProfile.unlockedBadges.length,
      levelTitle: currentLevelTitle,
      exclusiveChallengesCount: currentProfile.stats.exclusiveCount || Object.keys(currentProfile.exclusiveChallengesCompleted || {}).length,
      isCurrentUser: true,
      isOnline: true,
      registeredAt: currentProfile.registeredAt || Date.now(),
      solvedQuestionsCount: Object.keys(currentProfile.completedQuestions || {}).length,
    };

    const filtered = list.filter(e => e.id !== currentProfile.id && !e.isCurrentUser);
    const combined = [...filtered, userEntry].sort((a, b) => b.xp - a.xp);

    return combined;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboard(list: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving leaderboard', e);
  }
}

export function clearAllRegisteredStudents(): LeaderboardEntry[] {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export function deleteStudentEntry(id: string): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const updated = list.filter(s => s.id !== id);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function registerOrUpdateStudentInLeaderboard(profile: StudentProfile): LeaderboardEntry[] {
  if (profile.isTeacher || profile.name === 'Estudiante Marianita' || !profile.accessCodeVerified) {
    return getStoredStudents();
  }
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex(s => s.id === profile.id || s.name.trim().toLowerCase() === profile.name.trim().toLowerCase());

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const solvedCount = Object.keys(profile.completedQuestions || {}).length;

    const studentEntry: LeaderboardEntry = {
      id: profile.id,
      name: profile.name,
      course: profile.course,
      avatar: '🌟',
      xp: profile.xp,
      streak: profile.streak,
      badgesCount: profile.unlockedBadges.length,
      levelTitle: getRankTitle(profile.xp),
      exclusiveChallengesCount: profile.stats.exclusiveCount || Object.keys(profile.exclusiveChallengesCompleted || {}).length,
      registeredAt: profile.registeredAt || Date.now(),
      isOnline: true,
      solvedQuestionsCount: solvedCount,
      lastActiveTime: timeStr
    };

    let updated: LeaderboardEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...studentEntry
      };
    } else {
      updated = [studentEntry, ...list];
    }

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredStudents(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createTeacherProfile(): StudentProfile {
  return {
    id: 'docente_diego_aulla',
    name: 'Mgs. Diego Aulla - Docente de Matemática',
    course: 'Docente Supervisor',
    isTeacher: true,
    accessCodeVerified: true,
    avatarId: 'marianita_scholar',
    xp: 5000,
    streak: 10,
    lastActiveDate: new Date().toISOString().split('T')[0],
    lives: 999,
    maxLives: 999,
    unlockedLevel: 6,
    completedQuestions: {},
    exclusiveChallengesCompleted: {},
    unlockedBadges: ['gran_sabio_funciones', 'maestro_composicion', 'maestro_inversa'],
    stats: {
      totalAnswered: 0,
      totalCorrect: 0,
      correctByTopic: { tipo: 0, dominio: 0, rango: 0, cortes: 0, grafica: 0, integral: 0, composicion: 0, inversa: 0 },
      totalByTopic: { tipo: 0, dominio: 0, rango: 0, cortes: 0, grafica: 0, integral: 0, composicion: 0, inversa: 0 },
      examsTaken: 0,
      highestExamScore: 10,
      exclusiveCount: 0
    }
  };
}

export function getRankTitle(xp: number): string {
  if (xp >= 1600) return 'Gran Sabia Marianita';
  if (xp >= 1200) return 'Maestra de Funciones';
  if (xp >= 900) return 'Alquimista de Curvas';
  if (xp >= 600) return 'Exploradora del Dominio';
  if (xp >= 300) return 'Arquitecta de Parábolas';
  return 'Aprendiz de la Recta';
}
