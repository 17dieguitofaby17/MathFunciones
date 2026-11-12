import { ExclusiveChallenge } from '../types';

export const EXCLUSIVE_CHALLENGES: ExclusiveChallenge[] = [
  // ========================================================
  // HORARIO 15:00 PM (Reto Vespertino · Doble Puntaje 2X)
  // ========================================================
  {
    id: 'excl_15_01',
    slot: '15:00',
    slotName: 'Reto Vespertino 15h00',
    title: 'Composición de Funciones Racionales',
    topic: 'composicion',
    functionFormula: 'f(x) = \\frac{1}{x + 2}',
    secondaryFormula: 'g(x) = 3x - 1',
    functionType: 'Compuesta',
    domain: 'ℝ - { -1/3 }',
    range: 'ℝ - { 0 }',
    prompt: 'Sean f(x) = 1/(x + 2) y g(x) = 3x - 1. Determina la fórmula de (f ∘ g)(x) y su restricción de dominio.',
    baseXp: 50,
    doubleXp: 100, // Doble Puntaje
    participationPoints: 2, // Doble participación
    tip: 'Sustituye g(x) en el denominador de f: 1 / ((3x - 1) + 2).',
    options: [
      { id: 'opt_1', text: '(f ∘ g)(x) = 1 / (3x + 1) con x ≠ -1/3', isCorrect: true, explanationNote: '¡Excelente! f(g(x)) = 1 / ((3x - 1) + 2) = 1 / (3x + 1). El denominador 3x + 1 ≠ 0 ⇒ x ≠ -1/3.' },
      { id: 'opt_2', text: '(f ∘ g)(x) = (3x - 1) / (x + 2) con x ≠ -2', isCorrect: false, explanationNote: 'Eso sería la división g(x)/algo, no la composición f(g(x)).' },
      { id: 'opt_3', text: '(f ∘ g)(x) = 1 / (3x - 3) con x ≠ 1', isCorrect: false, explanationNote: '(-1) + 2 es +1, no -3.' },
      { id: 'opt_4', text: '(f ∘ g)(x) = 3/(x + 2) - 1 con x ≠ -2', isCorrect: false, explanationNote: 'Corresponde a g(f(x)), no a f(g(x)).' }
    ],
    stepByStepSolution: {
      title: 'Solución del Reto 15h00: Composición Racional',
      formulaBreakdown: '(f ∘ g)(x) = f(g(x)) = 1 / ((3x - 1) + 2) = 1 / (3x + 1).',
      domainExplanation: 'Condición del denominador: 3x + 1 ≠ 0 ⇒ 3x ≠ -1 ⇒ x ≠ -1/3. Por ende: Dom(f ∘ g) = ℝ - { -1/3 }.',
      rangeExplanation: 'Ran(f ∘ g) = ℝ - { 0 } al ser una fracción propia con numerador constante no nulo.',
      interceptsExplanation: 'Corte con Y: f(g(0)) = 1 / (3(0) + 1) = 1 ⇒ (0, 1). Corte con X: no tiene (1/(3x+1) jamás es 0).',
      graphObservation: 'Hipérbola con asíntota vertical en x = -1/3 y asíntota horizontal en y = 0.',
      pedagogicalTip: 'En composiciones con fracciones, el valor que anula el denominador final queda automáticamente excluido del dominio.'
    },
    graphConfig: {
      xMin: -4,
      xMax: 4,
      yMin: -5,
      yMax: 5,
      evalFunctionCode: '1 / (3 * x + 1)',
      asymptotes: {
        vertical: [-0.333],
        horizontal: [0]
      },
      keyPoints: [
        { x: 0, y: 1, label: 'Corte Y: (0, 1)', color: '#0D47A1', type: 'y-intercept' }
      ]
    }
  },
  {
    id: 'excl_15_02',
    slot: '15:00',
    slotName: 'Reto Vespertino 15h00',
    title: 'Inversa de Función Afín y Reflexión',
    topic: 'inversa',
    functionFormula: 'f(x) = -2x + 6',
    secondaryFormula: 'f^{-1}(x) = -\\frac{1}{2}x + 3',
    functionType: 'Inversa',
    domain: 'ℝ',
    range: 'ℝ',
    prompt: 'Calcula la función inversa f⁻¹(x) de f(x) = -2x + 6 e indica su punto fijo (donde f(x) = f⁻¹(x)).',
    baseXp: 50,
    doubleXp: 100,
    participationPoints: 2,
    tip: 'El punto donde f y f⁻¹ se cortan siempre está sobre la recta diagonal y = x.',
    options: [
      { id: 'opt_1', text: 'f⁻¹(x) = -(1/2)x + 3  |  Punto de corte común: (2, 2)', isCorrect: true, explanationNote: '¡Brillante! y = -2x + 6 ⇒ x = (6 - y)/2 = -0.5y + 3. Igualando a x: x = -2x + 6 ⇒ 3x = 6 ⇒ x = 2.' },
      { id: 'opt_2', text: 'f⁻¹(x) = 2x - 6  |  Punto de corte común: (0, 0)', isCorrect: false, explanationNote: 'Invertir los signos no es la operación inversa.' },
      { id: 'opt_3', text: 'f⁻¹(x) = -(1/2)x - 3  |  Punto de corte común: (1, 1)', isCorrect: false, explanationNote: 'El término independiente al despejar es +3, no -3.' },
      { id: 'opt_4', text: 'f⁻¹(x) = 1/(-2x + 6)  |  Sin cortes', isCorrect: false, explanationNote: 'No confundir la inversa con el recíproco multiplicativo.' }
    ],
    stepByStepSolution: {
      title: 'Solución del Reto 15h00: Inversa y Punto Fijo',
      formulaBreakdown: '1) y = -2x + 6\n2) 2x = 6 - y ⇒ x = 3 - (1/2)y\n3) f⁻¹(x) = -(1/2)x + 3.\n4) Punto de corte con la identidad y = x: x = -2x + 6 ⇒ 3x = 6 ⇒ x = 2, y = 2 ⇒ (2, 2).',
      domainExplanation: 'Dom(f⁻¹) = ℝ.',
      rangeExplanation: 'Ran(f⁻¹) = ℝ.',
      interceptsExplanation: 'f corta a Y en (0, 6) y a X en (3, 0). Su inversa f⁻¹ corta a Y en (0, 3) y a X en (6, 0).',
      graphObservation: 'Ambas rectas se cruzan exactamente sobre la línea de simetría y = x en el punto (2, 2).',
      pedagogicalTip: 'Toda función que corta a su inversa lo hace en la recta diagonal y = x.'
    },
    graphConfig: {
      xMin: -2,
      xMax: 8,
      yMin: -2,
      yMax: 8,
      evalFunctionCode: '-2 * x + 6',
      secondaryEvalCode: '-0.5 * x + 3',
      secondaryLabel: 'f⁻¹(x) = -0.5x + 3',
      showDiagonalSymmetry: true,
      keyPoints: [
        { x: 2, y: 2, label: 'Punto Fijo (2, 2)', color: '#DC2626', type: 'reference' }
      ]
    }
  },

  // ========================================================
  // HORARIO 18:00 PM (Reto Crepuscular · Doble Puntaje 2X)
  // ========================================================
  {
    id: 'excl_18_01',
    slot: '18:00',
    slotName: 'Reto Crepuscular 18h00',
    title: 'Composición Cuadrática y Rango',
    topic: 'composicion',
    functionFormula: 'f(x) = x^2 - 4',
    secondaryFormula: 'g(x) = x + 1',
    functionType: 'Compuesta',
    domain: 'ℝ',
    range: '[-4, +∞)',
    prompt: 'Para f(x) = x² - 4 y g(x) = x + 1, halla (f ∘ g)(x), su vértice y los cortes con el eje horizontal X.',
    baseXp: 50,
    doubleXp: 100,
    participationPoints: 2,
    tip: '(f ∘ g)(x) = (x + 1)² - 4. Desarrolla el binomio al cuadrado o usa la forma canónica.',
    options: [
      { id: 'opt_1', text: '(f ∘ g)(x) = x² + 2x - 3  |  Vértice (-1, -4)  |  Cortes X: (-3, 0) y (1, 0)', isCorrect: true, explanationNote: '¡Perfecto! (x+1)² - 4 = x² + 2x + 1 - 4 = x² + 2x - 3. Raíces: (x+3)(x-1)=0.' },
      { id: 'opt_2', text: '(f ∘ g)(x) = x² - 3  |  Vértice (0, -3)  |  Cortes X: (√3, 0)', isCorrect: false, explanationNote: 'No olvides el doble producto al desarrollar (x + 1)²: x² + 2x + 1.' },
      { id: 'opt_3', text: '(f ∘ g)(x) = x² + 2x - 5  |  Vértice (1, -4)', isCorrect: false, explanationNote: '1 - 4 es -3, no -5.' },
      { id: 'opt_4', text: '(f ∘ g)(x) = x³ - 4  |  Sin vértice', isCorrect: false, explanationNote: 'La composición de una cuadrática y una lineal es cuadrática de grado 2.' }
    ],
    stepByStepSolution: {
      title: 'Solución del Reto 18h00: Composición Cuadrática',
      formulaBreakdown: '(f ∘ g)(x) = f(g(x)) = (x + 1)² - 4 = x² + 2x + 1 - 4 = x² + 2x - 3.',
      domainExplanation: 'Dom(f ∘ g) = ℝ.',
      rangeExplanation: 'Vértice en forma canónica a(x - h)² + k: h = -1, k = -4. Como abre hacia arriba, Ran(f ∘ g) = [-4, +∞).',
      interceptsExplanation: '1) Corte Y: f(g(0)) = (0 + 1)² - 4 = 1 - 4 = -3 ⇒ (0, -3).\n2) Cortes X: x² + 2x - 3 = 0 ⇒ (x + 3)(x - 1) = 0 ⇒ x = -3 y x = 1 ⇒ (-3, 0) y (1, 0).',
      graphObservation: 'Parábola desplazada 1 unidad a la izquierda y 4 unidades hacia abajo.',
      pedagogicalTip: 'La forma canónica (x + 1)² - 4 te permite leer directamente el vértice (-1, -4) sin usar fórmulas.'
    },
    graphConfig: {
      xMin: -5,
      xMax: 3,
      yMin: -6,
      yMax: 6,
      evalFunctionCode: '(x + 1) * (x + 1) - 4',
      keyPoints: [
        { x: -1, y: -4, label: 'Vértice: (-1, -4)', color: '#F59E0B', type: 'vertex' },
        { x: -3, y: 0, label: 'Corte X₁: (-3, 0)', color: '#059669', type: 'x-intercept' },
        { x: 1, y: 0, label: 'Corte X₂: (1, 0)', color: '#059669', type: 'x-intercept' },
        { x: 0, y: -3, label: 'Corte Y: (0, -3)', color: '#0D47A1', type: 'y-intercept' }
      ]
    }
  },
  {
    id: 'excl_18_02',
    slot: '18:00',
    slotName: 'Reto Crepuscular 18h00',
    title: 'Inversa de Raíz Cuadrada con Restricción',
    topic: 'inversa',
    functionFormula: 'f(x) = \\sqrt{x - 2} + 1',
    secondaryFormula: 'f^{-1}(x) = (x - 1)^2 + 2, \\quad x \\ge 1',
    functionType: 'Inversa',
    domain: '[2, +∞)',
    range: '[1, +∞)',
    prompt: 'Para f(x) = √(x - 2) + 1, determina su inversa f⁻¹(x) y especifica su dominio restringido.',
    baseXp: 50,
    doubleXp: 100,
    participationPoints: 2,
    tip: 'El dominio de la inversa f⁻¹ es obligatoriamente el RANGO de la función original f.',
    options: [
      { id: 'opt_1', text: 'f⁻¹(x) = (x - 1)² + 2 con dominio x ≥ 1', isCorrect: true, explanationNote: '¡Excelente! y = √(x-2)+1 ⇒ y-1 = √(x-2) ⇒ (y-1)² = x-2 ⇒ x = (y-1)²+2. Como Ran(f) = [1, +∞), Dom(f⁻¹) = [1, +∞).' },
      { id: 'opt_2', text: 'f⁻¹(x) = (x + 1)² - 2 con dominio x ≥ 2', isCorrect: false, explanationNote: 'Los signos dentro y fuera del paréntesis están invertidos.' },
      { id: 'opt_3', text: 'f⁻¹(x) = x² - 1 con dominio ℝ', isCorrect: false, explanationNote: 'Sin la restricción x ≥ 1, no sería inyectiva ni inversa verdadera.' },
      { id: 'opt_4', text: 'f⁻¹(x) = 1/(√(x - 2) + 1)', isCorrect: false, explanationNote: 'Esa es la inversa multiplicativa o recíproco.' }
    ],
    stepByStepSolution: {
      title: 'Solución del Reto 18h00: Inversa de Radical',
      formulaBreakdown: '1) y = √(x - 2) + 1\n2) y - 1 = √(x - 2)\n3) Elevamos al cuadrado ambos lados: (y - 1)² = x - 2\n4) x = (y - 1)² + 2\n5) f⁻¹(x) = (x - 1)² + 2 con x ≥ 1.',
      domainExplanation: 'El Rango de f es [1, +∞) porque la raíz principal es ≥ 0. Por ende: Dom(f⁻¹) = [1, +∞).',
      rangeExplanation: 'Ran(f⁻¹) = Dom(f) = [2, +∞).',
      interceptsExplanation: 'f inicia en (2, 1). Su inversa f⁻¹ inicia en (1, 2) reflejada sobre la diagonal.',
      graphObservation: 'Media parábola simétrica con la curva radical a través del eje diagonal y = x.',
      pedagogicalTip: 'Siempre que inviertas una función con dominio o rango acotado, debes escribir la restricción en la inversa.'
    },
    graphConfig: {
      xMin: 0,
      xMax: 8,
      yMin: 0,
      yMax: 8,
      evalFunctionCode: 'x >= 2 ? (Math.sqrt(x - 2) + 1) : null',
      secondaryEvalCode: 'x >= 1 ? ((x - 1) * (x - 1) + 2) : null',
      secondaryLabel: 'f⁻¹(x) = (x-1)² + 2 (x≥1)',
      showDiagonalSymmetry: true,
      keyPoints: [
        { x: 2, y: 1, label: 'Inicio f: (2, 1)', color: '#0D47A1', type: 'reference' },
        { x: 1, y: 2, label: 'Inicio f⁻¹: (1, 2)', color: '#DC2626', type: 'reference' }
      ]
    }
  }
];
