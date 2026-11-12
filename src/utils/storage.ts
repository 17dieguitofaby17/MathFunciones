import { StudentProfile, Question, LeaderboardEntry } from '../types';
import { INITIAL_QUESTIONS } from '../data/questionBank';
import { BADGES } from '../data/badges';

const PROFILE_KEY = 'marianita_math_profile_v3';
const QUESTIONS_KEY = 'marianita_math_custom_questions_v3';
const LEADERBOARD_KEY = 'marianita_math_leaderboard_v3';

export const DEFAULT_PROFILE: StudentProfile = {
  id: 'student_' + Math.random().toString(36).substring(2, 9),
  name: 'Estudiante Marianita',
  course: '2do BGU "A"',
  avatarId: 'marianita_scholar',
  xp: 150,
  streak: 2,
  lastActiveDate: new Date().toISOString().split('T')[0],
  lives: 5,
  maxLives: 5,
  unlockedLevel: 1,
  completedQuestions: {},
  exclusiveChallengesCompleted: {},
  unlockedBadges: ['primer_paso'],
  stats: {
    totalAnswered: 2,
    totalCorrect: 2,
    correctByTopic: {
      tipo: 1,
      dominio: 1,
      rango: 0,
      cortes: 0,
      grafica: 0,
      integral: 0,
      composicion: 0,
      inversa: 0
    },
    totalByTopic: {
      tipo: 1,
      dominio: 1,
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

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', name: 'Doménica Morales', course: '2do BGU "A"', avatar: '🎓', xp: 1850, streak: 14, badgesCount: 11, levelTitle: 'Gran Sabia Marianita', exclusiveChallengesCount: 12 },
  { id: 'lb_2', name: 'Mateo Chimborazo', course: '2do BGU "B"', avatar: '📐', xp: 1420, streak: 9, badgesCount: 8, levelTitle: 'Maestro de Funciones', exclusiveChallengesCount: 9 },
  { id: 'lb_3', name: 'Valeria Guamán', course: '2do BGU "A"', avatar: '⭐', xp: 1150, streak: 7, badgesCount: 7, levelTitle: 'Alquimista de Funciones', exclusiveChallengesCount: 6 },
  { id: 'lb_4', name: 'Sebastián Vinueza', course: '2do BGU "C"', avatar: '⚡', xp: 980, streak: 6, badgesCount: 6, levelTitle: 'Explorador del Dominio', exclusiveChallengesCount: 5 },
  { id: 'lb_5', name: 'Camila Alcocer', course: '2do BGU "B"', avatar: '🔬', xp: 810, streak: 4, badgesCount: 5, levelTitle: 'Arquitecta de Parábolas', exclusiveChallengesCount: 3 },
  { id: 'lb_6', name: 'Nicolás Freire', course: '2do BGU "C"', avatar: '📚', xp: 620, streak: 3, badgesCount: 4, levelTitle: 'Maestro de la Recta', exclusiveChallengesCount: 2 },
];

export function getProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
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

  // Cazador Cortes
  if ((profile.stats.correctByTopic.cortes || 0) >= 3 && !unlocked.has('cazador_cortes')) {
    unlocked.add('cazador_cortes');
    newlyUnlocked.push('cazador_cortes');
  }

  // Arquitecto Parábolas
  if (profile.unlockedLevel >= 3 && !unlocked.has('arquitecto_parabolas')) {
    unlocked.add('arquitecto_parabolas');
    newlyUnlocked.push('arquitecto_parabolas');
  }

  // Explorador Dominio
  if (((profile.stats.correctByTopic.dominio || 0) + (profile.stats.correctByTopic.rango || 0)) >= 3 && !unlocked.has('explorador_dominio')) {
    unlocked.add('explorador_dominio');
    newlyUnlocked.push('explorador_dominio');
  }

  // Guardián Asíntotas
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
  return { updatedProfile, newlyUnlocked };
}

export function getLeaderboard(currentProfile: StudentProfile): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD;

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
      isCurrentUser: true
    };

    const filtered = list.filter(e => e.id !== currentProfile.id && !e.isCurrentUser);
    const combined = [...filtered, userEntry].sort((a, b) => b.xp - a.xp);

    return combined;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function getRankTitle(xp: number): string {
  if (xp >= 1600) return 'Gran Sabia Marianita';
  if (xp >= 1200) return 'Maestra de Funciones';
  if (xp >= 900) return 'Alquimista de Curvas';
  if (xp >= 600) return 'Exploradora del Dominio';
  if (xp >= 300) return 'Arquitecta de Parábolas';
  return 'Aprendiz de la Recta';
}
