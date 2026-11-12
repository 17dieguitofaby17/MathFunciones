import { Badge } from '../types';

export const BADGES: Badge[] = [
  // ==========================================
  // INSIGNIAS COLECCIONABLES DE RETOS EXCLUSIVOS (10, 20, 30)
  // ==========================================
  {
    id: 'desafio_10',
    title: 'Coleccionista Marianita · Bronce',
    description: 'Resuelve 10 Desafíos Exclusivos programados (15h00 / 18h00).',
    iconName: 'Medal',
    xpReward: 300,
    category: 'exclusive',
    tier: 'bronze'
  },
  {
    id: 'desafio_20',
    title: 'Coleccionista Marianita · Plata',
    description: 'Resuelve 20 Desafíos Exclusivos programados con doble puntaje.',
    iconName: 'Shield',
    xpReward: 600,
    category: 'exclusive',
    tier: 'silver'
  },
  {
    id: 'desafio_30',
    title: 'Coleccionista Marianita · Oro Legendario',
    description: '¡Dominio Absoluto! Resuelve 30 Desafíos Exclusivos de las 15h00 y 18h00.',
    iconName: 'Crown',
    xpReward: 1200,
    category: 'exclusive',
    tier: 'gold'
  },
  {
    id: 'ternura_y_firmeza',
    title: 'Ternura y Firmeza',
    description: 'Encarna el lema institucional superando 15 retos con constancia y rigor.',
    iconName: 'HeartHandshake',
    xpReward: 350,
    category: 'mastery'
  },

  // ==========================================
  // INSIGNIAS POR TEMAS CURRICULARES
  // ==========================================
  {
    id: 'maestro_composicion',
    title: 'Maestro de la Composición (f ∘ g)',
    description: 'Resuelve con éxito ejercicios de composición de funciones y dominios compuestos.',
    iconName: 'GitMerge',
    xpReward: 200,
    category: 'topics'
  },
  {
    id: 'maestro_inversa',
    title: 'Espejo Biyectivo (f⁻¹)',
    description: 'Determina analítica y gráficamente la función inversa simétrica a y = x.',
    iconName: 'Repeat',
    xpReward: 200,
    category: 'topics'
  },
  {
    id: 'primer_paso',
    title: 'Primer Paso Marianita',
    description: 'Resuelve tu primer ejercicio de funciones con éxito.',
    iconName: 'Compass',
    xpReward: 50,
    category: 'precision'
  },
  {
    id: 'maestro_lineal',
    title: 'Maestro de la Recta',
    description: 'Supera el Nivel 1: Funciones Lineales, Afines y Constantes.',
    iconName: 'TrendingUp',
    xpReward: 100,
    category: 'levels'
  },
  {
    id: 'cazador_cortes',
    title: 'Cazador de Cortes',
    description: 'Resuelve correctamente 5 preguntas de puntos de corte con los ejes.',
    iconName: 'Crosshair',
    xpReward: 120,
    category: 'topics'
  },
  {
    id: 'arquitecto_parabolas',
    title: 'Arquitecto de Parábolas',
    description: 'Supera el Nivel 2: Cuadráticas, Vértice y Discriminante.',
    iconName: 'Activity',
    xpReward: 150,
    category: 'levels'
  },
  {
    id: 'explorador_dominio',
    title: 'Explorador del Dominio',
    description: 'Acierta 5 preguntas identificando restricciones de Dominio y Rango.',
    iconName: 'Maximize2',
    xpReward: 130,
    category: 'topics'
  },
  {
    id: 'guardian_asintotas',
    title: 'Guardián de Asíntotas',
    description: 'Supera el Nivel 3: Funciones Racionales y Radicales.',
    iconName: 'Divide',
    xpReward: 180,
    category: 'levels'
  },
  {
    id: 'viajero_trascendente',
    title: 'Viajero Trascendente',
    description: 'Supera el Nivel 4: Funciones Exponenciales y Logarítmicas.',
    iconName: 'Zap',
    xpReward: 200,
    category: 'levels'
  },
  {
    id: 'maestro_especiales',
    title: 'Maestro de lo Especial',
    description: 'Supera el Nivel 5: Funciones a Trozos y Valor Absoluto.',
    iconName: 'Layers',
    xpReward: 220,
    category: 'levels'
  },
  {
    id: 'racha_fuego',
    title: 'Racha Inquebrantable',
    description: 'Alcanza una racha de 5 respuestas consecutivas correctas.',
    iconName: 'Flame',
    xpReward: 150,
    category: 'streak'
  },
  {
    id: 'excelencia_evaluacion',
    title: 'Excelencia Marianita',
    description: 'Obtén una calificación de 9 o más sobre 10 en el Simulador de Examen.',
    iconName: 'Award',
    xpReward: 250,
    category: 'mastery'
  },
  {
    id: 'gran_sabio_funciones',
    title: 'Gran Sabio de Funciones',
    description: 'Desbloquea todos los niveles y acumula más de 1200 puntos XP.',
    iconName: 'Crown',
    xpReward: 500,
    category: 'mastery'
  }
];
