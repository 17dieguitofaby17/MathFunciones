/**
 * Types and interfaces for MATHFUNCIONES - Funciones 2do BGU
 * Unidad Educativa Santa Mariana de Jesús - Riobamba
 * Lema: "Ternura que acompaña, Firmeza que transforma"
 */

export type FunctionCategory = 
  | 'Lineal'
  | 'Afín'
  | 'Constante'
  | 'Cuadrática'
  | 'Racional'
  | 'Radical'
  | 'Exponencial'
  | 'Logarítmica'
  | 'Valor Absoluto'
  | 'A Trozos'
  | 'Compuesta'
  | 'Inversa';

export type MathTopic = 
  | 'tipo' 
  | 'dominio' 
  | 'rango' 
  | 'cortes' 
  | 'grafica' 
  | 'integral'
  | 'composicion'
  | 'inversa';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanationNote?: string;
}

export interface StepByStepSolution {
  title: string;
  formulaBreakdown: string;
  domainExplanation: string;
  rangeExplanation: string;
  interceptsExplanation: string;
  graphObservation: string;
  pedagogicalTip: string;
}

export interface KeyPoint {
  x: number;
  y: number;
  label: string;
  color: string;
  type: 'x-intercept' | 'y-intercept' | 'vertex' | 'asymptote-point' | 'reference';
}

export interface GraphConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  step?: number;
  asymptotes?: {
    vertical?: number[];
    horizontal?: number[];
  };
  keyPoints?: KeyPoint[];
  evalFunctionCode: string; // JavaScript expression string for evaluation: e.g. "2*x - 6"
  secondaryEvalCode?: string; // Optional secondary curve (e.g. for inverse f^-1(x) or g(x))
  secondaryLabel?: string;
  showDiagonalSymmetry?: boolean; // For inverse functions y = x
}

export interface Question {
  id: string;
  level: number; // 1 to 6
  topic: MathTopic;
  title: string;
  functionFormula: string;
  secondaryFormula?: string;
  functionType: FunctionCategory;
  domain: string;
  range: string;
  xIntercepts: string[];
  yIntercept: string;
  vertex?: string;
  prompt: string;
  questionType: 'multiple-choice' | 'true-false' | 'multi-part';
  options: QuestionOption[];
  stepByStepSolution: StepByStepSolution;
  graphConfig: GraphConfig;
  difficulty: 'Fácil' | 'Medio' | 'Avanzado';
  xpReward: number;
}

export interface RubricStep {
  id: 'dominio' | 'asintotas' | 'ceros' | 'rango' | 'intervalos' | 'grafica';
  label: string;
  maxPoints: number; // e.g., 0.25, 1.0, 0.5
  prompt: string;
  options: QuestionOption[];
}

export interface ExclusiveChallenge {
  id: string;
  slot: '15:00' | '18:00';
  slotName: string;
  title: string;
  topic: MathTopic;
  functionFormula: string;
  secondaryFormula?: string;
  functionType: FunctionCategory;
  domain: string;
  range: string;
  asymptotesLabel: string;
  zerosAndIntercepts: string;
  positivityInterval: string;
  negativityInterval: string;
  prompt: string;
  rubricSteps: RubricStep[];
  stepByStepSolution: StepByStepSolution;
  graphConfig: GraphConfig;
  baseXp: number;
  doubleXp: number; // 2x points
  participationPoints: number;
  tip: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: 'precision' | 'streak' | 'levels' | 'topics' | 'mastery' | 'exclusive';
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string; // e.g., '2do BGU "A"', '2do BGU "B"', '2do BGU "C"'
  accessCodeVerified?: boolean;
  isTeacher?: boolean;
  registeredAt?: number;
  avatarId: string;
  xp: number;
  streak: number;
  lastActiveDate: string;
  lives: number;
  maxLives: number;
  unlockedLevel: number;
  completedQuestions: Record<string, { correct: boolean; attempts: number; timestamp: number }>;
  exclusiveChallengesCompleted: Record<string, { timestamp: number; score: number; slot: '15:00' | '18:00' }>;
  unlockedBadges: string[];
  stats: {
    totalAnswered: number;
    totalCorrect: number;
    correctByTopic: Record<MathTopic, number>;
    totalByTopic: Record<MathTopic, number>;
    examsTaken: number;
    highestExamScore: number;
    exclusiveCount: number; // Total completed exclusive challenges (10, 20, 30 milestone)
  };
  customQuestions?: Question[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  course: string;
  avatar: string;
  xp: number;
  streak: number;
  badgesCount: number;
  levelTitle: string;
  exclusiveChallengesCount: number;
  isCurrentUser?: boolean;
  registeredAt?: number;
  isOnline?: boolean;
  solvedQuestionsCount?: number;
  lastActiveTime?: string;
}
