import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // NIVEL 1: FUNCIONES LINEALES, AFINES Y CONSTANTES
  // ==========================================
  {
    id: 'lvl1_q1',
    level: 1,
    topic: 'tipo',
    title: 'Clasificación de la recta',
    functionFormula: 'f(x) = 3x - 6',
    functionType: 'Afín',
    domain: 'ℝ = (-∞, +∞)',
    range: 'ℝ = (-∞, +∞)',
    xIntercepts: ['(2, 0)'],
    yIntercept: '(0, -6)',
    prompt: 'Dada la función f(x) = 3x - 6, ¿qué tipo de función representa y cuál es su pendiente (m)?',
    questionType: 'multiple-choice',
    difficulty: 'Fácil',
    xpReward: 30,
    options: [
      { id: 'opt_1', text: 'Función Afín con pendiente m = 3', isCorrect: true, explanationNote: 'Correcto: es de la forma f(x) = mx + b con b ≠ 0 y m = 3.' },
      { id: 'opt_2', text: 'Función Lineal pura con m = -6', isCorrect: false, explanationNote: 'La lineal pura pasa por el origen (b = 0). Aquí b = -6.' },
      { id: 'opt_3', text: 'Función Cuadrática con pendiente m = 2', isCorrect: false, explanationNote: 'El grado del polinomio es 1, no 2.' },
      { id: 'opt_4', text: 'Función Constante con m = 3', isCorrect: false, explanationNote: 'Una función constante tiene la forma f(x) = c, sin variable x.' },
    ],
    stepByStepSolution: {
      title: 'Solución detallada: Clasificación y Pendiente',
      formulaBreakdown: 'La expresión f(x) = 3x - 6 es un polinomio de grado 1 de la forma f(x) = mx + b.',
      domainExplanation: 'Al ser un polinomio sin fracciones ni raíces, su dominio son todos los reales: Dom(f) = ℝ.',
      rangeExplanation: 'Las funciones afines no acotadas recorren todo el eje vertical: Ran(f) = ℝ.',
      interceptsExplanation: 'Corte con Y: f(0) = 3(0) - 6 = -6 ⇒ (0, -6). Corte con X: 3x - 6 = 0 ⇒ 3x = 6 ⇒ x = 2 ⇒ (2, 0).',
      graphObservation: 'Es una línea recta creciente (porque m = 3 > 0) que cruza el eje Y en -6 y el eje X en 2.',
      pedagogicalTip: 'Recuerda: si b = 0 es "Lineal" (pasa por el origen). Si b ≠ 0 se le llama específicamente "Afín".'
    },
    graphConfig: {
      xMin: -3,
      xMax: 6,
      yMin: -8,
      yMax: 6,
      evalFunctionCode: '3 * x - 6',
      keyPoints: [
        { x: 0, y: -6, label: 'Corte Y: (0, -6)', color: '#0D47A1', type: 'y-intercept' },
        { x: 2, y: 0, label: 'Corte X: (2, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  },
  {
    id: 'lvl1_q2',
    level: 1,
    topic: 'cortes',
    title: 'Puntos de corte con los ejes',
    functionFormula: 'f(x) = -2x + 4',
    functionType: 'Afín',
    domain: 'ℝ',
    range: 'ℝ',
    xIntercepts: ['(2, 0)'],
    yIntercept: '(0, 4)',
    prompt: 'Para la función f(x) = -2x + 4, determina las coordenadas exactas de los puntos de corte con los ejes X e Y.',
    questionType: 'multiple-choice',
    difficulty: 'Fácil',
    xpReward: 35,
    options: [
      { id: 'opt_1', text: 'Eje X: (2, 0)  |  Eje Y: (0, 4)', isCorrect: true, explanationNote: '¡Excelente! f(0)=4 y al resolver -2x+4=0 obtenemos x=2.' },
      { id: 'opt_2', text: 'Eje X: (-2, 0) |  Eje Y: (0, -4)', isCorrect: false, explanationNote: 'Cuidado con los signos al despejar x.' },
      { id: 'opt_3', text: 'Eje X: (4, 0)  |  Eje Y: (0, 2)', isCorrect: false, explanationNote: 'Los valores de corte están invertidos.' },
      { id: 'opt_4', text: 'Eje X: (0, 2)  |  Eje Y: (4, 0)', isCorrect: false, explanationNote: 'Un corte en el eje X tiene coordenada y=0, es decir (x, 0).' },
    ],
    stepByStepSolution: {
      title: 'Paso a paso: Hallar cortes con los ejes',
      formulaBreakdown: 'Dada f(x) = -2x + 4:',
      domainExplanation: 'Dominio: Al ser polinomial, Dom(f) = ℝ.',
      rangeExplanation: 'Rango: Al ser afín con m ≠ 0, Ran(f) = ℝ.',
      interceptsExplanation: '1) Corte en el eje Y (hacer x = 0): f(0) = -2(0) + 4 = 4 ⇒ Punto (0, 4).\n2) Corte en el eje X (hacer y = 0): -2x + 4 = 0 ⇒ -2x = -4 ⇒ x = 2 ⇒ Punto (2, 0).',
      graphObservation: 'Pendiente negativa (m = -2 < 0): la recta desciende de izquierda a derecha pasando por (0, 4) y (2, 0).',
      pedagogicalTip: 'Para cualquier función: el corte con Y siempre es f(0). Los cortes con X son las soluciones de f(x) = 0.'
    },
    graphConfig: {
      xMin: -2,
      xMax: 5,
      yMin: -4,
      yMax: 7,
      evalFunctionCode: '-2 * x + 4',
      keyPoints: [
        { x: 0, y: 4, label: 'Corte Y: (0, 4)', color: '#0D47A1', type: 'y-intercept' },
        { x: 2, y: 0, label: 'Corte X: (2, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  },

  // ==========================================
  // NIVEL 2: CUADRÁTICAS Y PARÁBOLAS
  // ==========================================
  {
    id: 'lvl2_q1',
    level: 2,
    topic: 'cortes',
    title: 'Vértice y cortes de una parábola',
    functionFormula: 'f(x) = x^2 - 4x + 3',
    functionType: 'Cuadrática',
    domain: 'ℝ',
    range: '[-1, +∞)',
    xIntercepts: ['(1, 0)', '(3, 0)'],
    yIntercept: '(0, 3)',
    vertex: '(2, -1)',
    prompt: 'Calcula el vértice V(h, k) y los puntos de corte con el eje X de la función cuadrática f(x) = x² - 4x + 3.',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 45,
    options: [
      { id: 'opt_1', text: 'Vértice: (2, -1)  |  Cortes con X: (1, 0) y (3, 0)', isCorrect: true, explanationNote: '¡Excelente! h = -(-4)/(2*1) = 2, k = f(2) = -1. Raíces factorizando: (x-1)(x-3)=0.' },
      { id: 'opt_2', text: 'Vértice: (-2, 1) |  Cortes con X: (-1, 0) y (-3, 0)', isCorrect: false, explanationNote: 'Error en la fórmula h = -b/(2a): con b = -4, h debe ser positivo.' },
      { id: 'opt_3', text: 'Vértice: (2, 3)   |  Cortes con X: (0, 1) y (0, 3)', isCorrect: false, explanationNote: 'k = f(2) = 4 - 8 + 3 = -1, no 3.' },
      { id: 'opt_4', text: 'Vértice: (4, -1)  |  Cortes con X: (2, 0) y (4, 0)', isCorrect: false, explanationNote: 'Verifica la división por 2a en el cálculo del vértice.' },
    ],
    stepByStepSolution: {
      title: 'Solución de Parábola: Vértice y Raíces',
      formulaBreakdown: 'Coeficientes: a = 1, b = -4, c = 3. Como a > 0, la parábola es cóncava hacia arriba (abierta hacia arriba).',
      domainExplanation: 'Por ser una función polinómica de 2do grado: Dom(f) = ℝ.',
      rangeExplanation: 'Al abrir hacia arriba, el valor mínimo es la ordenada del vértice k = -1. Por tanto: Ran(f) = [-1, +∞).',
      interceptsExplanation: '1) Vértice: h = -b/(2a) = -(-4)/(2·1) = 2. Evaluando k = f(2) = 2² - 4(2) + 3 = 4 - 8 + 3 = -1 ⇒ V(2, -1).\n2) Corte con Y: f(0) = 3 ⇒ (0, 3).\n3) Cortes con X: x² - 4x + 3 = 0 ⇒ (x - 1)(x - 3) = 0 ⇒ x₁ = 1, x₂ = 3 ⇒ (1, 0) y (3, 0).',
      graphObservation: 'El vértice V(2, -1) es el punto más bajo. La parábola tiene eje de simetría en x = 2.',
      pedagogicalTip: 'La forma canónica f(x) = (x - 2)² - 1 revela de inmediato el vértice (2, -1).'
    },
    graphConfig: {
      xMin: -1,
      xMax: 5,
      yMin: -3,
      yMax: 6,
      evalFunctionCode: 'x * x - 4 * x + 3',
      keyPoints: [
        { x: 2, y: -1, label: 'Vértice: (2, -1)', color: '#F59E0B', type: 'vertex' },
        { x: 0, y: 3, label: 'Corte Y: (0, 3)', color: '#0D47A1', type: 'y-intercept' },
        { x: 1, y: 0, label: 'Corte X₁: (1, 0)', color: '#059669', type: 'x-intercept' },
        { x: 3, y: 0, label: 'Corte X₂: (3, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  },

  // ==========================================
  // NUEVO TEMA: COMPOSICIÓN DE FUNCIONES (f ∘ g)
  // ==========================================
  {
    id: 'lvl_comp_1',
    level: 3,
    topic: 'composicion',
    title: 'Composición de Funciones (f ∘ g)(x)',
    functionFormula: 'f(x) = 2x + 3',
    secondaryFormula: 'g(x) = x^2 - 1',
    functionType: 'Compuesta',
    domain: 'ℝ',
    range: '[1, +∞)',
    xIntercepts: ['No tiene cortes reales'],
    yIntercept: '(0, 1)',
    prompt: 'Dadas las funciones f(x) = 2x + 3 y g(x) = x² - 1, determina la regla de correspondencia de (f ∘ g)(x) y calcula (f ∘ g)(3).',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 55,
    options: [
      { id: 'opt_1', text: '(f ∘ g)(x) = 2x² + 1  |  (f ∘ g)(3) = 19', isCorrect: true, explanationNote: '¡Excelente! f(g(x)) = 2(x² - 1) + 3 = 2x² - 2 + 3 = 2x² + 1. Y para x=3: 2(9) + 1 = 19.' },
      { id: 'opt_2', text: '(f ∘ g)(x) = 4x² + 12x + 8  |  (f ∘ g)(3) = 80', isCorrect: false, explanationNote: 'Esa sería la composición inversa (g ∘ f)(x) = (2x+3)² - 1.' },
      { id: 'opt_3', text: '(f ∘ g)(x) = 2x² - 1  |  (f ∘ g)(3) = 17', isCorrect: false, explanationNote: 'Faltó sumar el +3 de la función exterior f.' },
      { id: 'opt_4', text: '(f ∘ g)(x) = 2x³ + 3  |  (f ∘ g)(3) = 57', isCorrect: false, explanationNote: 'No es multiplicación f(x)·g(x), es sustituir g(x) dentro de x en f.' },
    ],
    stepByStepSolution: {
      title: 'Paso a paso: Composición f(g(x))',
      formulaBreakdown: '1) Tomamos f(x) = 2x + 3.\n2) Sustituimos cada "x" por la expresión completa de g(x) = x² - 1:\n   (f ∘ g)(x) = f(g(x)) = 2(x² - 1) + 3\n   = 2x² - 2 + 3 = 2x² + 1.\n3) Evaluamos en x = 3:\n   (f ∘ g)(3) = 2(3)² + 1 = 2(9) + 1 = 19.',
      domainExplanation: 'Dom(f ∘ g) = { x ∈ Dom(g) | g(x) ∈ Dom(f) }. Como ambos son polinomios, Dom(f ∘ g) = ℝ.',
      rangeExplanation: 'Como x² ≥ 0, 2x² ≥ 0, entonces 2x² + 1 ≥ 1. Ran(f ∘ g) = [1, +∞).',
      interceptsExplanation: 'Corte con Y: f(g(0)) = 2(0)² + 1 = 1 ⇒ (0, 1). Cortes con X: 2x² + 1 = 0 no tiene solución real.',
      graphObservation: 'La curva resultante es una parábola vertical con vértice en (0, 1).',
      pedagogicalTip: 'Ten presente que en general (f ∘ g)(x) ≠ (g ∘ f)(x); la composición de funciones NO es conmutativa.'
    },
    graphConfig: {
      xMin: -4,
      xMax: 4,
      yMin: -1,
      yMax: 10,
      evalFunctionCode: '2 * x * x + 1',
      secondaryEvalCode: 'x * x - 1',
      secondaryLabel: 'g(x) = x² - 1',
      keyPoints: [
        { x: 0, y: 1, label: 'Vértice (f∘g): (0, 1)', color: '#0D47A1', type: 'vertex' }
      ]
    }
  },
  {
    id: 'lvl_comp_2',
    level: 4,
    topic: 'composicion',
    title: 'Dominio de una Función Compuesta',
    functionFormula: 'f(x) = \\sqrt{x}',
    secondaryFormula: 'g(x) = 2x - 6',
    functionType: 'Compuesta',
    domain: '[3, +∞)',
    range: '[0, +∞)',
    xIntercepts: ['(3, 0)'],
    yIntercept: 'No tiene',
    prompt: 'Si f(x) = √x y g(x) = 2x - 6, ¿cuál es la fórmula de (f ∘ g)(x) y su Dominio de validez en ℝ?',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 55,
    options: [
      { id: 'opt_1', text: '(f ∘ g)(x) = √(2x - 6) con Dominio [3, +∞)', isCorrect: true, explanationNote: '¡Correcto! f(g(x)) = √(2x-6). El radicando debe ser no negativo: 2x - 6 ≥ 0 ⇒ x ≥ 3.' },
      { id: 'opt_2', text: '(f ∘ g)(x) = 2√x - 6 con Dominio [0, +∞)', isCorrect: false, explanationNote: 'Esa corresponde a g(f(x)), no a f(g(x)).' },
      { id: 'opt_3', text: '(f ∘ g)(x) = √(2x - 6) con Dominio ℝ', isCorrect: false, explanationNote: 'Las raíces pares no existen en reales para valores menores a 3.' },
      { id: 'opt_4', text: '(f ∘ g)(x) = √(2x) - 6 con Dominio (3, +∞)', isCorrect: false, explanationNote: 'El -6 está dentro del radical: √(2x - 6).' },
    ],
    stepByStepSolution: {
      title: 'Determinación de Dominio Compuesto',
      formulaBreakdown: '(f ∘ g)(x) = f(g(x)) = √(2x - 6).',
      domainExplanation: 'Para que la raíz cuadrada exista en los reales, el radicando no puede ser negativo: 2x - 6 ≥ 0 ⇒ 2x ≥ 6 ⇒ x ≥ 3. Por tanto, Dom(f ∘ g) = [3, +∞).',
      rangeExplanation: 'La raíz cuadrada aritmética produce salidas no negativas: Ran(f ∘ g) = [0, +∞).',
      interceptsExplanation: 'Corte con X: √(2x - 6) = 0 ⇒ 2x = 6 ⇒ x = 3 ⇒ (3, 0). Corte con Y no existe porque x=0 no está en el dominio.',
      graphObservation: 'Curva radical que inicia en (3, 0) y asciende hacia la derecha.',
      pedagogicalTip: 'Para el dominio de (f ∘ g), primero revisa que x esté en Dom(g) y luego que g(x) esté en Dom(f).'
    },
    graphConfig: {
      xMin: 0,
      xMax: 8,
      yMin: -1,
      yMax: 5,
      evalFunctionCode: 'x >= 3 ? Math.sqrt(2 * x - 6) : null',
      keyPoints: [
        { x: 3, y: 0, label: 'Inicio: (3, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  },

  // ==========================================
  // NUEVO TEMA: FUNCIÓN INVERSA (f⁻¹)
  // ==========================================
  {
    id: 'lvl_inv_1',
    level: 4,
    topic: 'inversa',
    title: 'Cálculo de la Función Inversa f⁻¹(x)',
    functionFormula: 'f(x) = 3x - 5',
    secondaryFormula: 'f^{-1}(x) = \\frac{x + 5}{3}',
    functionType: 'Inversa',
    domain: 'ℝ',
    range: 'ℝ',
    xIntercepts: ['(5/3, 0)'],
    yIntercept: '(0, -5)',
    prompt: 'Dada la función biyectiva f(x) = 3x - 5, calcula su función inversa f⁻¹(x).',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 60,
    options: [
      { id: 'opt_1', text: 'f⁻¹(x) = (x + 5) / 3', isCorrect: true, explanationNote: '¡Excelente! Escribimos y = 3x - 5, despejamos x = (y+5)/3, e intercambiamos variables.' },
      { id: 'opt_2', text: 'f⁻¹(x) = (x - 5) / 3', isCorrect: false, explanationNote: 'El -5 pasa al otro miembro sumando (+5), no restando.' },
      { id: 'opt_3', text: 'f⁻¹(x) = 1 / (3x - 5)', isCorrect: false, explanationNote: '1/f(x) es el recíproco multiplicativo, NO la función inversa.' },
      { id: 'opt_4', text: 'f⁻¹(x) = 3x + 5', isCorrect: false, explanationNote: 'Faltó despejar el coeficiente 3 que multiplica a x.' },
    ],
    stepByStepSolution: {
      title: 'Método Algebraico de Inversión',
      formulaBreakdown: '1) Escribir con "y": y = 3x - 5.\n2) Despejar la variable x:\n   y + 5 = 3x ⇒ x = (y + 5) / 3.\n3) Intercambiar x por y para denotar la inversa:\n   f⁻¹(x) = (x + 5) / 3 = (1/3)x + 5/3.',
      domainExplanation: 'Dom(f⁻¹) = Ran(f) = ℝ.',
      rangeExplanation: 'Ran(f⁻¹) = Dom(f) = ℝ.',
      interceptsExplanation: 'Para f: corte en (0, -5) y (5/3, 0). Para su inversa f⁻¹: las coordenadas se invierten a (-5, 0) y (0, 5/3).',
      graphObservation: 'Las gráficas de f(x) y f⁻¹(x) son exactamente simétricas respecto a la recta diagonal y = x.',
      pedagogicalTip: 'Para comprobar si tu inversa es correcta, verifica que f(f⁻¹(x)) = x.'
    },
    graphConfig: {
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      evalFunctionCode: '3 * x - 5',
      secondaryEvalCode: '(x + 5) / 3',
      secondaryLabel: 'f⁻¹(x) = (x + 5)/3',
      showDiagonalSymmetry: true,
      keyPoints: [
        { x: 0, y: -5, label: 'f(0) = -5', color: '#0D47A1', type: 'y-intercept' },
        { x: -5, y: 0, label: 'f⁻¹(-5) = 0', color: '#DC2626', type: 'reference' }
      ]
    }
  },
  {
    id: 'lvl_inv_2',
    level: 5,
    topic: 'inversa',
    title: 'Inversa de Función Homográfica (Racional)',
    functionFormula: 'f(x) = \\frac{2x + 1}{x - 3}',
    secondaryFormula: 'f^{-1}(x) = \\frac{3x + 1}{x - 2}',
    functionType: 'Inversa',
    domain: 'ℝ - { 3 }',
    range: 'ℝ - { 2 }',
    xIntercepts: ['(-1/2, 0)'],
    yIntercept: '(0, -1/3)',
    prompt: 'Encuentra la función inversa f⁻¹(x) de la función racional f(x) = (2x + 1) / (x - 3).',
    questionType: 'multiple-choice',
    difficulty: 'Avanzado',
    xpReward: 70,
    options: [
      { id: 'opt_1', text: 'f⁻¹(x) = (3x + 1) / (x - 2)', isCorrect: true, explanationNote: '¡Maestría total! y(x-3) = 2x+1 ⇒ yx - 3y = 2x + 1 ⇒ x(y-2) = 3y+1 ⇒ x = (3y+1)/(y-2).' },
      { id: 'opt_2', text: 'f⁻¹(x) = (x - 3) / (2x + 1)', isCorrect: false, explanationNote: 'Eso es invertir la fracción (recíproco), no la función inversa.' },
      { id: 'opt_3', text: 'f⁻¹(x) = (2x - 1) / (x + 3)', isCorrect: false, explanationNote: 'Revisa los signos al transponer términos con x.' },
      { id: 'opt_4', text: 'f⁻¹(x) = (3x - 1) / (x + 2)', isCorrect: false, explanationNote: 'El signo del numerador debe ser +1.' },
    ],
    stepByStepSolution: {
      title: 'Inversión de Función Racional Homográfica',
      formulaBreakdown: '1) y = (2x + 1) / (x - 3)\n2) Multiplicamos: y(x - 3) = 2x + 1 ⇒ yx - 3y = 2x + 1\n3) Agrupamos los términos con x a la izquierda: yx - 2x = 3y + 1\n4) Sacamos factor común x: x(y - 2) = 3y + 1\n5) Despejamos x: x = (3y + 1) / (y - 2)\n6) Intercambiamos variables: f⁻¹(x) = (3x + 1) / (x - 2).',
      domainExplanation: 'Dom(f⁻¹) = ℝ - { 2 }, que coincide exactamente con el Rango de f(x).',
      rangeExplanation: 'Ran(f⁻¹) = ℝ - { 3 }, que coincide exactamente con el Dominio de f(x).',
      interceptsExplanation: 'Asíntota vertical de f es x = 3 (asíntota horizontal de f⁻¹). Asíntota horizontal de f es y = 2 (asíntota vertical de f⁻¹).',
      graphObservation: 'Las asíntotas y ramas se reflejan simétricamente respecto a la bisectriz y = x.',
      pedagogicalTip: 'Para funciones (ax + b)/(cx + d), la inversa siempre es (dx - b)/(-cx + a) o multiplicando por -1: (-dx + b)/(cx - a).'
    },
    graphConfig: {
      xMin: -6,
      xMax: 8,
      yMin: -6,
      yMax: 8,
      evalFunctionCode: '(2 * x + 1) / (x - 3)',
      secondaryEvalCode: '(3 * x + 1) / (x - 2)',
      secondaryLabel: 'f⁻¹(x) = (3x+1)/(x-2)',
      showDiagonalSymmetry: true,
      asymptotes: {
        vertical: [3],
        horizontal: [2]
      }
    }
  },

  // ==========================================
  // NIVEL 3: FUNCIONES RACIONALES Y RADICALES
  // ==========================================
  {
    id: 'lvl3_q1',
    level: 3,
    topic: 'dominio',
    title: 'Restricción de Dominio en Función Racional',
    functionFormula: 'f(x) = \\frac{1}{x - 3}',
    functionType: 'Racional',
    domain: 'ℝ - { 3 }',
    range: 'ℝ - { 0 }',
    xIntercepts: ['No tiene'],
    yIntercept: '(0, -1/3)',
    prompt: 'Determina el dominio y la ecuación de la asíntota vertical de la función f(x) = 1 / (x - 3).',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 50,
    options: [
      { id: 'opt_1', text: 'Dom(f) = ℝ - {3} y Asíntota Vertical en x = 3', isCorrect: true, explanationNote: '¡Perfecto! La división por cero ocurre exactamente cuando x - 3 = 0 ⇒ x = 3.' },
      { id: 'opt_2', text: 'Dom(f) = ℝ - {-3} y Asíntota en x = -3', isCorrect: false, explanationNote: 'Si x = -3, el denominador es -3 - 3 = -6 ≠ 0.' },
      { id: 'opt_3', text: 'Dom(f) = [3, +∞) y Asíntota en y = 3', isCorrect: false, explanationNote: 'No es una raíz cuadrada, x puede ser menor que 3 (ej. x = 0).' },
      { id: 'opt_4', text: 'Dom(f) = ℝ y no tiene asíntotas', isCorrect: false, explanationNote: 'Existe restricción al haber una variable en el denominador.' },
    ],
    stepByStepSolution: {
      title: 'Restricción de Denominador y Asíntota',
      formulaBreakdown: 'En una función racional P(x)/Q(x), no se puede dividir entre cero: Q(x) ≠ 0.',
      domainExplanation: 'Planteamos: x - 3 ≠ 0 ⇒ x ≠ 3. Por lo tanto, el dominio son todos los reales excepto el 3: Dom(f) = ℝ - { 3 } = (-∞, 3) ∪ (3, +∞).',
      rangeExplanation: 'Una fracción con numerador constante 1 nunca puede ser igual a 0. Así: Ran(f) = ℝ - { 0 }.',
      interceptsExplanation: 'Asíntota Vertical: x = 3. Asíntota Horizontal: y = 0. Corte con Y: f(0) = 1/(0 - 3) = -1/3 ⇒ (0, -1/3). Corte con X: 1/(x - 3) = 0 (imposible, sin cortes).',
      graphObservation: 'Hipérbola con dos ramas separadas por la asíntota vertical en x = 3.',
      pedagogicalTip: 'Para hallar la asíntota vertical de una función racional irreducible, iguala el denominador a cero y despeja x.'
    },
    graphConfig: {
      xMin: -2,
      xMax: 8,
      yMin: -5,
      yMax: 5,
      evalFunctionCode: '1 / (x - 3)',
      asymptotes: {
        vertical: [3],
        horizontal: [0]
      },
      keyPoints: [
        { x: 0, y: -0.333, label: 'Corte Y: (0, -1/3)', color: '#0D47A1', type: 'y-intercept' }
      ]
    }
  },
  {
    id: 'lvl3_q2',
    level: 3,
    topic: 'dominio',
    title: 'Dominio de Función Radical',
    functionFormula: 'g(x) = \\sqrt{2x - 4}',
    functionType: 'Radical',
    domain: '[2, +∞)',
    range: '[0, +∞)',
    xIntercepts: ['(2, 0)'],
    yIntercept: 'No tiene (x=0 fuera de dominio)',
    prompt: 'Para g(x) = √(2x - 4), ¿cuál es su dominio en el conjunto de los números reales ℝ?',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 50,
    options: [
      { id: 'opt_1', text: 'Dom(g) = [2, +∞)', isCorrect: true, explanationNote: '¡Muy bien! El radicando debe ser mayor o igual a cero: 2x - 4 ≥ 0 ⇒ 2x ≥ 4 ⇒ x ≥ 2.' },
      { id: 'opt_2', text: 'Dom(g) = (-∞, 2]', isCorrect: false, explanationNote: 'Si x = 0, √(2(0) - 4) = √(-4), que no es un número real.' },
      { id: 'opt_3', text: 'Dom(g) = ℝ - {2}', isCorrect: false, explanationNote: 'No es una fracción; la raíz de cero sí existe (√0 = 0).' },
      { id: 'opt_4', text: 'Dom(g) = (2, +∞) con intervalo abierto', isCorrect: false, explanationNote: 'El valor 2 sí está incluido, ya que √(2(2) - 4) = √0 = 0.' },
    ],
    stepByStepSolution: {
      title: 'Condición de Existencia en Radicales Pares',
      formulaBreakdown: 'Las raíces cuadradas y de índice par solo están definidas en ℝ cuando el radicando es no negativo.',
      domainExplanation: 'Condición: 2x - 4 ≥ 0 ⇒ 2x ≥ 4 ⇒ x ≥ 2. En notación de intervalos: Dom(g) = [2, +∞).',
      rangeExplanation: 'Por definición de la raíz cuadrada principal aritmética: √u ≥ 0. Por tanto: Ran(g) = [0, +∞).',
      interceptsExplanation: 'Corte con X: g(x) = 0 ⇒ √(2x - 4) = 0 ⇒ 2x - 4 = 0 ⇒ x = 2 ⇒ (2, 0). Corte con Y: no existe porque x = 0 no pertenece al dominio [2, +∞).',
      graphObservation: 'La curva comienza exactamente en el punto (2, 0) y crece continuamente hacia la derecha.',
      pedagogicalTip: 'Siempre que veas una raíz de índice par (como raíz cuadrada), plantea "radicando ≥ 0".'
    },
    graphConfig: {
      xMin: -1,
      xMax: 8,
      yMin: -1,
      yMax: 5,
      evalFunctionCode: 'x >= 2 ? Math.sqrt(2 * x - 4) : null',
      keyPoints: [
        { x: 2, y: 0, label: 'Inicio y Corte X: (2, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  },

  // ==========================================
  // NIVEL 4: EXPONENCIALES Y LOGARÍTMICAS
  // ==========================================
  {
    id: 'lvl4_q1',
    level: 4,
    topic: 'tipo',
    title: 'Función Exponencial Básica',
    functionFormula: 'f(x) = 2^x',
    functionType: 'Exponencial',
    domain: 'ℝ',
    range: '(0, +∞)',
    xIntercepts: ['No tiene'],
    yIntercept: '(0, 1)',
    prompt: 'Analiza f(x) = 2ˣ. ¿Cuál es su corte con el eje Y, su asíntota horizontal y su Rango?',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 55,
    options: [
      { id: 'opt_1', text: 'Corte Y: (0, 1), Asíntota Horizontal: y = 0, Rango = (0, +∞)', isCorrect: true, explanationNote: '¡Brillante! 2⁰ = 1, 2ˣ > 0 para todo x real, y cuando x tiende a -∞ la gráfica se acerca a y = 0.' },
      { id: 'opt_2', text: 'Corte Y: (0, 0), Asíntota Vertical: x = 0, Rango = ℝ', isCorrect: false, explanationNote: '2⁰ = 1, no pasa por el origen (0, 0).' },
      { id: 'opt_3', text: 'Corte Y: (0, 2), Asíntota Horizontal: y = 1, Rango = [1, +∞)', isCorrect: false, explanationNote: 'Cualquier número no nulo elevado a la potencia 0 es 1.' },
      { id: 'opt_4', text: 'Corte Y: (1, 0), sin asíntotas, Rango = [0, +∞)', isCorrect: false, explanationNote: '2ˣ nunca puede ser exactamente 0.' },
    ],
    stepByStepSolution: {
      title: 'Comportamiento de la Función Exponencial Base a = 2',
      formulaBreakdown: 'La función f(x) = 2ˣ tiene base a = 2 > 1, por lo que es estrictamente creciente.',
      domainExplanation: 'El exponente x puede ser cualquier número real (positivo, cero o negativo): Dom(f) = ℝ.',
      rangeExplanation: 'Una base positiva elevada a cualquier potencia real siempre resulta positiva: 2ˣ > 0. Por ende, Ran(f) = (0, +∞).',
      interceptsExplanation: 'Corte con Y: f(0) = 2⁰ = 1 ⇒ (0, 1). Corte con X: 2ˣ = 0 (no tiene solución real, nunca corta al eje X). Asíntota Horizontal: y = 0 (hacia la izquierda).',
      graphObservation: 'Crecimiento vertiginoso para x > 0 (ej. f(3)=8, f(4)=16) y aproximación infinitesimal al eje X para x negativos (f(-3)=1/8).',
      pedagogicalTip: 'Toda exponencial elemental f(x) = aˣ con a > 0 y a ≠ 1 pasa obligatoriamente por el punto (0, 1).'
    },
    graphConfig: {
      xMin: -4,
      xMax: 4,
      yMin: -1,
      yMax: 9,
      evalFunctionCode: 'Math.pow(2, x)',
      asymptotes: {
        horizontal: [0]
      },
      keyPoints: [
        { x: 0, y: 1, label: 'Corte Y: (0, 1)', color: '#0D47A1', type: 'y-intercept' },
        { x: 1, y: 2, label: 'Punto: (1, 2)', color: '#1565C0', type: 'reference' },
        { x: 2, y: 4, label: 'Punto: (2, 4)', color: '#1565C0', type: 'reference' }
      ]
    }
  },

  // ==========================================
  // NIVEL 5: VALOR ABSOLUTO Y A TROZOS
  // ==========================================
  {
    id: 'lvl5_q1',
    level: 5,
    topic: 'grafica',
    title: 'Función Valor Absoluto Trasladada',
    functionFormula: 'f(x) = |x - 2| - 3',
    functionType: 'Valor Absoluto',
    domain: 'ℝ',
    range: '[-3, +∞)',
    xIntercepts: ['(-1, 0)', '(5, 0)'],
    yIntercept: '(0, -1)',
    vertex: '(2, -3)',
    prompt: 'Encuentra el vértice (punto de quiebre en V) y los cortes con el eje X de f(x) = |x - 2| - 3.',
    questionType: 'multiple-choice',
    difficulty: 'Medio',
    xpReward: 50,
    options: [
      { id: 'opt_1', text: 'Vértice: (2, -3)  |  Cortes con X: (-1, 0) y (5, 0)', isCorrect: true, explanationNote: '¡Exacto! El vértice ocurre donde x-2=0 ⇒ x=2, y=-3. Y |x-2|=3 ⇒ x-2=3 ó x-2=-3 ⇒ x=5, x=-1.' },
      { id: 'opt_2', text: 'Vértice: (-2, 3) |  Cortes con X: (1, 0) y (-5, 0)', isCorrect: false, explanationNote: 'Cuidado con el signo en la forma canónica |x - h| + k.' },
      { id: 'opt_3', text: 'Vértice: (2, 0)   |  Cortes con X: (3, 0) y (-3, 0)', isCorrect: false, explanationNote: 'El desplazamiento vertical k es -3, por lo que el vértice está en y = -3.' },
      { id: 'opt_4', text: 'Vértice: (0, -1)  |  Cortes con X: (2, 0) y (-2, 0)', isCorrect: false, explanationNote: '(0, -1) es el corte con el eje Y.' },
    ],
    stepByStepSolution: {
      title: 'Propiedades del Valor Absoluto en V',
      formulaBreakdown: 'Forma canónica: f(x) = a|x - h| + k con vértice en (h, k). Aquí h = 2, k = -3.',
      domainExplanation: 'El valor absoluto acepta cualquier número real: Dom(f) = ℝ.',
      rangeExplanation: 'Como |x - 2| ≥ 0, el valor mínimo es 0 - 3 = -3. Ran(f) = [-3, +∞).',
      interceptsExplanation: '1) Corte con Y: f(0) = |0 - 2| - 3 = 2 - 3 = -1 ⇒ (0, -1).\n2) Cortes con X: |x - 2| - 3 = 0 ⇒ |x - 2| = 3 ⇒ x - 2 = 3 ó x - 2 = -3 ⇒ x = 5 ó x = -1 ⇒ (5, 0) y (-1, 0).',
      graphObservation: 'Gráfica simétrica en forma de "V" con vértice en (2, -3) y ramas con pendientes m = 1 y m = -1.',
      pedagogicalTip: 'Para resolver |expresión| = c (con c ≥ 0), divide siempre en dos casos: expresión = c ó expresión = -c.'
    },
    graphConfig: {
      xMin: -3,
      xMax: 7,
      yMin: -5,
      yMax: 5,
      evalFunctionCode: 'Math.abs(x - 2) - 3',
      keyPoints: [
        { x: 2, y: -3, label: 'Vértice: (2, -3)', color: '#F59E0B', type: 'vertex' },
        { x: -1, y: 0, label: 'Corte X₁: (-1, 0)', color: '#059669', type: 'x-intercept' },
        { x: 5, y: 0, label: 'Corte X₂: (5, 0)', color: '#059669', type: 'x-intercept' },
        { x: 0, y: -1, label: 'Corte Y: (0, -1)', color: '#0D47A1', type: 'y-intercept' }
      ]
    }
  },

  // ==========================================
  // NIVEL 6: DESAFÍO MAESTRO INTEGRAL
  // ==========================================
  {
    id: 'lvl6_q1',
    level: 6,
    topic: 'integral',
    title: 'Desafío Integral Marianita: Análisis Cuadrático Completo',
    functionFormula: 'f(x) = 2x^2 - 8x + 6',
    functionType: 'Cuadrática',
    domain: 'ℝ',
    range: '[-2, +∞)',
    xIntercepts: ['(1, 0)', '(3, 0)'],
    yIntercept: '(0, 6)',
    vertex: '(2, -2)',
    prompt: 'Para f(x) = 2x² - 8x + 6, identifica la opción que reúne CORRECTAMENTE: Vértice, Rango, Corte con Y y Cortes con X.',
    questionType: 'multiple-choice',
    difficulty: 'Avanzado',
    xpReward: 80,
    options: [
      { id: 'opt_1', text: 'Vértice (2, -2) | Ran = [-2, +∞) | Corte Y: (0, 6) | Cortes X: (1, 0) y (3, 0)', isCorrect: true, explanationNote: '¡Maestría absoluta! Todos los elementos concuerdan matemáticamente.' },
      { id: 'opt_2', text: 'Vértice (-2, 2) | Ran = (-∞, 2] | Corte Y: (0, -6) | Cortes X: (-1, 0) y (-3, 0)', isCorrect: false, explanationNote: 'Los signos del vértice y cortes son incorrectos.' },
      { id: 'opt_3', text: 'Vértice (4, -2) | Ran = [-2, +∞) | Corte Y: (0, 6) | Cortes X: (2, 0) y (4, 0)', isCorrect: false, explanationNote: 'h = -(-8)/(2*2) = 8/4 = 2, no 4.' },
      { id: 'opt_4', text: 'Vértice (2, 6)  | Ran = [6, +∞)  | Corte Y: (0, 2) | Cortes X: No tiene', isCorrect: false, explanationNote: 'k = f(2) = 2(4) - 8(2) + 6 = 8 - 16 + 6 = -2.' },
    ],
    stepByStepSolution: {
      title: 'Diagnóstico Integral de Función Cuadrática',
      formulaBreakdown: 'a = 2, b = -8, c = 6. a > 0 ⇒ Parábola abierta hacia arriba.',
      domainExplanation: 'Dom(f) = ℝ.',
      rangeExplanation: 'h = -(-8) / (2·2) = 2. k = f(2) = 2(2)² - 8(2) + 6 = 8 - 16 + 6 = -2. Ran(f) = [-2, +∞).',
      interceptsExplanation: '1) Corte Y: f(0) = 6 ⇒ (0, 6).\n2) Cortes X: 2x² - 8x + 6 = 0 ⇒ dividiendo entre 2: x² - 4x + 3 = 0 ⇒ (x - 1)(x - 3) = 0 ⇒ (1, 0) y (3, 0).',
      graphObservation: 'Simetría perfecta con respecto a la recta vertical x = 2.',
      pedagogicalTip: 'En evaluaciones quimestrales o de bachillerato, simplificar la ecuación dividiendo por el factor común antes de factorizar ahorra tiempo valioso.'
    },
    graphConfig: {
      xMin: -1,
      xMax: 5,
      yMin: -4,
      yMax: 8,
      evalFunctionCode: '2 * x * x - 8 * x + 6',
      keyPoints: [
        { x: 2, y: -2, label: 'Vértice: (2, -2)', color: '#F59E0B', type: 'vertex' },
        { x: 0, y: 6, label: 'Corte Y: (0, 6)', color: '#0D47A1', type: 'y-intercept' },
        { x: 1, y: 0, label: 'Corte X₁: (1, 0)', color: '#059669', type: 'x-intercept' },
        { x: 3, y: 0, label: 'Corte X₂: (3, 0)', color: '#059669', type: 'x-intercept' }
      ]
    }
  }
];
