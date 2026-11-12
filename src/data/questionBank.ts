import { Question, QuestionOption } from '../types';

/**
 * Deterministic option rotation helper so correct answers are distributed
 * evenly across A (0), B (1), C (2), and D (3) in the static bank,
 * in addition to runtime shuffling.
 */
function buildRotatedOptions(
  correct: { text: string; explanationNote: string },
  distractors: { text: string; explanationNote: string }[],
  seed: number
): QuestionOption[] {
  const targetIdx = ((seed % 4) + 4) % 4;
  const arranged = [...distractors];
  arranged.splice(targetIdx, 0, correct);
  return arranged.map((item, idx) => ({
    id: `opt_${idx + 1}`,
    text: item.text,
    isCorrect: idx === targetIdx,
    explanationNote: item.explanationNote,
  }));
}

function fmtSigned(n: number): string {
  if (n === 0) return '';
  return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function fmtLinear(m: number, b: number, variable = 'x'): string {
  const mPart = m === 1 ? variable : m === -1 ? `-${variable}` : `${m}${variable}`;
  if (b === 0) return mPart;
  return `${mPart} ${fmtSigned(b)}`;
}

function fmtQuad(a: number, b: number, c: number): string {
  const aPart = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${a}x^2`;
  const bPart = b === 0 ? '' : b === 1 ? ' + x' : b === -1 ? ' - x' : b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
  const cPart = c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  return `${aPart}${bPart}${cPart}`;
}

function simplifyFrac(num: number, den: number): string {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
}

function buildLevel1Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Cortes con los ejes (15 ejercicios únicos)
  const affineSpecs: [number, number][] = [
    [2, -6], [-3, 6], [4, -8], [-2, 8], [3, -9],
    [-4, 12], [5, -10], [-5, 15], [2, 8], [-3, -12],
    [6, -18], [-2, -10], [4, 16], [-6, 12], [3, 15],
  ];
  affineSpecs.forEach(([m, b], i) => {
    const xRoot = -b / m;
    const formula = `f(x) = ${fmtLinear(m, b)}`;
    questions.push({
      id: `lvl1_q${questions.length + 1}`,
      level: 1,
      topic: 'cortes',
      title: `Cortes con los ejes (${i + 1})`,
      functionFormula: formula,
      functionType: 'Afín',
      domain: 'ℝ = (-∞, +∞)',
      range: 'ℝ = (-∞, +∞)',
      xIntercepts: [`(${xRoot}, 0)`],
      yIntercept: `(0, ${b})`,
      prompt: `Para la función afín ${formula}, determina las coordenadas exactas de sus puntos de corte con el eje X y el eje Y.`,
      questionType: 'multiple-choice',
      difficulty: 'Fácil',
      xpReward: 30,
      options: buildRotatedOptions(
        {
          text: `Eje X: (${xRoot}, 0)  |  Eje Y: (0, ${b})`,
          explanationNote: `Correcto: f(0) = ${b} da (0, ${b}) y ${fmtLinear(m, b)} = 0 da x = ${xRoot}.`,
        },
        [
          {
            text: `Eje X: (${-xRoot}, 0)  |  Eje Y: (0, ${-b})`,
            explanationNote: 'Error de signo al despejar la raíz o evaluar f(0).',
          },
          {
            text: `Eje X: (${b}, 0)  |  Eje Y: (0, ${xRoot})`,
            explanationNote: 'Los cortes con X e Y están intercambiados.',
          },
          {
            text: `Eje X: (0, ${xRoot})  |  Eje Y: (${b}, 0)`,
            explanationNote: 'En el eje X la segunda coordenada es 0, y en el eje Y la primera es 0.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Solución paso a paso: Cortes de una recta',
        formulaBreakdown: `Dada ${formula}, tiene pendiente m = ${m} y término independiente b = ${b}.`,
        domainExplanation: 'Dom(f) = ℝ por ser polinomial de grado 1.',
        rangeExplanation: 'Ran(f) = ℝ ya que m ≠ 0.',
        interceptsExplanation: `Corte Y (x = 0): f(0) = ${b} ⇒ (0, ${b}). Corte X (y = 0): ${fmtLinear(m, b)} = 0 ⇒ x = ${xRoot} ⇒ (${xRoot}, 0).`,
        graphObservation: m > 0 ? 'Recta creciente de izquierda a derecha.' : 'Recta decreciente de izquierda a derecha.',
        pedagogicalTip: 'Para el corte Y evalúa f(0). Para el corte X iguala la función a cero y despeja x.',
      },
      graphConfig: {
        xMin: Math.min(-4, xRoot - 3),
        xMax: Math.max(4, xRoot + 3),
        yMin: Math.min(-5, b - 3),
        yMax: Math.max(5, b + 3),
        evalFunctionCode: `${m} * x + (${b})`,
        keyPoints: [
          { x: 0, y: b, label: `Corte Y: (0, ${b})`, color: '#0D47A1', type: 'y-intercept' },
          { x: xRoot, y: 0, label: `Corte X: (${xRoot}, 0)`, color: '#059669', type: 'x-intercept' },
        ],
      },
    });
  });

  // 2. Clasificación de funciones: Lineal pura vs Afín vs Constante (12 ejercicios)
  const classSpecs: { m: number; b: number; kind: 'Lineal' | 'Afín' | 'Constante' }[] = [
    { m: 4, b: 0, kind: 'Lineal' },
    { m: -5, b: 0, kind: 'Lineal' },
    { m: 7, b: 0, kind: 'Lineal' },
    { m: -3, b: 0, kind: 'Lineal' },
    { m: 2, b: 5, kind: 'Afín' },
    { m: -4, b: 3, kind: 'Afín' },
    { m: 5, b: -7, kind: 'Afín' },
    { m: -2, b: -9, kind: 'Afín' },
    { m: 0, b: 6, kind: 'Constante' },
    { m: 0, b: -4, kind: 'Constante' },
    { m: 0, b: 9, kind: 'Constante' },
    { m: 0, b: -7, kind: 'Constante' },
  ];

  classSpecs.forEach(({ m, b, kind }, i) => {
    const formula = m === 0 ? `f(x) = ${b}` : `f(x) = ${fmtLinear(m, b)}`;
    const xRoot = m !== 0 ? -b / m : null;
    const correctDesc =
      kind === 'Lineal'
        ? `Función Lineal pura (pasa por el origen) con pendiente m = ${m}`
        : kind === 'Afín'
        ? `Función Afín (b = ${b} ≠ 0) con pendiente m = ${m}`
        : `Función Constante (pendiente m = 0) con corte Y en (0, ${b})`;

    questions.push({
      id: `lvl1_q${questions.length + 1}`,
      level: 1,
      topic: 'tipo',
      title: `Clasificación recta (${i + 1})`,
      functionFormula: formula,
      functionType: kind,
      domain: 'ℝ',
      range: kind === 'Constante' ? `{${b}}` : 'ℝ',
      xIntercepts: xRoot !== null ? [`(${simplifyFrac(-b, m)}, 0)`] : ['No corta al eje X'],
      yIntercept: `(0, ${b})`,
      prompt: `Analiza la expresión ${formula}. ¿Cómo se clasifica correctamente y cuál es su pendiente?`,
      questionType: 'multiple-choice',
      difficulty: 'Fácil',
      xpReward: 30,
      options: buildRotatedOptions(
        { text: correctDesc, explanationNote: `Exacto: corresponde a una función ${kind} con m = ${m}.` },
        [
          {
            text:
              kind === 'Lineal'
                ? `Función Afín con pendiente m = ${m} y b = 1`
                : `Función Lineal pura que pasa por el origen (0, 0)`,
            explanationNote: 'Una función lineal pura exige que b = 0.',
          },
          {
            text:
              kind === 'Constante'
                ? `Función Afín con pendiente m = ${b}`
                : `Función Constante con pendiente m = 0`,
            explanationNote: 'La pendiente m es el coeficiente que multiplica a x.',
          },
          {
            text: `Función Cuadrática de pendiente m = ${m === 0 ? b : m}`,
            explanationNote: 'No hay término en x², por lo tanto es de grado ≤ 1.',
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: `Clasificación: ${kind}`,
        formulaBreakdown: `En la forma f(x) = mx + b tenemos m = ${m} y b = ${b}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: kind === 'Constante' ? `Ran(f) = {${b}} porque y siempre vale ${b}.` : 'Ran(f) = ℝ.',
        interceptsExplanation: `Corte Y en (0, ${b}). ${kind === 'Constante' ? 'Es paralela al eje X y no lo corta.' : ''}`,
        graphObservation: kind === 'Constante' ? 'Recta horizontal paralela al eje X.' : m > 0 ? 'Recta creciente.' : 'Recta decreciente.',
        pedagogicalTip: 'Lineal: b = 0; Afín: b ≠ 0 y m ≠ 0; Constante: m = 0.',
      },
      graphConfig: {
        xMin: -5,
        xMax: 5,
        yMin: Math.min(-5, b - 3),
        yMax: Math.max(5, b + 3),
        evalFunctionCode: m === 0 ? `${b}` : `${m} * x + (${b})`,
        keyPoints: [{ x: 0, y: b, label: `Corte Y: (0, ${b})`, color: '#0D47A1', type: 'y-intercept' }],
      },
    });
  });

  // 3. Monotonía y comportamiento gráfico (12 ejercicios)
  const graphSpecs: [number, number][] = [
    [1, 3], [-1, 5], [2, -1], [-2, -3], [3, 4], [-3, 1],
    [4, -2], [-4, 6], [5, 2], [-5, -4], [0, 3], [0, -6],
  ];
  graphSpecs.forEach(([m, b], i) => {
    const formula = m === 0 ? `f(x) = ${b}` : `f(x) = ${fmtLinear(m, b)}`;
    const behavior =
      m > 0
        ? `Estrictamente creciente en todo ℝ (m = ${m} > 0)`
        : m < 0
        ? `Estrictamente decreciente en todo ℝ (m = ${m} < 0)`
        : `Constante y horizontal en todo ℝ (m = 0)`;
    questions.push({
      id: `lvl1_q${questions.length + 1}`,
      level: 1,
      topic: 'grafica',
      title: `Monotonía de la recta (${i + 1})`,
      functionFormula: formula,
      functionType: m === 0 ? 'Constante' : 'Afín',
      domain: 'ℝ',
      range: m === 0 ? `{${b}}` : 'ℝ',
      xIntercepts: m === 0 ? ['Ninguno'] : [`(${simplifyFrac(-b, m)}, 0)`],
      yIntercept: `(0, ${b})`,
      prompt: `Observando la función ${formula}, ¿cuál es su comportamiento de monotonía y su corte con el eje Y?`,
      questionType: 'multiple-choice',
      difficulty: 'Fácil',
      xpReward: 35,
      options: buildRotatedOptions(
        {
          text: `${behavior}, cruza el eje Y en (0, ${b})`,
          explanationNote: `Correcto: el signo de m = ${m} determina la monotonía y b = ${b} el corte Y.`,
        },
        [
          {
            text:
              m > 0
                ? `Estrictamente decreciente en todo ℝ, cruza Y en (0, ${b})`
                : `Estrictamente creciente en todo ℝ, cruza Y en (0, ${b})`,
            explanationNote: 'Revisa el signo de la pendiente m.',
          },
          {
            text: `${behavior}, cruza el eje Y en (${b}, 0)`,
            explanationNote: 'El corte con el eje Y siempre tiene x = 0.',
          },
          {
            text: `Cóncava hacia arriba con vértice en (0, ${b})`,
            explanationNote: 'Las rectas no tienen vértice ni concavidad parabólica.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Monotonía lineal',
        formulaBreakdown: `Pendiente m = ${m}, ordenada al origen b = ${b}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: m === 0 ? `Ran(f) = {${b}}.` : 'Ran(f) = ℝ.',
        interceptsExplanation: `Corte Y en f(0) = ${b}, es decir (0, ${b}).`,
        graphObservation: behavior,
        pedagogicalTip: 'Si m > 0 sube hacia la derecha; si m < 0 baja; si m = 0 es horizontal.',
      },
      graphConfig: {
        xMin: -5,
        xMax: 5,
        yMin: Math.min(-6, b - 4),
        yMax: Math.max(6, b + 4),
        evalFunctionCode: m === 0 ? `${b}` : `${m} * x + (${b})`,
        keyPoints: [{ x: 0, y: b, label: `Corte Y: (0, ${b})`, color: '#0D47A1', type: 'y-intercept' }],
      },
    });
  });

  // 4. Dominio y Rango en funciones lineales y constantes (11 ejercicios)
  const domRanSpecs: { m: number; b: number; askRange: boolean }[] = [
    { m: 0, b: 8, askRange: true },
    { m: 0, b: -5, askRange: true },
    { m: 0, b: 12, askRange: true },
    { m: 0, b: -9, askRange: true },
    { m: 0, b: 4, askRange: true },
    { m: 2, b: 7, askRange: true },
    { m: -3, b: 5, askRange: true },
    { m: 6, b: -1, askRange: false },
    { m: -7, b: 2, askRange: false },
    { m: 0, b: -11, askRange: false },
    { m: 5, b: -8, askRange: true },
  ];

  domRanSpecs.forEach(({ m, b, askRange }, i) => {
    const formula = m === 0 ? `f(x) = ${b}` : `f(x) = ${fmtLinear(m, b)}`;
    const isConst = m === 0;
    const correctAns = askRange
      ? isConst
        ? `Ran(f) = {${b}}`
        : 'Ran(f) = ℝ = (-∞, +∞)'
      : 'Dom(f) = ℝ = (-∞, +∞)';

    questions.push({
      id: `lvl1_q${questions.length + 1}`,
      level: 1,
      topic: askRange ? 'rango' : 'dominio',
      title: `${askRange ? 'Rango' : 'Dominio'} de recta (${i + 1})`,
      functionFormula: formula,
      functionType: isConst ? 'Constante' : 'Afín',
      domain: 'ℝ',
      range: isConst ? `{${b}}` : 'ℝ',
      xIntercepts: isConst ? ['Ninguno'] : [`(${simplifyFrac(-b, m)}, 0)`],
      yIntercept: `(0, ${b})`,
      prompt: askRange
        ? `Determina el Rango (Recorrido) de la función ${formula}.`
        : `Determina el Dominio de la función ${formula}.`,
      questionType: 'multiple-choice',
      difficulty: 'Fácil',
      xpReward: 30,
      options: buildRotatedOptions(
        { text: correctAns, explanationNote: `Correcto para ${formula}.` },
        [
          {
            text: isConst ? 'Ran(f) = ℝ = (-∞, +∞)' : `Ran(f) = {${b}}`,
            explanationNote: isConst
              ? 'En una función constante la variable y toma un único valor.'
              : 'Cuando m ≠ 0 la recta recorre todo el eje Y.',
          },
          {
            text: `[${b}, +∞)`,
            explanationNote: 'Las rectas sin valor absoluto ni cuadrado no quedan acotadas como semirrecta.',
          },
          {
            text: `ℝ \\ {${b}}`,
            explanationNote: 'No existe ninguna asíntota vertical ni hueco que excluya un punto.',
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: 'Dominio y Rango de funciones de grado ≤ 1',
        formulaBreakdown: `Función analizada: ${formula}.`,
        domainExplanation: 'No hay denominadores ni raíces pares: Dom(f) = ℝ.',
        rangeExplanation: isConst ? `Siempre retorna ${b}: Ran(f) = {${b}}.` : 'Al ser m ≠ 0, Ran(f) = ℝ.',
        interceptsExplanation: `Corte Y en (0, ${b}).`,
        graphObservation: isConst ? `Recta horizontal en y = ${b}.` : 'Recta oblicua continua.',
        pedagogicalTip: '¡Cuidado clásico! Una función constante tiene Dominio ℝ pero Rango de un solo elemento {c}.',
      },
      graphConfig: {
        xMin: -5,
        xMax: 5,
        yMin: Math.min(-6, b - 4),
        yMax: Math.max(6, b + 4),
        evalFunctionCode: isConst ? `${b}` : `${m} * x + (${b})`,
        keyPoints: [{ x: 0, y: b, label: `(0, ${b})`, color: '#0D47A1', type: 'y-intercept' }],
      },
    });
  });

  return questions;
}

function buildLevel2Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Vértice y raíces enteras (15 ejercicios)
  const rootPairs: [number, number, number][] = [
    [1, 1, 3], [1, -1, 3], [1, 2, 6], [1, -2, 4], [1, 0, 4],
    [1, -4, 0], [1, -3, 5], [1, 1, 5], [-1, 0, 4], [-1, -2, 4],
    [-1, 1, 5], [2, 1, 3], [2, -2, 2], [-2, 1, 5], [1, -5, 1],
  ];

  rootPairs.forEach(([a, r1, r2], i) => {
    const b = -a * (r1 + r2);
    const c = a * r1 * r2;
    const h = (r1 + r2) / 2;
    const k = a * (h - r1) * (h - r2);
    const formula = `f(x) = ${fmtQuad(a, b, c)}`;
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    const rootsLabel = minR === maxR ? `(${minR}, 0)` : `(${minR}, 0) y (${maxR}, 0)`;

    questions.push({
      id: `lvl2_q${questions.length + 1}`,
      level: 2,
      topic: 'cortes',
      title: `Vértice y cortes de parábola (${i + 1})`,
      functionFormula: formula,
      functionType: 'Cuadrática',
      domain: 'ℝ',
      range: a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`,
      xIntercepts: minR === maxR ? [`(${minR}, 0)`] : [`(${minR}, 0)`, `(${maxR}, 0)`],
      yIntercept: `(0, ${c})`,
      vertex: `(${h}, ${k})`,
      prompt: `Calcula el vértice V(h, k) y los cortes con el eje X de la función cuadrática ${formula}.`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 45,
      options: buildRotatedOptions(
        {
          text: `Vértice: (${h}, ${k})  |  Cortes X: ${rootsLabel}`,
          explanationNote: `Correcto: h = -(${b})/(2·${a}) = ${h}, k = f(${h}) = ${k}, y f(x) = 0 en ${rootsLabel}.`,
        },
        [
          {
            text: `Vértice: (${-h}, ${k})  |  Cortes X: (${-maxR}, 0) y (${-minR}, 0)`,
            explanationNote: 'Error de signo en h = -b/(2a) o al despejar las raíces.',
          },
          {
            text: `Vértice: (${h}, ${c})  |  Cortes X: ${rootsLabel}`,
            explanationNote: 'Confundiste k = f(h) con el corte Y c = f(0).',
          },
          {
            text: `Vértice: (${h * 2}, ${-k})  |  Cortes X: (0, ${minR}) y (0, ${maxR})`,
            explanationNote: 'Olvidaste dividir para 2a y confundiste cortes X con cortes Y.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Análisis de Vértice y Raíces',
        formulaBreakdown: `Coeficientes a = ${a}, b = ${b}, c = ${c}. Concavidad: ${a > 0 ? 'hacia arriba (a > 0)' : 'hacia abajo (a < 0)'}.`,
        domainExplanation: 'Dom(f) = ℝ por ser polinomial.',
        rangeExplanation: a > 0 ? `Ran(f) = [${k}, +∞).` : `Ran(f) = (-∞, ${k}].`,
        interceptsExplanation: `h = -b/(2a) = ${h}, k = f(${h}) = ${k}. Factorizando o aplicando fórmula general se hallan las raíces ${rootsLabel}.`,
        graphObservation: `Eje de simetría x = ${h} y corte Y en (0, ${c}).`,
        pedagogicalTip: 'El vértice siempre queda exactamente en el punto medio horizontal de las dos raíces.',
      },
      graphConfig: {
        xMin: minR - 3,
        xMax: maxR + 3,
        yMin: Math.min(-4, k - 3, c - 2),
        yMax: Math.max(4, k + 3, c + 2),
        evalFunctionCode: `${a} * x * x + (${b}) * x + (${c})`,
        keyPoints: [
          { x: h, y: k, label: `V(${h}, ${k})`, color: '#D97706', type: 'vertex' },
          { x: minR, y: 0, label: `(${minR}, 0)`, color: '#059669', type: 'x-intercept' },
          ...(minR !== maxR ? [{ x: maxR, y: 0, label: `(${maxR}, 0)`, color: '#059669', type: 'x-intercept' as const }] : []),
        ],
      },
    });
  });

  // 2. Rango acotado por concavidad (12 ejercicios)
  const vertexSpecs: [number, number, number][] = [
    [1, 3, -5], [1, -2, 4], [-1, 2, 7], [-1, -3, 2],
    [2, 1, -8], [2, -2, 3], [-2, 3, 5], [-2, -1, -3],
    [3, 2, -6], [-3, 1, 9], [1, 4, 1], [-1, -4, 6],
  ];
  vertexSpecs.forEach(([a, h, k], i) => {
    const b = -2 * a * h;
    const c = a * h * h + k;
    const formula = `f(x) = ${fmtQuad(a, b, c)}`;
    const correctRange = a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`;
    const wrongRange = a > 0 ? `(-∞, ${k}]` : `[${k}, +∞)`;

    questions.push({
      id: `lvl2_q${questions.length + 1}`,
      level: 2,
      topic: 'rango',
      title: `Rango de parábola (${i + 1})`,
      functionFormula: formula,
      functionType: 'Cuadrática',
      domain: 'ℝ',
      range: correctRange,
      xIntercepts: ['Consultar discriminante'],
      yIntercept: `(0, ${c})`,
      vertex: `(${h}, ${k})`,
      prompt: `Dada la función cuadrática ${formula}, determina su Rango exacto analizando su concavidad y vértice.`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 45,
      options: buildRotatedOptions(
        {
          text: `Ran(f) = ${correctRange}`,
          explanationNote: `Correcto: V(${h}, ${k}) y como a = ${a} ${a > 0 ? '> 0 abre hacia arriba' : '< 0 abre hacia abajo'}.`,
        },
        [
          {
            text: `Ran(f) = ${wrongRange}`,
            explanationNote: 'Invertiste el sentido de la concavidad según el signo de a.',
          },
          {
            text: `Ran(f) = [${h}, +∞)`,
            explanationNote: 'El rango depende de la coordenada k del vértice, no de h.',
          },
          {
            text: 'Ran(f) = ℝ = (-∞, +∞)',
            explanationNote: 'Una parábola siempre tiene un extremo (mínimo o máximo) y no cubre todo ℝ.',
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: 'Rango mediante el vértice',
        formulaBreakdown: `a = ${a}, b = ${b}, c = ${c}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: `h = ${h}, k = f(${h}) = ${k}. Como a ${a > 0 ? '> 0 (mínimo en k)' : '< 0 (máximo en k)'}, Ran(f) = ${correctRange}.`,
        interceptsExplanation: `Corte Y en (0, ${c}).`,
        graphObservation: a > 0 ? 'Ramas hacia arriba desde y = k.' : 'Ramas hacia abajo desde y = k.',
        pedagogicalTip: 'Para el rango de una cuadrática solo necesitas el signo de "a" y el valor "k = f(h)".',
      },
      graphConfig: {
        xMin: h - 4,
        xMax: h + 4,
        yMin: a > 0 ? k - 3 : k - 7,
        yMax: a > 0 ? k + 7 : k + 3,
        evalFunctionCode: `${a} * x * x + (${b}) * x + (${c})`,
        keyPoints: [
          { x: h, y: k, label: `V(${h}, ${k})`, color: '#D97706', type: 'vertex' },
        ],
      },
    });
  });

  // 3. Discriminante Δ = b² - 4ac y número de cortes con X (12 ejercicios)
  const discSpecs: [number, number, number][] = [
    [1, 2, 5],   // Δ = -16 < 0 (0 cortes)
    [1, -4, 4],  // Δ = 0 (1 corte)
    [1, -5, 6],  // Δ = 1 > 0 (2 cortes)
    [2, 4, 5],   // Δ = -24 < 0
    [1, 6, 9],   // Δ = 0
    [2, -7, 3],  // Δ = 25 > 0
    [-1, 2, -5], // Δ = -16 < 0
    [1, -6, 9],  // Δ = 0
    [1, 3, -4],  // Δ = 25 > 0
    [3, -6, 3],  // Δ = 0
    [1, 1, 3],   // Δ = -11 < 0
    [-1, 5, -4], // Δ = 9 > 0
  ];
  discSpecs.forEach(([a, b, c], i) => {
    const delta = b * b - 4 * a * c;
    const formula = `f(x) = ${fmtQuad(a, b, c)}`;
    const countText =
      delta > 0
        ? `Δ = ${delta} > 0 ⇒ 2 cortes reales con el eje X`
        : delta === 0
        ? 'Δ = 0 ⇒ 1 único corte tangente (vértice sobre el eje X)'
        : `Δ = ${delta} < 0 ⇒ 0 cortes reales con el eje X (no cruza al eje X)`;

    questions.push({
      id: `lvl2_q${questions.length + 1}`,
      level: 2,
      topic: 'cortes',
      title: `Discriminante de parábola (${i + 1})`,
      functionFormula: formula,
      functionType: 'Cuadrática',
      domain: 'ℝ',
      range: a > 0 ? `[${simplifyFrac(4 * a * c - b * b, 4 * a)}, +∞)` : `(-∞, ${simplifyFrac(4 * a * c - b * b, 4 * a)}]`,
      xIntercepts: delta > 0 ? ['2 raíces reales'] : delta === 0 ? ['1 raíz doble'] : ['Ninguno en ℝ'],
      yIntercept: `(0, ${c})`,
      prompt: `Calcula el discriminante Δ = b² - 4ac de ${formula} e indica cuántos cortes reales tiene con el eje X.`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 40,
      options: buildRotatedOptions(
        { text: countText, explanationNote: `Correcto: Δ = (${b})² - 4(${a})(${c}) = ${delta}.` },
        [
          {
            text:
              delta > 0
                ? 'Δ = 0 ⇒ 1 único corte tangente con el eje X'
                : `Δ = ${Math.abs(delta) + 4} > 0 ⇒ 2 cortes reales con el eje X`,
            explanationNote: 'Verifica el signo de b² - 4ac.',
          },
          {
            text:
              delta < 0
                ? 'Δ = 0 ⇒ 1 único corte con el eje X'
                : `Δ = ${-Math.abs(delta) - 4} < 0 ⇒ 0 cortes reales con el eje X`,
            explanationNote: 'Recuerda que (-b)² siempre es positivo y resta 4ac.',
          },
          {
            text: `Δ = ${delta} ⇒ Siempre tiene 2 cortes con el eje Y`,
            explanationNote: 'Una función solo puede cortar al eje Y máximo una vez.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Uso del discriminante Δ = b² - 4ac',
        formulaBreakdown: `a = ${a}, b = ${b}, c = ${c} ⇒ Δ = (${b})² - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${delta}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: 'Depende de la ordenada del vértice k.',
        interceptsExplanation: countText,
        graphObservation: delta < 0 ? 'La parábola queda totalmente por encima o por debajo del eje X.' : 'La parábola toca o cruza al eje X.',
        pedagogicalTip: 'Δ > 0: 2 raíces; Δ = 0: 1 raíz tangente; Δ < 0: 0 raíces reales.',
      },
      graphConfig: {
        xMin: -5,
        xMax: 6,
        yMin: -6,
        yMax: 8,
        evalFunctionCode: `${a} * x * x + (${b}) * x + (${c})`,
        keyPoints: [{ x: 0, y: c, label: `Corte Y: (0, ${c})`, color: '#0D47A1', type: 'y-intercept' }],
      },
    });
  });

  // 4. Eje de simetría, corte Y y concavidad integrada (11 ejercicios)
  const symSpecs: [number, number, number][] = [
    [1, -6, 5], [1, 8, 12], [-1, 6, -5], [2, -8, 6], [-2, -4, 3],
    [3, -12, 7], [-3, 6, 1], [1, -10, 21], [-1, -8, -12], [2, 8, 5], [-2, 12, -10],
  ];
  symSpecs.forEach(([a, b, c], i) => {
    const h = -b / (2 * a);
    const k = a * h * h + b * h + c;
    const formula = `f(x) = ${fmtQuad(a, b, c)}`;
    questions.push({
      id: `lvl2_q${questions.length + 1}`,
      level: 2,
      topic: 'grafica',
      title: `Eje de simetría y concavidad (${i + 1})`,
      functionFormula: formula,
      functionType: 'Cuadrática',
      domain: 'ℝ',
      range: a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`,
      xIntercepts: ['Variable'],
      yIntercept: `(0, ${c})`,
      vertex: `(${h}, ${k})`,
      prompt: `Para la parábola ${formula}, ¿cuál es su eje de simetría, concavidad y punto de corte con el eje Y?`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 40,
      options: buildRotatedOptions(
        {
          text: `Eje x = ${h}  |  Abre hacia ${a > 0 ? 'arriba' : 'abajo'}  |  Corte Y: (0, ${c})`,
          explanationNote: `Correcto: x = -(${b})/(2·${a}) = ${h}, a = ${a}, y f(0) = ${c}.`,
        },
        [
          {
            text: `Eje x = ${-h}  |  Abre hacia ${a > 0 ? 'arriba' : 'abajo'}  |  Corte Y: (0, ${c})`,
            explanationNote: 'Faltó el signo menos en x = -b/(2a).',
          },
          {
            text: `Eje x = ${h}  |  Abre hacia ${a > 0 ? 'abajo' : 'arriba'}  |  Corte Y: (0, ${c})`,
            explanationNote: 'El signo de a define hacia dónde abren las ramas.',
          },
          {
            text: `Eje y = ${k}  |  Abre hacia ${a > 0 ? 'arriba' : 'abajo'}  |  Corte Y: (${c}, 0)`,
            explanationNote: 'El eje de simetría es una recta vertical x = h, y el corte Y es (0, c).',
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: 'Eje de simetría y corte Y',
        formulaBreakdown: `a = ${a}, b = ${b}, c = ${c}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: a > 0 ? `Ran(f) = [${k}, +∞).` : `Ran(f) = (-∞, ${k}].`,
        interceptsExplanation: `Eje de simetría: x = -b/(2a) = ${h}. Corte Y: f(0) = ${c} ⇒ (0, ${c}).`,
        graphObservation: `Parábola simétrica respecto a la recta x = ${h}.`,
        pedagogicalTip: 'El término independiente "c" siempre da directamente el corte con el eje Y: (0, c).',
      },
      graphConfig: {
        xMin: h - 5,
        xMax: h + 5,
        yMin: Math.min(k - 4, c - 4),
        yMax: Math.max(k + 4, c + 4),
        evalFunctionCode: `${a} * x * x + (${b}) * x + (${c})`,
        keyPoints: [
          { x: h, y: k, label: `V(${h}, ${k})`, color: '#D97706', type: 'vertex' },
          { x: 0, y: c, label: `(0, ${c})`, color: '#0D47A1', type: 'y-intercept' },
        ],
      },
    });
  });

  return questions;
}

function buildLevel3Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Racionales: Dominio y Asíntota Vertical (14 ejercicios)
  const ratDomSpecs: [number, number, number, number][] = [
    [2, 4, 1, -3], [3, -6, 1, 2], [1, 5, 1, -4], [4, 2, 1, 5],
    [-2, 6, 1, -1], [5, -10, 1, 4], [3, 1, 2, -6], [2, -5, 2, 4],
    [1, -7, 3, -9], [4, 8, 2, -10], [-3, 9, 1, 6], [6, -3, 3, 6],
    [2, 7, 1, -7], [5, 15, 1, 8],
  ];

  ratDomSpecs.forEach(([a, b, c, d], i) => {
    const av = -d / c;
    const ah = a / c;
    const numStr = fmtLinear(a, b);
    const denStr = fmtLinear(c, d);
    const formula = `f(x) = \\frac{${numStr}}{${denStr}}`;
    questions.push({
      id: `lvl3_q${questions.length + 1}`,
      level: 3,
      topic: 'dominio',
      title: `Dominio racional y asíntota vertical (${i + 1})`,
      functionFormula: formula,
      functionType: 'Racional',
      domain: `ℝ \\ {${av}}`,
      range: `ℝ \\ {${simplifyFrac(a, c)}}`,
      xIntercepts: [`(${simplifyFrac(-b, a)}, 0)`],
      yIntercept: `(0, ${simplifyFrac(b, d)})`,
      prompt: `Para la función racional ${formula}, identifica su Dominio y la ecuación de su Asíntota Vertical (A.V.).`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 50,
      options: buildRotatedOptions(
        {
          text: `Dom(f) = ℝ \\ {${av}}  |  A.V.: x = ${av}`,
          explanationNote: `Correcto: igualando el denominador ${denStr} = 0 obtenemos x = ${av}.`,
        },
        [
          {
            text: `Dom(f) = ℝ \\ {${-av}}  |  A.V.: x = ${-av}`,
            explanationNote: 'Error de signo al despejar el denominador = 0.',
          },
          {
            text: `Dom(f) = ℝ \\ {${simplifyFrac(a, c)}}  |  A.V.: x = ${simplifyFrac(a, c)}`,
            explanationNote: `${simplifyFrac(a, c)} corresponde a la Asíntota Horizontal (Rango), no a la vertical.`,
          },
          {
            text: 'Dom(f) = ℝ  |  No tiene asíntota vertical',
            explanationNote: 'Nunca se puede dividir para cero.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Restricción del Denominador',
        formulaBreakdown: `En ${formula}, el denominador ${denStr} debe ser distinto de 0.`,
        domainExplanation: `${denStr} ≠ 0 ⇒ x ≠ ${av}. Por tanto Dom(f) = ℝ \\ {${av}}.`,
        rangeExplanation: `A.H. y = ${simplifyFrac(a, c)}, Ran(f) = ℝ \\ {${simplifyFrac(a, c)}}.`,
        interceptsExplanation: `Corte X cuando ${numStr} = 0. Corte Y en f(0) = ${simplifyFrac(b, d)}.`,
        graphObservation: `Hipérbola con asíntota vertical en x = ${av} y horizontal en y = ${simplifyFrac(a, c)}.`,
        pedagogicalTip: 'La Asíntota Vertical nace exclusivamente de igualar el denominador a cero (si no se simplifica con el numerador).',
      },
      graphConfig: {
        xMin: av - 6,
        xMax: av + 6,
        yMin: ah - 6,
        yMax: ah + 6,
        asymptotes: { vertical: [av], horizontal: [ah] },
        evalFunctionCode: `(${a} * x + (${b})) / (${c} * x + (${d}))`,
        keyPoints: [],
      },
    });
  });

  // 2. Racionales: Asíntota Horizontal y Rango (12 ejercicios)
  const ratRanSpecs: [number, number, number, number][] = [
    [4, 2, 1, -2], [-3, 5, 1, 3], [6, -1, 2, 4], [-8, 3, 2, -6],
    [5, -7, 1, 1], [-4, 1, 1, -5], [9, 2, 3, 6], [10, -4, 2, 8],
    [-6, 7, 3, -3], [7, 3, 1, -4], [-5, -2, 1, 2], [8, 1, 4, -8],
  ];
  ratRanSpecs.forEach(([a, b, c, d], i) => {
    const av = -d / c;
    const ah = a / c;
    const formula = `f(x) = \\frac{${fmtLinear(a, b)}}{${fmtLinear(c, d)}}`;
    questions.push({
      id: `lvl3_q${questions.length + 1}`,
      level: 3,
      topic: 'rango',
      title: `Asíntota horizontal y rango (${i + 1})`,
      functionFormula: formula,
      functionType: 'Racional',
      domain: `ℝ \\ {${av}}`,
      range: `ℝ \\ {${ah}}`,
      xIntercepts: [`(${simplifyFrac(-b, a)}, 0)`],
      yIntercept: `(0, ${simplifyFrac(b, d)})`,
      prompt: `Dada ${formula}, ¿cuál es su Asíntota Horizontal (A.H.) y por consiguiente su Rango?`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 55,
      options: buildRotatedOptions(
        {
          text: `A.H.: y = ${ah}  |  Ran(f) = ℝ \\ {${ah}}`,
          explanationNote: `Correcto: como numerador y denominador son de grado 1, A.H. = ${a}/${c} = ${ah}.`,
        },
        [
          {
            text: `A.H.: y = ${av}  |  Ran(f) = ℝ \\ {${av}}`,
            explanationNote: `${av} es la asíntota vertical, no la horizontal.`,
          },
          {
            text: `A.H.: y = ${-ah}  |  Ran(f) = ℝ \\ {${-ah}}`,
            explanationNote: 'Revisa los signos de los coeficientes principales.',
          },
          {
            text: 'A.H.: y = 0  |  Ran(f) = ℝ \\ {0}',
            explanationNote: 'y = 0 solo ocurre cuando el grado del numerador es menor que el del denominador.',
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: 'Asíntota Horizontal de una función homográfica',
        formulaBreakdown: `En f(x) = (ax + b)/(cx + d), la asíntota horizontal es y = a/c = ${a}/${c} = ${ah}.`,
        domainExplanation: `Dom(f) = ℝ \\ {${av}}.`,
        rangeExplanation: `La función nunca alcanza el valor de la A.H.: Ran(f) = ℝ \\ {${ah}}.`,
        interceptsExplanation: `Corte X: (${simplifyFrac(-b, a)}, 0). Corte Y: (0, ${simplifyFrac(b, d)}).`,
        graphObservation: `La curva se acerca indefinidamente a y = ${ah} en los extremos.`,
        pedagogicalTip: 'Para fracciones lineales (ax+b)/(cx+d), divide los coeficientes que acompañan a "x": y = a/c.',
      },
      graphConfig: {
        xMin: av - 6,
        xMax: av + 6,
        yMin: ah - 6,
        yMax: ah + 6,
        asymptotes: { vertical: [av], horizontal: [ah] },
        evalFunctionCode: `(${a} * x + (${b})) / (${c} * x + (${d}))`,
        keyPoints: [],
      },
    });
  });

  // 3. Radicales pares: Dominio y Rango (12 ejercicios)
  const radSpecs: [number, number, number][] = [
    [1, -4, 0], [1, 5, 2], [2, -6, 1], [1, -3, -2],
    [-1, 6, 1], [-1, 4, 3], [3, -9, 2], [2, 8, -3],
    [1, 7, 4], [-2, 10, 0], [4, -8, 5], [-1, 9, -2],
  ];
  radSpecs.forEach(([a, b, k], i) => {
    const boundary = -b / a;
    const isRight = a > 0;
    const domStr = isRight ? `[${boundary}, +∞)` : `(-∞, ${boundary}]`;
    const ranStr = `[${k}, +∞)`;
    const innerStr = fmtLinear(a, b);
    const kPart = k === 0 ? '' : ` ${fmtSigned(k)}`;
    const formula = `f(x) = \\sqrt{${innerStr}}${kPart}`;

    questions.push({
      id: `lvl3_q${questions.length + 1}`,
      level: 3,
      topic: 'dominio',
      title: `Dominio y rango de raíz par (${i + 1})`,
      functionFormula: formula,
      functionType: 'Radical',
      domain: domStr,
      range: ranStr,
      xIntercepts: k <= 0 ? [`(${simplifyFrac(k * k - b, a)}, 0)`] : ['No corta al eje X'],
      yIntercept: a * 0 + b >= 0 ? `(0, √${b}${kPart})` : 'No corta al eje Y',
      prompt: `Calcula el Dominio y el Rango de la función radical ${formula}.`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 50,
      options: buildRotatedOptions(
        {
          text: `Dom(f) = ${domStr}  |  Ran(f) = ${ranStr}`,
          explanationNote: `Correcto: exigiendo ${innerStr} ≥ 0 resulta ${domStr}, y la raíz es ≥ 0 por lo que y ≥ ${k}.`,
        },
        [
          {
            text: `Dom(f) = ${isRight ? `(-∞, ${boundary}]` : `[${boundary}, +∞)`}  |  Ran(f) = ${ranStr}`,
            explanationNote: isRight ? 'El sentido de la desigualdad está invertido.' : 'Al dividir/multiplicar por negativo cambia el sentido de ≥ a ≤.',
          },
          {
            text: `Dom(f) = (${boundary}, +∞)  |  Ran(f) = (${k}, +∞)`,
            explanationNote: 'La raíz cuadrada de 0 sí existe (√0 = 0), por lo que los extremos deben ir con corchete cerrado [ ].',
          },
          {
            text: `Dom(f) = ℝ  |  Ran(f) = ${ranStr}`,
            explanationNote: 'En ℝ no existen raíces cuadradas de números negativos.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Restricción de Radicando Par',
        formulaBreakdown: `Planteamos la inecuación ${innerStr} ≥ 0.`,
        domainExplanation: `${isRight ? `${a}x ≥ ${-b} ⇒ x ≥ ${boundary}` : `${a}x ≥ ${-b} ⇒ x ≤ ${boundary}`}. Dom(f) = ${domStr}.`,
        rangeExplanation: `Como √(${innerStr}) ≥ 0, al sumar ${k} obtenemos Ran(f) = ${ranStr}.`,
        interceptsExplanation: `Inicia en el punto frontera (${boundary}, ${k}).`,
        graphObservation: `Semiparábola que parte en (${boundary}, ${k}) hacia la ${isRight ? 'derecha' : 'izquierda'}.`,
        pedagogicalTip: 'Cuando el coeficiente de x es negativo dentro de la raíz, al despejar se invierte el signo de la desigualdad.',
      },
      graphConfig: {
        xMin: boundary - 5,
        xMax: boundary + 6,
        yMin: k - 3,
        yMax: k + 7,
        evalFunctionCode: `(${a} * x + (${b})) >= 0 ? Math.sqrt(${a} * x + (${b})) + (${k}) : null`,
        keyPoints: [{ x: boundary, y: k, label: `Inicio (${boundary}, ${k})`, color: '#D97706', type: 'vertex' }],
      },
    });
  });

  // 4. Composición básica de funciones (f ∘ g)(x) (12 ejercicios)
  const compSpecs: { m1: number; b1: number; m2: number; b2: number; reverse?: boolean }[] = [
    { m1: 2, b1: 3, m2: 1, b2: -4 },
    { m1: 3, b1: -1, m2: 2, b2: 5 },
    { m1: -2, b1: 6, m2: 3, b2: 1 },
    { m1: 4, b1: -5, m2: 1, b2: 2 },
    { m1: 1, b1: 7, m2: -3, b2: 2 },
    { m1: 5, b1: -2, m2: 2, b2: -3 },
    { m1: 2, b1: -1, m2: 4, b2: 3, reverse: true },
    { m1: 3, b1: 2, m2: -2, b2: 5, reverse: true },
    { m1: -1, b1: 8, m2: 3, b2: -2, reverse: true },
    { m1: 4, b1: 1, m2: 2, b2: -6, reverse: true },
    { m1: -3, b1: 4, m2: 2, b2: 1 },
    { m1: 6, b1: -3, m2: 1, b2: 4 },
  ];

  compSpecs.forEach(({ m1, b1, m2, b2, reverse }, i) => {
    const fStr = `f(x) = ${fmtLinear(m1, b1)}`;
    const gStr = `g(x) = ${fmtLinear(m2, b2)}`;
    // If !reverse: (f o g)(x) = f(g(x)) = m1*(m2*x + b2) + b1 = (m1*m2)x + (m1*b2 + b1)
    // If reverse: (g o f)(x) = g(f(x)) = m2*(m1*x + b1) + b2 = (m1*m2)x + (m2*b1 + b2)
    const resM = m1 * m2;
    const resB = reverse ? m2 * b1 + b2 : m1 * b2 + b1;
    const wrongB = reverse ? m1 * b2 + b1 : m2 * b1 + b2;
    const opLabel = reverse ? '(g ∘ f)(x)' : '(f ∘ g)(x)';
    const resFormula = `${opLabel} = ${fmtLinear(resM, resB)}`;

    questions.push({
      id: `lvl3_q${questions.length + 1}`,
      level: 3,
      topic: 'composicion',
      title: `Composición ${opLabel} (${i + 1})`,
      functionFormula: fStr,
      secondaryFormula: gStr,
      functionType: 'Compuesta',
      domain: 'ℝ',
      range: 'ℝ',
      xIntercepts: [`(${simplifyFrac(-resB, resM)}, 0)`],
      yIntercept: `(0, ${resB})`,
      prompt: `Dadas ${fStr} y ${gStr}, calcula la expresión simplificada de ${opLabel}.`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 55,
      options: buildRotatedOptions(
        {
          text: resFormula,
          explanationNote: `Correcto: sustituyendo ${reverse ? 'f(x) en g' : 'g(x) en f'} resulta ${resFormula}.`,
        },
        [
          {
            text: `${opLabel} = ${fmtLinear(resM, wrongB)}`,
            explanationNote: 'Calculaste el orden inverso de la composición.',
          },
          {
            text: `${opLabel} = ${fmtLinear(m1 + m2, b1 + b2)}`,
            explanationNote: 'Sumaste las funciones (f + g)(x) en lugar de componerlas.',
          },
          {
            text: `${opLabel} = ${fmtLinear(resM, b1 + b2)}`,
            explanationNote: 'Faltó aplicar el factor multiplicativo al término independiente interior.',
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: `Composición de Funciones ${opLabel}`,
        formulaBreakdown: reverse
          ? `(g ∘ f)(x) = g(f(x)) = ${m2}(${fmtLinear(m1, b1)}) ${fmtSigned(b2)} = ${fmtLinear(resM, resB)}.`
          : `(f ∘ g)(x) = f(g(x)) = ${m1}(${fmtLinear(m2, b2)}) ${fmtSigned(b1)} = ${fmtLinear(resM, resB)}.`,
        domainExplanation: 'Ambas son polinomiales, por lo que Dom = ℝ.',
        rangeExplanation: 'Ran = ℝ.',
        interceptsExplanation: `Corte Y en (0, ${resB}).`,
        graphObservation: 'En azul se muestra f(x) y en rojo discontinuo g(x).',
        pedagogicalTip: 'La composición NO es conmutativa: por lo general (f ∘ g)(x) ≠ (g ∘ f)(x).',
      },
      graphConfig: {
        xMin: -5,
        xMax: 5,
        yMin: -8,
        yMax: 8,
        evalFunctionCode: `${m1} * x + (${b1})`,
        secondaryEvalCode: `${m2} * x + (${b2})`,
        secondaryLabel: 'g(x)',
        keyPoints: [],
      },
    });
  });

  return questions;
}

function buildLevel4Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Exponenciales: Asíntota horizontal y Rango (14 ejercicios)
  const expRanSpecs: [number, number, number][] = [
    [2, 1, -3], [3, -2, 4], [5, 1, -1], [6, 2, -4], [4, -1, 2],
    [2, 3, 5], [3, 1, -6], [7, -2, 1], [2, -4, -5], [5, -3, 3],
    [4, 2, -7], [6, -1, 6], [3, 4, -2], [2, 0, -8],
  ];
  expRanSpecs.forEach(([base, h, k], i) => {
    const hPart = h === 0 ? 'x' : h > 0 ? `x - ${h}` : `x + ${Math.abs(h)}`;
    const formula = `f(x) = ${base}^{${hPart}} ${fmtSigned(k)}`;
    questions.push({
      id: `lvl4_q${questions.length + 1}`,
      level: 4,
      topic: 'rango',
      title: `Exponencial: asíntota y rango (${i + 1})`,
      functionFormula: formula,
      functionType: 'Exponencial',
      domain: 'ℝ',
      range: `(${k}, +∞)`,
      xIntercepts: k < 0 ? [`(${h} + log_${base}(${-k}), 0)`] : ['No corta al eje X'],
      yIntercept: `(0, ${Math.pow(base, -h) + k})`,
      prompt: `Para la función exponencial ${formula}, ¿cuál es su Asíntota Horizontal (A.H.) y su Rango exacto?`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 60,
      options: buildRotatedOptions(
        {
          text: `A.H.: y = ${k}  |  Ran(f) = (${k}, +∞)`,
          explanationNote: `Correcto: como ${base}^{...} > 0 siempre, entonces f(x) > ${k}.`,
        },
        [
          {
            text: `A.H.: y = ${k}  |  Ran(f) = [${k}, +∞)`,
            explanationNote: 'Una exponencial nunca toca su asíntota horizontal, debe llevar paréntesis abierto ( ).',
          },
          {
            text: `A.H.: x = ${h}  |  Ran(f) = (${h}, +∞)`,
            explanationNote: 'Las exponenciales tienen asíntota horizontal en y = k, no vertical.',
          },
          {
            text: `A.H.: y = ${-k}  |  Ran(f) = ℝ`,
            explanationNote: 'El signo del desplazamiento vertical k no cambia ni cubre negativos menores que k.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Asíntota Horizontal y Rango Exponencial',
        formulaBreakdown: `Toda potencia de base positiva ${base}^u > 0 para cualquier u ∈ ℝ.`,
        domainExplanation: 'Dom(f) = ℝ sin restricciones.',
        rangeExplanation: `Sumando ${k}: ${base}^u ${fmtSigned(k)} > ${k}, por lo que Ran(f) = (${k}, +∞) con A.H. en y = ${k}.`,
        interceptsExplanation: k < 0 ? 'Como k < 0, sí cruza al eje X.' : 'Como k ≥ 0, no cruza al eje X.',
        graphObservation: `Curva creciente con asíntota horizontal punteada en y = ${k}.`,
        pedagogicalTip: 'En f(x) = a·b^(x-h) + k (con a > 0), la asíntota horizontal siempre es y = k y el rango (k, +∞).',
      },
      graphConfig: {
        xMin: h - 4,
        xMax: h + 5,
        yMin: k - 3,
        yMax: k + 9,
        asymptotes: { horizontal: [k] },
        evalFunctionCode: `Math.pow(${base}, x - (${h})) + (${k})`,
        keyPoints: [],
      },
    });
  });

  // 2. Logarítmicas: Dominio y Asíntota Vertical (12 ejercicios)
  const logSpecs: [number, number, number, number][] = [
    [6, 5, -3, 0], [2, 1, -4, 1], [3, 2, -6, 0], [5, 1, 3, -2],
    [4, 3, -9, 1], [2, 4, -8, 0], [6, 1, -5, 2], [3, 5, -10, -1],
    [10, 2, 4, 0], [5, 3, -6, 2], [2, 1, 7, 1], [4, 2, -5, 0],
  ];
  logSpecs.forEach(([base, a, b, k], i) => {
    const avVal = -b / a;
    const avLabel = simplifyFrac(-b, a);
    const argStr = fmtLinear(a, b);
    const kPart = k === 0 ? '' : ` ${fmtSigned(k)}`;
    const formula = `f(x) = \\log_${base}(${argStr})${kPart}`;

    questions.push({
      id: `lvl4_q${questions.length + 1}`,
      level: 4,
      topic: 'dominio',
      title: `Dominio y asíntota logarítmica (${i + 1})`,
      functionFormula: formula,
      functionType: 'Logarítmica',
      domain: `(${avLabel}, +∞)`,
      range: 'ℝ',
      xIntercepts: [`(${simplifyFrac(Math.pow(base, -k) - b, a)}, 0)`],
      yIntercept: b > 0 ? `(0, log_${base}(${b})${kPart})` : 'No corta al eje Y',
      prompt: `Analiza la función logarítmica ${formula} y determina su Dominio y Asíntota Vertical.`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 65,
      options: buildRotatedOptions(
        {
          text: `Dom(f) = (${avLabel}, +∞)  |  A.V.: x = ${avLabel}`,
          explanationNote: `Correcto: el argumento debe ser estrictamente positivo (${argStr} > 0), es decir x > ${avLabel}.`,
        },
        [
          {
            text: `Dom(f) = [${avLabel}, +∞)  |  A.V.: x = ${avLabel}`,
            explanationNote: 'El logaritmo de cero no existe en ℝ, el intervalo debe ser abierto.',
          },
          {
            text: `Dom(f) = (${simplifyFrac(b, a)}, +∞)  |  A.V.: x = ${simplifyFrac(b, a)}`,
            explanationNote: 'Error de signo al resolver la inecuación del argumento.',
          },
          {
            text: `Dom(f) = ℝ  |  Ran(f) = (${avLabel}, +∞)`,
            explanationNote: 'En logaritmos el Rango es ℝ y el Dominio está restringido.',
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: 'Dominio del Logaritmo',
        formulaBreakdown: `El argumento del logaritmo debe ser > 0: ${argStr} > 0.`,
        domainExplanation: `${a}x > ${-b} ⇒ x > ${avLabel}. Dom(f) = (${avLabel}, +∞) y A.V. x = ${avLabel}.`,
        rangeExplanation: 'Toda función logarítmica cubre todo el eje vertical: Ran(f) = ℝ.',
        interceptsExplanation: `Raíz cuando ${argStr} = ${base}^(${-k}).`,
        graphObservation: `Curva creciente que tiende a -∞ al acercarse a x = ${avLabel}.`,
        pedagogicalTip: 'Para el dominio de log_b(u), siempre exige u > 0 estricto (nunca ≥ 0).',
      },
      graphConfig: {
        xMin: avVal - 2,
        xMax: avVal + 7,
        yMin: -4,
        yMax: 5,
        asymptotes: { vertical: [avVal] },
        evalFunctionCode: `(${a} * x + (${b})) > 0 ? Math.log(${a} * x + (${b})) / Math.log(${base}) + (${k}) : null`,
        keyPoints: [],
      },
    });
  });

  // 3. Cortes exactos en exponenciales y logaritmos (12 ejercicios)
  const exactRoots: { formula: string; evalCode: string; rootX: number; isLog: boolean; base: number; shift: number }[] = [
    { formula: 'f(x) = 2^{x - 3} - 4', evalCode: 'Math.pow(2, x - 3) - 4', rootX: 5, isLog: false, base: 2, shift: -4 },
    { formula: 'f(x) = 3^{x - 1} - 9', evalCode: 'Math.pow(3, x - 1) - 9', rootX: 3, isLog: false, base: 3, shift: -9 },
    { formula: 'f(x) = 5^{x - 2} - 25', evalCode: 'Math.pow(5, x - 2) - 25', rootX: 4, isLog: false, base: 5, shift: -25 },
    { formula: 'f(x) = 2^{x + 1} - 8', evalCode: 'Math.pow(2, x + 1) - 8', rootX: 2, isLog: false, base: 2, shift: -8 },
    { formula: 'f(x) = 4^{x - 1} - 16', evalCode: 'Math.pow(4, x - 1) - 16', rootX: 3, isLog: false, base: 4, shift: -16 },
    { formula: 'f(x) = 6^{x - 3} - 6', evalCode: 'Math.pow(6, x - 3) - 6', rootX: 4, isLog: false, base: 6, shift: -6 },
    { formula: 'f(x) = \\log_2(x - 3)', evalCode: '(x - 3) > 0 ? Math.log(x - 3)/Math.log(2) : null', rootX: 4, isLog: true, base: 2, shift: 3 },
    { formula: 'f(x) = \\log_3(x - 5)', evalCode: '(x - 5) > 0 ? Math.log(x - 5)/Math.log(3) : null', rootX: 6, isLog: true, base: 3, shift: 5 },
    { formula: 'f(x) = \\log_6(2x - 5)', evalCode: '(2*x - 5) > 0 ? Math.log(2*x - 5)/Math.log(6) : null', rootX: 3, isLog: true, base: 6, shift: 2.5 },
    { formula: 'f(x) = \\log_5(3x - 8)', evalCode: '(3*x - 8) > 0 ? Math.log(3*x - 8)/Math.log(5) : null', rootX: 3, isLog: true, base: 5, shift: 8 / 3 },
    { formula: 'f(x) = \\log_2(x + 2) - 2', evalCode: '(x + 2) > 0 ? Math.log(x + 2)/Math.log(2) - 2 : null', rootX: 2, isLog: true, base: 2, shift: -2 },
    { formula: 'f(x) = \\log_3(x - 1) - 1', evalCode: '(x - 1) > 0 ? Math.log(x - 1)/Math.log(3) - 1 : null', rootX: 4, isLog: true, base: 3, shift: 1 },
  ];

  exactRoots.forEach((item, i) => {
    questions.push({
      id: `lvl4_q${questions.length + 1}`,
      level: 4,
      topic: 'cortes',
      title: `Cero o raíz exacta (${i + 1})`,
      functionFormula: item.formula,
      functionType: item.isLog ? 'Logarítmica' : 'Exponencial',
      domain: item.isLog ? `(${item.shift.toFixed(1).replace('.0', '')}, +∞)` : 'ℝ',
      range: item.isLog ? 'ℝ' : `(${item.shift}, +∞)`,
      xIntercepts: [`(${item.rootX}, 0)`],
      yIntercept: 'Evaluar f(0)',
      prompt: `Halla el cero o raíz exacta (corte con el eje X) de la función ${item.formula}.`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 65,
      options: buildRotatedOptions(
        {
          text: `Corte con el eje X en (${item.rootX}, 0)`,
          explanationNote: `Correcto: al igualar a cero y resolver la ecuación se obtiene x = ${item.rootX}.`,
        },
        [
          {
            text: `Corte con el eje X en (${item.rootX - 2}, 0)`,
            explanationNote: 'Verifica el exponente o propiedad b⁰ = 1 al despejar.',
          },
          {
            text: `Corte con el eje X en (${item.rootX + 3}, 0)`,
            explanationNote: 'Revisa los pasos del despeje algebraico.',
          },
          {
            text: `Corte con el eje X en (0, ${item.rootX})`,
            explanationNote: 'Un corte con el eje X siempre tiene ordenada y = 0.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Resolución de Cero / Raíz',
        formulaBreakdown: `Igualamos f(x) = 0 para hallar el corte con el eje X.`,
        domainExplanation: item.isLog ? 'Restricción: argumento > 0.' : 'Dom(f) = ℝ.',
        rangeExplanation: item.isLog ? 'Ran(f) = ℝ.' : `Ran(f) = (${item.shift}, +∞).`,
        interceptsExplanation: `Resolviendo f(x) = 0 obtenemos exactamente x = ${item.rootX}, es decir (${item.rootX}, 0).`,
        graphObservation: `La curva cruza el eje horizontal en (${item.rootX}, 0).`,
        pedagogicalTip: item.isLog ? 'Recuerda que log_b(u) = 0 ⇔ u = b⁰ = 1.' : 'Iguala bases en la ecuación exponencial: b^A = b^B ⇔ A = B.',
      },
      graphConfig: {
        xMin: item.rootX - 4,
        xMax: item.rootX + 4,
        yMin: -5,
        yMax: 6,
        asymptotes: item.isLog ? { vertical: [item.shift] } : { horizontal: [item.shift] },
        evalFunctionCode: item.evalCode,
        keyPoints: [{ x: item.rootX, y: 0, label: `Raíz (${item.rootX}, 0)`, color: '#059669', type: 'x-intercept' }],
      },
    });
  });

  // 4. Función inversa básica f⁻¹(x) (12 ejercicios)
  const invLineSpecs: [number, number][] = [
    [2, -6], [3, 9], [4, -8], [5, 10], [-2, 6], [-3, 12],
    [2, 4], [3, -15], [4, 12], [-4, 8], [5, -20], [6, -12],
  ];
  invLineSpecs.forEach(([m, b], i) => {
    const formula = `f(x) = ${fmtLinear(m, b)}`;
    const bSign = -b >= 0 ? `+ ${-b}` : `- ${Math.abs(b)}`;
    const invDisplay = m < 0 ? `f^{-1}(x) = \\frac{${-b} - x}{${Math.abs(m)}}` : `f^{-1}(x) = \\frac{x ${bSign}}{${m}}`;
    const wrongSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

    questions.push({
      id: `lvl4_q${questions.length + 1}`,
      level: 4,
      topic: 'inversa',
      title: `Función inversa f⁻¹(x) (${i + 1})`,
      functionFormula: formula,
      secondaryFormula: invDisplay,
      functionType: 'Inversa',
      domain: 'ℝ',
      range: 'ℝ',
      xIntercepts: [`(${-b / m}, 0)`],
      yIntercept: `(0, ${b})`,
      prompt: `Dada la función biyectiva ${formula}, determina su función inversa f⁻¹(x).`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 60,
      options: buildRotatedOptions(
        {
          text: m < 0 ? `f⁻¹(x) = (${-b} - x)/${Math.abs(m)}` : `f⁻¹(x) = (x ${bSign})/${m}`,
          explanationNote: `Correcto: intercambiando x e y en y = ${fmtLinear(m, b)} y despejando y.`,
        },
        [
          {
            text: `f⁻¹(x) = (x ${wrongSign})/${m}`,
            explanationNote: 'No cambiaste el signo al pasar el término independiente al otro lado.',
          },
          {
            text: `f⁻¹(x) = ${m}x ${bSign}`,
            explanationNote: `Olvidaste dividir entre ${m} al despejar.`,
          },
          {
            text: `f⁻¹(x) = 1 / (${fmtLinear(m, b)})`,
            explanationNote: 'Confundiste función inversa f⁻¹(x) con recíproco multiplicativo 1/f(x).',
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: 'Cálculo analítico de f⁻¹(x)',
        formulaBreakdown: `1) y = ${fmtLinear(m, b)}. 2) Intercambiamos: x = ${fmtLinear(m, b, 'y')}. 3) Despejamos y.`,
        domainExplanation: 'Dom(f) = Ran(f⁻¹) = ℝ.',
        rangeExplanation: 'Ran(f) = Dom(f⁻¹) = ℝ.',
        interceptsExplanation: `Si f pasa por (0, ${b}), entonces f⁻¹ pasa por (${b}, 0).`,
        graphObservation: 'Gráfica reflejada respecto a la diagonal espejo y = x.',
        pedagogicalTip: 'Para hallar f⁻¹: escribe y, intercambia x por y, despeja la nueva y.',
      },
      graphConfig: {
        xMin: -6,
        xMax: 6,
        yMin: -6,
        yMax: 6,
        showDiagonalSymmetry: true,
        evalFunctionCode: `${m} * x + (${b})`,
        secondaryEvalCode: `(x - (${b})) / (${m})`,
        secondaryLabel: 'f⁻¹(x)',
        keyPoints: [],
      },
    });
  });

  return questions;
}

function buildLevel5Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Valor Absoluto: Vértice, Rango y Cortes (15 ejercicios)
  const absSpecs: [number, number, number][] = [
    [1, 6, 5], [1, -4, 3], [1, 2, -4], [1, -3, -5], [2, 1, -6],
    [-1, 3, 4], [-1, -2, 5], [1, 5, -2], [-2, 4, 8], [1, -6, 0],
    [3, 2, -3], [-1, 1, -3], [2, -5, 4], [-3, 2, 6], [1, 4, -7],
  ];
  absSpecs.forEach(([a, h, k], i) => {
    const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`;
    const inner = h === 0 ? 'x' : h > 0 ? `x - ${h}` : `x + ${Math.abs(h)}`;
    const kPart = k === 0 ? '' : ` ${fmtSigned(k)}`;
    const formula = `f(x) = ${aStr}|${inner}|${kPart}`;
    const ranStr = a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`;
    const hasRoots = a * k <= 0;
    const delta = hasRoots ? Math.abs(k / a) : 0;
    const rootsLabel =
      !hasRoots
        ? 'No corta al eje X'
        : delta === 0
        ? `(${h}, 0)`
        : `(${h - delta}, 0) y (${h + delta}, 0)`;

    questions.push({
      id: `lvl5_q${questions.length + 1}`,
      level: 5,
      topic: i % 2 === 0 ? 'rango' : 'cortes',
      title: `Valor Absoluto (${i + 1})`,
      functionFormula: formula,
      functionType: 'Valor Absoluto',
      domain: 'ℝ',
      range: ranStr,
      xIntercepts: hasRoots ? (delta === 0 ? [`(${h}, 0)`] : [`(${h - delta}, 0)`, `(${h + delta}, 0)`]) : ['Ninguno'],
      yIntercept: `(0, ${a * Math.abs(-h) + k})`,
      vertex: `(${h}, ${k})`,
      prompt: `Analiza la función valor absoluto ${formula}. ¿Cuál es su vértice V(h, k), su Rango y sus cortes con el eje X?`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 55,
      options: buildRotatedOptions(
        {
          text: `V(${h}, ${k})  |  Ran: ${ranStr}  |  Cortes X: ${rootsLabel}`,
          explanationNote: `Correcto: el interior se anula en x = ${h}, dando y = ${k}, y ${a > 0 ? 'abre hacia arriba' : 'abre hacia abajo'}.`,
        },
        [
          {
            text: `V(${-h}, ${k})  |  Ran: ${ranStr}  |  Cortes X: ${rootsLabel}`,
            explanationNote: 'El vértice en x ocurre donde el interior del valor absoluto es 0.',
          },
          {
            text: `V(${h}, ${k})  |  Ran: ${a > 0 ? `(-∞, ${k}]` : `[${k}, +∞)`}  |  Cortes X: ${rootsLabel}`,
            explanationNote: 'Invertiste el sentido del rango respecto al signo de a.',
          },
          {
            text: `V(${h}, ${k})  |  Ran: ℝ  |  Cortes X: (${h}, 0)`,
            explanationNote: 'El valor absoluto siempre está acotado por un mínimo o máximo.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Análisis de Valor Absoluto',
        formulaBreakdown: `Forma canónica f(x) = a|x - h| + k con a = ${a}, h = ${h}, k = ${k}.`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: `Como |${inner}| ≥ 0, se obtiene Ran(f) = ${ranStr}.`,
        interceptsExplanation: `Cortes X: ${rootsLabel}. Corte Y: f(0) = ${a * Math.abs(-h) + k}.`,
        graphObservation: `Gráfica en forma de V con vértice en (${h}, ${k}).`,
        pedagogicalTip: 'Si f(x) = |x - h| + k con k > 0, la V está arriba del eje X y nunca tiene raíces reales.',
      },
      graphConfig: {
        xMin: h - 6,
        xMax: h + 6,
        yMin: a > 0 ? Math.min(-2, k - 2) : k - 7,
        yMax: a > 0 ? k + 7 : Math.max(2, k + 2),
        evalFunctionCode: `${a} * Math.abs(x - (${h})) + (${k})`,
        keyPoints: [{ x: h, y: k, label: `V(${h}, ${k})`, color: '#D97706', type: 'vertex' }],
      },
    });
  });

  // 2. Funciones a Trozos (12 ejercicios)
  const pieceSpecs: { c: number; xEval: number; m1: number; b1: number; m2: number; b2: number }[] = [
    { c: 2, xEval: 2, m1: 1, b1: 3, m2: 2, b2: -1 },
    { c: 0, xEval: -2, m1: 3, b1: 1, m2: -1, b2: 4 },
    { c: 1, xEval: 3, m1: 2, b1: 0, m2: -2, b2: 7 },
    { c: -1, xEval: -1, m1: 4, b1: 5, m2: 1, b2: 2 },
    { c: 3, xEval: 5, m1: -1, b1: 6, m2: 2, b2: -4 },
    { c: 0, xEval: 0, m1: 2, b1: 5, m2: 3, b2: -2 },
    { c: 2, xEval: -1, m1: -2, b1: 3, m2: 4, b2: 1 },
    { c: 4, xEval: 4, m1: 1, b1: -2, m2: 3, b2: -6 },
    { c: -2, xEval: -4, m1: 3, b1: 7, m2: -1, b2: 1 },
    { c: 1, xEval: 0, m1: 5, b1: -3, m2: 2, b2: 4 },
    { c: 3, xEval: 1, m1: -3, b1: 8, m2: 1, b2: 5 },
    { c: -1, xEval: 2, m1: 2, b1: 6, m2: -3, b2: 4 },
  ];

  pieceSpecs.forEach(({ c, xEval, m1, b1, m2, b2 }, i) => {
    const branch1 = fmtLinear(m1, b1);
    const branch2 = fmtLinear(m2, b2);
    const useFirst = xEval < c;
    const ans = useFirst ? m1 * xEval + b1 : m2 * xEval + b2;
    const wrongBranchAns = useFirst ? m2 * xEval + b2 : m1 * xEval + b1;
    const formula = `f(x) = \\begin{cases} ${branch1} & \\text{si } x < ${c} \\\\ ${branch2} & \\text{si } x \\ge ${c} \\end{cases}`;

    questions.push({
      id: `lvl5_q${questions.length + 1}`,
      level: 5,
      topic: 'grafica',
      title: `Función a trozos (${i + 1})`,
      functionFormula: formula,
      functionType: 'A Trozos',
      domain: 'ℝ',
      range: 'ℝ',
      xIntercepts: ['Evaluar por tramo'],
      yIntercept: `(0, ${0 < c ? b1 : b2})`,
      prompt: `Dada la función definida por partes, calcula el valor exacto de f(${xEval}).`,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 55,
      options: buildRotatedOptions(
        {
          text: `f(${xEval}) = ${ans}`,
          explanationNote: `Correcto: como ${xEval} ${useFirst ? `< ${c}` : `≥ ${c}`}, se evalúa en ${useFirst ? branch1 : branch2}.`,
        },
        [
          {
            text: `f(${xEval}) = ${wrongBranchAns}`,
            explanationNote: 'Evaluaste en el tramo equivocado sin respetar la desigualdad.',
          },
          {
            text: `f(${xEval}) = ${ans + wrongBranchAns}`,
            explanationNote: 'En una función a trozos solo se evalúa un tramo, nunca se suman.',
          },
          {
            text: `f(${xEval}) no existe`,
            explanationNote: `El valor x = ${xEval} sí pertenece a uno de los tramos definidos.`,
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: 'Evaluación de Función a Trozos',
        formulaBreakdown: `Verificamos en qué intervalo cae x = ${xEval} respecto al punto de cambio x = ${c}.`,
        domainExplanation: 'Dom(f) = (-∞, c) ∪ [c, +∞) = ℝ.',
        rangeExplanation: 'Cada tramo aporta su conjunto de imágenes.',
        interceptsExplanation: `Como ${xEval} ${useFirst ? `< ${c}` : `≥ ${c}`}, aplicamos ${useFirst ? branch1 : branch2} ⇒ ${ans}.`,
        graphObservation: 'Gráfica compuesta por dos semirrectas con punto frontera en x = ' + c,
        pedagogicalTip: 'Fíjate bien en el símbolo < versus ≥ para saber qué fórmula usar en el punto frontera.',
      },
      graphConfig: {
        xMin: c - 5,
        xMax: c + 5,
        yMin: -8,
        yMax: 10,
        evalFunctionCode: `x < ${c} ? (${m1} * x + (${b1})) : (${m2} * x + (${b2}))`,
        keyPoints: [{ x: xEval, y: ans, label: `f(${xEval})=${ans}`, color: '#059669', type: 'reference' }],
      },
    });
  });

  // 3. Inversas homográficas y radicales con restricción (12 ejercicios)
  const advInvSpecs: [number, number, number][] = [
    [1, 3, 2], [1, -4, 1], [1, 5, -3], [1, -2, 4], [1, 1, -5], [1, 6, 0],
    [2, -4, 3], [2, 6, -1], [1, -7, 2], [1, 2, 5], [1, -1, -4], [1, 8, 1],
  ];
  advInvSpecs.forEach(([a, b, k], i) => {
    // f(x) = sqrt(a*x + b) + k => Dom: x >= -b/a, Ran: [k, +inf)
    // f^-1(x) = ((x - k)^2 - b)/a, Dom(f^-1) = [k, +inf)
    const boundary = -b / a;
    const inner = fmtLinear(a, b);
    const kPart = k === 0 ? '' : ` ${fmtSigned(k)}`;
    const formula = `f(x) = \\sqrt{${inner}}${kPart}`;
    const invText =
      a === 1
        ? `f⁻¹(x) = (x ${k >= 0 ? `- ${k}` : `+ ${Math.abs(k)}`})² ${b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`} con Dom: [${k}, +∞)`
        : `f⁻¹(x) = [(x ${k >= 0 ? `- ${k}` : `+ ${Math.abs(k)}`})² ${b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`}] / ${a} con Dom: [${k}, +∞)`;

    questions.push({
      id: `lvl5_q${questions.length + 1}`,
      level: 5,
      topic: 'inversa',
      title: `Inversa de función radical (${i + 1})`,
      functionFormula: formula,
      functionType: 'Inversa',
      domain: `[${boundary}, +∞)`,
      range: `[${k}, +∞)`,
      xIntercepts: ['Según k'],
      yIntercept: 'Evaluar f(0)',
      prompt: `Dada ${formula}, halla su función inversa f⁻¹(x) indicando su Dominio restringido obligatorio.`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 65,
      options: buildRotatedOptions(
        {
          text: invText,
          explanationNote: `Correcto: el Dominio de f⁻¹ es igual al Rango de f, es decir [${k}, +∞).`,
        },
        [
          {
            text: `f⁻¹(x) = (x ${k >= 0 ? `- ${k}` : `+ ${Math.abs(k)}`})² ${b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`} con Dom: ℝ`,
            explanationNote: '¡Error típico! Si dejas Dom = ℝ, la parábola no es inversa de una sola rama radical.',
          },
          {
            text: `f⁻¹(x) = (x ${k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`})² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} con Dom: [${boundary}, +∞)`,
            explanationNote: 'Los signos están invertidos y usaste Dom(f) en vez de Ran(f).',
          },
          {
            text: `f⁻¹(x) = 1 / (${inner}) con Dom: ℝ \\ {${boundary}}`,
            explanationNote: 'La inversa de una raíz cuadrada es una función cuadrática restringida, no una racional.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Inversa de Radical con Restricción',
        formulaBreakdown: `Ran(f) = [${k}, +∞), por lo tanto Dom(f⁻¹) = [${k}, +∞). Despejando y de x = √(${a}y ${fmtSigned(b)}) ${kPart} se eleva al cuadrado.`,
        domainExplanation: `Dom(f) = [${boundary}, +∞), Dom(f⁻¹) = [${k}, +∞).`,
        rangeExplanation: `Ran(f⁻¹) = Dom(f) = [${boundary}, +∞).`,
        interceptsExplanation: `El punto inicio (${boundary}, ${k}) de f se refleja en (${k}, ${boundary}) en f⁻¹.`,
        graphObservation: 'Semiparábola reflejada respecto a y = x.',
        pedagogicalTip: 'Siempre: Dom(f⁻¹) = Ran(f) y Ran(f⁻¹) = Dom(f). Nunca olvides escribir la restricción.',
      },
      graphConfig: {
        xMin: Math.min(boundary, k) - 2,
        xMax: Math.max(boundary, k) + 8,
        yMin: Math.min(boundary, k) - 2,
        yMax: Math.max(boundary, k) + 8,
        showDiagonalSymmetry: true,
        evalFunctionCode: `(${a} * x + (${b})) >= 0 ? Math.sqrt(${a} * x + (${b})) + (${k}) : null`,
        secondaryEvalCode: `x >= ${k} ? (Math.pow(x - (${k}), 2) - (${b})) / ${a} : null`,
        secondaryLabel: 'f⁻¹(x)',
        keyPoints: [],
      },
    });
  });

  // 4. Intervalos de Positividad C+ y Negatividad C- (11 ejercicios)
  const signSpecs: [number, number][] = [
    [1, -4], [1, -6], [2, -8], [1, -3], [3, -6],
    [-1, 5], [-1, 3], [-2, 6], [1, -7], [-1, 4], [2, -10],
  ];
  signSpecs.forEach(([a, k], i) => {
    // f(x) = |x - 2| + k (for a=1, k<0) => roots at 2-|k| and 2+|k|
    // Or f(x) = -|x - 2| + k (for a=-1, k>0)
    const h = 2;
    const r = Math.abs(k / a);
    const x1 = h - r;
    const x2 = h + r;
    const formula = `f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}|x - 2| ${fmtSigned(k)}`;
    const cPos = a > 0 ? `(-∞, ${x1}) ∪ (${x2}, +∞)` : `(${x1}, ${x2})`;
    const cNeg = a > 0 ? `(${x1}, ${x2})` : `(-∞, ${x1}) ∪ (${x2}, +∞)`;

    questions.push({
      id: `lvl5_q${questions.length + 1}`,
      level: 5,
      topic: 'integral',
      title: `Intervalos C⁺ y C⁻ (${i + 1})`,
      functionFormula: formula,
      functionType: 'Valor Absoluto',
      domain: 'ℝ',
      range: a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`,
      xIntercepts: [`(${x1}, 0)`, `(${x2}, 0)`],
      yIntercept: `(0, ${a * 2 + k})`,
      prompt: `Dada ${formula} con raíces en x₁ = ${x1} y x₂ = ${x2}, determina su conjunto de positividad C⁺ y negatividad C⁻.`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 65,
      options: buildRotatedOptions(
        {
          text: `C⁺ = ${cPos}  |  C⁻ = ${cNeg}`,
          explanationNote: `Correcto: C⁺ es donde f(x) > 0 (por encima del eje X) y C⁻ donde f(x) < 0 (por debajo).`,
        },
        [
          {
            text: `C⁺ = ${cNeg}  |  C⁻ = ${cPos}`,
            explanationNote: 'Invertiste C⁺ con C⁻.',
          },
          {
            text: `C⁺ = [${x1}, ${x2}]  |  C⁻ = ∅`,
            explanationNote: 'Las raíces no pertenecen ni a C⁺ ni a C⁻ porque allí f(x) = 0.',
          },
          {
            text: `C⁺ = (${x1}, +∞)  |  C⁻ = (-∞, ${x1})`,
            explanationNote: 'Omitiste la segunda raíz en x₂ = ' + x2,
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: 'Intervalos de Positividad C⁺ y Negatividad C⁻',
        formulaBreakdown: `Raíces: ${x1} y ${x2}. Vértice en (2, ${k}).`,
        domainExplanation: 'Dom(f) = ℝ.',
        rangeExplanation: a > 0 ? `Ran(f) = [${k}, +∞).` : `Ran(f) = (-∞, ${k}].`,
        interceptsExplanation: `C⁺ (f(x) > 0): ${cPos}. C⁻ (f(x) < 0): ${cNeg}.`,
        graphObservation: a > 0 ? 'La V queda por debajo del eje X entre x₁ y x₂.' : 'La V invertida sobresale por encima del eje X entre x₁ y x₂.',
        pedagogicalTip: 'En C⁺ y C⁻ los intervalos siempre van abiertos en las raíces porque f(raíz) = 0 (ni positivo ni negativo).',
      },
      graphConfig: {
        xMin: x1 - 3,
        xMax: x2 + 3,
        yMin: a > 0 ? k - 2 : -6,
        yMax: a > 0 ? 6 : k + 2,
        evalFunctionCode: `${a} * Math.abs(x - 2) + (${k})`,
        keyPoints: [
          { x: x1, y: 0, label: `(${x1}, 0)`, color: '#059669', type: 'x-intercept' },
          { x: x2, y: 0, label: `(${x2}, 0)`, color: '#059669', type: 'x-intercept' },
        ],
      },
    });
  });

  return questions;
}

function buildLevel6Questions(): Question[] {
  const questions: Question[] = [];

  // 1. Exponenciales desplazadas completas (13 ejercicios)
  const expMaster: [number, number, number, number][] = [
    [6, 2, 2, -4], [2, 1, 3, -8], [3, 1, 2, -9], [5, 1, 1, -25],
    [4, 1, 2, -16], [2, 2, 1, -4], [3, 2, 2, -3], [6, 1, 2, -6],
    [2, 3, 1, -2], [4, 2, 1, -4], [5, 2, 2, -5], [7, 1, 1, -7], [2, 1, 4, -16],
  ];
  expMaster.forEach(([base, p, q, k], i) => {
    const expStr = p === 1 ? `x - ${q}` : `\\frac{x}{${p}} - ${q}`;
    const formula = `g(x) = ${base}^{${expStr}} ${fmtSigned(k)}`;
    // root when base^(x/p - q) = -k => exact when -k is base or base^2
    const targetExp = Math.round(Math.log(-k) / Math.log(base));
    const isExactPower = Math.pow(base, targetExp) === -k;
    const rootStr = isExactPower ? `${(targetExp + q) * p}` : `${p}(${q} + log_${base}(${-k}))`;
    const rootNum = p * (q + Math.log(-k) / Math.log(base));

    questions.push({
      id: `lvl6_q${questions.length + 1}`,
      level: 6,
      topic: 'integral',
      title: `Análisis integral exponencial (${i + 1})`,
      functionFormula: formula,
      functionType: 'Exponencial',
      domain: 'ℝ',
      range: `(${k}, +∞)`,
      xIntercepts: [`(${rootStr}, 0)`],
      yIntercept: `(0, ${base}^(-${q}) ${fmtSigned(k)})`,
      prompt: `Analiza integralmente ${formula}. Selecciona la ficha completa correcta (Dominio, A.H., Rango e Intervalos C⁺/C⁻).`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 75,
      options: buildRotatedOptions(
        {
          text: `Dom: ℝ  |  A.H.: y = ${k}  |  Ran: (${k}, +∞)  |  Raíz x = ${rootStr}`,
          explanationNote: `Correcto: base ${base} > 1, desplazamiento vertical ${k} define la A.H. y el rango.`,
        },
        [
          {
            text: `Dom: (${k}, +∞)  |  A.V.: x = ${k}  |  Ran: ℝ`,
            explanationNote: 'Confundiste exponencial con logarítmica.',
          },
          {
            text: `Dom: ℝ  |  A.H.: y = ${k}  |  Ran: [${k}, +∞)`,
            explanationNote: 'La exponencial nunca toca su asíntota horizontal.',
          },
          {
            text: `Dom: ℝ  |  A.H.: y = ${-k}  |  Ran: (${-k}, +∞)`,
            explanationNote: 'Error de signo en la traslación vertical.',
          },
        ],
        i
      ),
      stepByStepSolution: {
        title: 'Análisis Completo Exponencial',
        formulaBreakdown: `Función ${formula} con base ${base} > 1 y traslación k = ${k}.`,
        domainExplanation: 'Dom(g) = ℝ.',
        rangeExplanation: `A.H. en y = ${k} y Ran(g) = (${k}, +∞).`,
        interceptsExplanation: `Raíz en x = ${rootStr}. C⁻ = (-∞, ${rootStr}) y C⁺ = (${rootStr}, +∞).`,
        graphObservation: `Curva creciente asintótica a y = ${k}.`,
        pedagogicalTip: 'Para hallar la raíz de b^u - c = 0, aplica log_b a ambos lados: u = log_b(c).',
      },
      graphConfig: {
        xMin: rootNum - 4,
        xMax: rootNum + 4,
        yMin: k - 2,
        yMax: 8,
        asymptotes: { horizontal: [k] },
        evalFunctionCode: `Math.pow(${base}, x / ${p} - ${q}) + (${k})`,
        keyPoints: [{ x: Number(rootNum.toFixed(2)), y: 0, label: `Raíz (${rootStr}, 0)`, color: '#059669', type: 'x-intercept' }],
      },
    });
  });

  // 2. Análisis integral de logarítmicas h(x) = log_b(ax - c) (13 ejercicios)
  const logMaster: [number, number, number][] = [
    [6, 5, -3], [2, 3, -5], [3, 2, -5], [5, 4, -7],
    [4, 3, -2], [2, 5, -4], [6, 2, -7], [3, 4, -5],
    [5, 2, -9], [10, 5, -4], [2, 4, -3], [6, 3, -8], [4, 5, -1],
  ];
  logMaster.forEach(([base, a, b], i) => {
    const argStr = fmtLinear(a, b);
    const formula = `h(x) = \\log_${base}(${argStr})`;
    const avStr = simplifyFrac(-b, a);
    const avNum = -b / a;
    const rootStr = simplifyFrac(1 - b, a);
    const rootNum = (1 - b) / a;

    questions.push({
      id: `lvl6_q${questions.length + 1}`,
      level: 6,
      topic: 'integral',
      title: `Análisis integral logarítmico (${i + 1})`,
      functionFormula: formula,
      functionType: 'Logarítmica',
      domain: `(${avStr}, +∞)`,
      range: 'ℝ',
      xIntercepts: [`(${rootStr}, 0)`],
      yIntercept: 'No existe (x=0 fuera del dominio)',
      prompt: `Analiza completamente ${formula}: determina Dominio, Asíntota Vertical, Raíz exacta e intervalo de positividad C⁺.`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 80,
      options: buildRotatedOptions(
        {
          text: `Dom: (${avStr}, +∞)  |  A.V.: x = ${avStr}  |  Raíz: (${rootStr}, 0)  |  C⁺: (${rootStr}, +∞)`,
          explanationNote: `Correcto: ${argStr} > 0 ⇒ x > ${avStr}, y ${argStr} = 1 ⇒ x = ${rootStr}.`,
        },
        [
          {
            text: `Dom: [${avStr}, +∞)  |  A.V.: x = ${avStr}  |  Raíz: (${avStr}, 0)`,
            explanationNote: 'La raíz está donde el argumento vale 1, no donde vale 0.',
          },
          {
            text: `Dom: (${rootStr}, +∞)  |  A.V.: x = ${rootStr}  |  Raíz: (${avStr}, 0)`,
            explanationNote: 'Confundiste la asíntota vertical con el punto de corte con X.',
          },
          {
            text: `Dom: ℝ  |  Ran: (${avStr}, +∞)  |  C⁺: (${avStr}, +∞)`,
            explanationNote: 'En logaritmos el Rango es ℝ y el Dominio depende de argumento > 0.',
          },
        ],
        i + 1
      ),
      stepByStepSolution: {
        title: 'Análisis Integral Logarítmico',
        formulaBreakdown: `Base ${base} > 1, función creciente en todo su dominio.`,
        domainExplanation: `${argStr} > 0 ⇒ x > ${avStr}. A.V. en x = ${avStr}.`,
        rangeExplanation: 'Ran(h) = ℝ.',
        interceptsExplanation: `Raíz: ${argStr} = ${base}⁰ = 1 ⇒ x = ${rootStr}. Así C⁻ = (${avStr}, ${rootStr}) y C⁺ = (${rootStr}, +∞).`,
        graphObservation: `Nace pegada a la asíntota x = ${avStr} y cruza al eje X en (${rootStr}, 0).`,
        pedagogicalTip: 'Truco clave: A.V. donde argumento = 0; Raíz donde argumento = 1.',
      },
      graphConfig: {
        xMin: avNum - 1,
        xMax: avNum + 6,
        yMin: -4,
        yMax: 4,
        asymptotes: { vertical: [avNum] },
        evalFunctionCode: `(${a} * x + (${b})) > 0 ? Math.log(${a} * x + (${b})) / Math.log(${base}) : null`,
        keyPoints: [{ x: Number(rootNum.toFixed(2)), y: 0, label: `Raíz (${rootStr}, 0)`, color: '#059669', type: 'x-intercept' }],
      },
    });
  });

  // 3. Análisis integral de racionales homográficas (12 ejercicios)
  const ratMaster: [number, number, number, number][] = [
    [2, 6, 1, 4], [3, -9, 1, 2], [4, 8, 1, -3], [2, -10, 1, 1],
    [-2, 8, 1, 3], [3, 6, 1, -4], [5, -15, 1, 2], [-3, -6, 1, 5],
    [4, -12, 2, 4], [6, 12, 2, -6], [2, 10, 1, -1], [-4, 16, 2, 6],
  ];
  ratMaster.forEach(([a, b, c, d], i) => {
    const av = -d / c;
    const ah = a / c;
    const rootX = -b / a;
    const cutY = simplifyFrac(b, d);
    const formula = `f(x) = \\frac{${fmtLinear(a, b)}}{${fmtLinear(c, d)}}`;
    const minCrit = Math.min(av, rootX);
    const maxCrit = Math.max(av, rootX);
    const outsidePos = a / c > 0;
    const cPos = outsidePos ? `(-∞, ${minCrit}) ∪ (${maxCrit}, +∞)` : `(${minCrit}, ${maxCrit})`;
    const cNeg = outsidePos ? `(${minCrit}, ${maxCrit})` : `(-∞, ${minCrit}) ∪ (${maxCrit}, +∞)`;

    questions.push({
      id: `lvl6_q${questions.length + 1}`,
      level: 6,
      topic: 'integral',
      title: `Análisis completo racional (${i + 1})`,
      functionFormula: formula,
      functionType: 'Racional',
      domain: `ℝ \\ {${av}}`,
      range: `ℝ \\ {${ah}}`,
      xIntercepts: [`(${rootX}, 0)`],
      yIntercept: `(0, ${cutY})`,
      prompt: `Realiza el análisis completo de ${formula} (Asíntotas, Cortes y Signos C⁺/C⁻).`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 85,
      options: buildRotatedOptions(
        {
          text: `A.V.: x=${av} | A.H.: y=${ah} | Raíz: (${rootX}, 0) | C⁺: ${cPos}`,
          explanationNote: `Correcto: puntos críticos ${minCrit} y ${maxCrit} dividen la recta real.`,
        },
        [
          {
            text: `A.V.: x=${av} | A.H.: y=${ah} | Raíz: (${rootX}, 0) | C⁺: ${cNeg}`,
            explanationNote: 'Revisa los signos evaluando un punto de prueba en cada intervalo.',
          },
          {
            text: `A.V.: x=${ah} | A.H.: y=${av} | Raíz: (0, ${cutY})`,
            explanationNote: 'Las asíntotas y el eje de corte están intercambiados.',
          },
          {
            text: `A.V.: x=${-av} | A.H.: y=${-ah} | Raíz: (${-rootX}, 0)`,
            explanationNote: 'Errores de signo al despejar numerador y denominador.',
          },
        ],
        i + 2
      ),
      stepByStepSolution: {
        title: 'Análisis Integral Homográfico',
        formulaBreakdown: `Numerador: ${fmtLinear(a, b)}, Denominador: ${fmtLinear(c, d)}.`,
        domainExplanation: `Dom(f) = ℝ \\ {${av}}, A.V.: x = ${av}.`,
        rangeExplanation: `Ran(f) = ℝ \\ {${ah}}, A.H.: y = ${ah}.`,
        interceptsExplanation: `Raíz: (${rootX}, 0). Corte Y: (0, ${cutY}). C⁺ = ${cPos}, C⁻ = ${cNeg}.`,
        graphObservation: 'Hipérbola equilátera con dos ramas separadas por las asíntotas.',
        pedagogicalTip: 'Para hallar C⁺ y C⁻ de una racional, ubica tanto la raíz como la asíntota vertical en la recta numérica y evalúa signos.',
      },
      graphConfig: {
        xMin: Math.min(av, rootX) - 4,
        xMax: Math.max(av, rootX) + 4,
        yMin: ah - 5,
        yMax: ah + 5,
        asymptotes: { vertical: [av], horizontal: [ah] },
        evalFunctionCode: `(${a} * x + (${b})) / (${c} * x + (${d}))`,
        keyPoints: [{ x: rootX, y: 0, label: `Raíz (${rootX}, 0)`, color: '#059669', type: 'x-intercept' }],
      },
    });
  });

  // 4. Composición avanzada e inversas homográficas (12 ejercicios)
  const compAdvSpecs: [number, number, number][] = [
    [1, -4, 3], [1, 2, -5], [2, -6, 1], [1, -9, 4],
    [1, 5, -2], [3, -12, 2], [1, -1, 6], [2, 4, -3],
    [1, -7, 5], [1, 3, -6], [4, -8, 1], [1, -10, 3],
  ];
  compAdvSpecs.forEach(([a, b, shift], i) => {
    // f(x) = sqrt(x), g(x) = a*x + b + shift => (f o g)(x) = sqrt(ax + b + shift) or f(x) = sqrt(a*x + b), g(x) = x + shift
    // Let f(x) = sqrt(x - shift), g(x) = a*x + b => (f o g)(x) = sqrt(a*x + (b - shift))
    const finalB = b - shift;
    const crit = simplifyFrac(-finalB, a);
    const critNum = -finalB / a;
    const fStr = `f(x) = \\sqrt{${shift === 0 ? 'x' : shift > 0 ? `x - ${shift}` : `x + ${Math.abs(shift)}`}}`;
    const gStr = `g(x) = ${fmtLinear(a, b)}`;

    questions.push({
      id: `lvl6_q${questions.length + 1}`,
      level: 6,
      topic: 'composicion',
      title: `Dominio de composición radical (${i + 1})`,
      functionFormula: fStr,
      secondaryFormula: gStr,
      functionType: 'Compuesta',
      domain: `[${crit}, +∞)`,
      range: '[0, +∞)',
      xIntercepts: [`(${crit}, 0)`],
      yIntercept: 'Evaluar en x=0',
      prompt: `Dadas ${fStr} y ${gStr}, determina el Dominio exacto de la composición (f ∘ g)(x).`,
      questionType: 'multiple-choice',
      difficulty: 'Avanzado',
      xpReward: 80,
      options: buildRotatedOptions(
        {
          text: `Dom(f ∘ g) = [${crit}, +∞)`,
          explanationNote: `Correcto: (f ∘ g)(x) = √(${fmtLinear(a, finalB)}), exigiendo ${fmtLinear(a, finalB)} ≥ 0 ⇒ x ≥ ${crit}.`,
        },
        [
          {
            text: `Dom(f ∘ g) = [${shift}, +∞)`,
            explanationNote: 'Ese es solo el dominio de f(x), no de la composición (f ∘ g)(x).',
          },
          {
            text: `Dom(f ∘ g) = (${crit}, +∞)`,
            explanationNote: 'La raíz cuadrada de 0 sí existe; el extremo debe ser cerrado [ ].',
          },
          {
            text: `Dom(f ∘ g) = ℝ`,
            explanationNote: 'Debes restringir g(x) para que caiga dentro del dominio de f(x).',
          },
        ],
        i + 3
      ),
      stepByStepSolution: {
        title: 'Dominio de Función Compuesta',
        formulaBreakdown: `(f ∘ g)(x) = f(g(x)) = √(${fmtLinear(a, b)} - (${shift})) = √(${fmtLinear(a, finalB)}).`,
        domainExplanation: `Exigimos ${fmtLinear(a, finalB)} ≥ 0 ⇒ x ≥ ${crit}, es decir [${crit}, +∞).`,
        rangeExplanation: 'Ran(f ∘ g) = [0, +∞).',
        interceptsExplanation: `Corte X en (${crit}, 0).`,
        graphObservation: 'Curva compuesta con inicio en x = ' + crit,
        pedagogicalTip: 'Para Dom(f ∘ g): necesitas x ∈ Dom(g) Y g(x) ∈ Dom(f).',
      },
      graphConfig: {
        xMin: critNum - 3,
        xMax: critNum + 7,
        yMin: -2,
        yMax: 7,
        evalFunctionCode: `(${a} * x + (${finalB})) >= 0 ? Math.sqrt(${a} * x + (${finalB})) : null`,
        keyPoints: [{ x: Number(critNum.toFixed(2)), y: 0, label: `Inicio (${crit}, 0)`, color: '#059669', type: 'x-intercept' }],
      },
    });
  });

  return questions;
}

export const INITIAL_QUESTIONS: Question[] = [
  ...buildLevel1Questions(),
  ...buildLevel2Questions(),
  ...buildLevel3Questions(),
  ...buildLevel4Questions(),
  ...buildLevel5Questions(),
  ...buildLevel6Questions(),
];
