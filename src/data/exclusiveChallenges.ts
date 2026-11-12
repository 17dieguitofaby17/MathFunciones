import { ExclusiveChallenge, QuestionOption, RubricStep } from '../types';

function rotateOpts(
  correct: { text: string; explanationNote: string },
  distractors: { text: string; explanationNote: string }[],
  seed: number
): QuestionOption[] {
  const targetIdx = ((seed % 4) + 4) % 4;
  const arr = [...distractors];
  arr.splice(targetIdx, 0, correct);
  return arr.map((o, idx) => ({
    id: `r_opt_${idx + 1}`,
    text: o.text,
    isCorrect: idx === targetIdx,
    explanationNote: o.explanationNote,
  }));
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
  return d === 1 ? `${n}` : `${n}/${d}`;
}

function fmtSigned(n: number): string {
  return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function fmtLinear(m: number, b: number): string {
  const mPart = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
  return b === 0 ? mPart : `${mPart} ${fmtSigned(b)}`;
}

interface ExpSpec {
  name: string;
  base: number;
  p: number; // x/p
  q: number; // - q
  k: number; // - r (negative so it crosses X)
  slot: '15:00' | '18:00';
}

function buildExponentialChallenge(spec: ExpSpec, idx: number, seed: number): ExclusiveChallenge {
  const { name, base, p, q, k, slot } = spec;
  const expLatex = p === 1 ? `x - ${q}` : `\\frac{x}{${p}} - ${q}`;
  const formula = `${name}(x) = ${base}^{${expLatex}} - ${Math.abs(k)}`;
  const kNeg = -Math.abs(k);
  // Root: base^(x/p - q) = |k| => x = p*(q + log_base(|k|))
  const exactLog = Math.log(Math.abs(k)) / Math.log(base);
  const isCleanInt = Math.abs(exactLog - Math.round(exactLog)) < 1e-9;
  const rootVal = Number((p * (q + exactLog)).toFixed(2));
  const rootExactStr = isCleanInt
    ? `${Math.round(p * (q + Math.round(exactLog)))}`
    : `${p}(${q} + log_${base}(${Math.abs(k)})) ≈ ${rootVal}`;

  // Y-intercept: f(0) = base^(-q) - |k|
  const denomY = Math.pow(base, q);
  const numY = 1 - Math.abs(k) * denomY;
  const cutYFrac = simplifyFrac(numY, denomY);
  const cutYDec = (numY / denomY).toFixed(2);

  const rubricSteps: RubricStep[] = [
    {
      id: 'dominio',
      label: 'Dominio',
      maxPoints: 0.25,
      prompt: '1) Determina el Dominio de la función exponencial:',
      options: rotateOpts(
        { text: 'Dom = ℝ = (-∞, +∞)', explanationNote: 'El exponente lineal está definido para todo real.' },
        [
          { text: `Dom = (${kNeg}, +∞)`, explanationNote: `(${kNeg}, +∞) es el rango, no el dominio.` },
          { text: `Dom = ℝ \\ {${q * p}}`, explanationNote: 'No hay denominador que se anule.' },
          { text: `Dom = [${kNeg}, +∞)`, explanationNote: 'Las funciones exponenciales no restringen x.' },
        ],
        seed
      ),
    },
    {
      id: 'asintotas',
      label: 'Asíntotas',
      maxPoints: 0.25,
      prompt: '2) Identifica la ecuación de la Asíntota:',
      options: rotateOpts(
        { text: `Asíntota Horizontal (A.H.): y = ${kNeg}`, explanationNote: `Cuando x → -∞, la potencia tiende a 0 y ${name}(x) → ${kNeg}.` },
        [
          { text: `Asíntota Vertical (A.V.): x = ${kNeg}`, explanationNote: 'Las exponenciales carecen de asíntota vertical.' },
          { text: `Asíntota Horizontal (A.H.): y = ${Math.abs(k)}`, explanationNote: 'Revisa el signo de la traslación vertical.' },
          { text: 'No posee asíntotas', explanationNote: 'Toda exponencial b^u + k tiene A.H. en y = k.' },
        ],
        seed + 1
      ),
    },
    {
      id: 'ceros',
      label: 'Ceros - Raíces o P.C. Ejes',
      maxPoints: 1.0,
      prompt: '3) Halla los cortes exactos con el Eje X (Raíz) y el Eje Y:',
      options: rotateOpts(
        {
          text: `Corte X: (${rootExactStr}, 0)  |  Corte Y: (0, ${cutYFrac}) ≈ (0, ${cutYDec})`,
          explanationNote: `Igualando a 0 se despeja x ≈ ${rootVal}; evaluando x = 0 se obtiene ${cutYFrac}.`,
        },
        [
          {
            text: `Corte X: (${(p * q).toFixed(1)}, 0)  |  Corte Y: (0, ${kNeg})`,
            explanationNote: 'Olvidaste aplicar logaritmo o evaluar la potencia en x = 0.',
          },
          {
            text: `Corte X: (0, ${cutYFrac})  |  Corte Y: (${rootExactStr}, 0)`,
            explanationNote: 'Las coordenadas de los cortes con X e Y están invertidas.',
          },
          {
            text: `No corta al eje X  |  Corte Y: (0, ${1 + kNeg})`,
            explanationNote: `Como la A.H. y = ${kNeg} está debajo de 0 y base > 1, sí corta al eje X.`,
          },
        ],
        seed + 2
      ),
    },
    {
      id: 'rango',
      label: 'Rango',
      maxPoints: 0.25,
      prompt: '4) Determina el Rango (Recorrido) exacto:',
      options: rotateOpts(
        { text: `Ran = (${kNeg}, +∞)`, explanationNote: `Siempre ${base}^u > 0, por lo que y > ${kNeg}.` },
        [
          { text: `Ran = [${kNeg}, +∞)`, explanationNote: 'La curva jamás toca su asíntota horizontal.' },
          { text: 'Ran = ℝ = (-∞, +∞)', explanationNote: 'Nunca toma valores menores o iguales a la A.H.' },
          { text: `Ran = (-∞, ${kNeg})`, explanationNote: 'El signo delante de la potencia es positivo, crece hacia +∞.' },
        ],
        seed + 3
      ),
    },
    {
      id: 'intervalos',
      label: 'Intervalos de C⁺ y C⁻',
      maxPoints: 0.25,
      prompt: '5) Indica los intervalos de positividad (C⁺) y negatividad (C⁻):',
      options: rotateOpts(
        {
          text: `C⁺ = (${rootExactStr}, +∞)  |  C⁻ = (-∞, ${rootExactStr})`,
          explanationNote: `Como es creciente, es negativa antes de la raíz y positiva después.`,
        },
        [
          {
            text: `C⁺ = (-∞, ${rootExactStr})  |  C⁻ = (${rootExactStr}, +∞)`,
            explanationNote: 'Invertiste C⁺ y C⁻; la base > 1 es creciente.',
          },
          {
            text: `C⁺ = (${kNeg}, +∞)  |  C⁻ = ∅`,
            explanationNote: `Entre (-∞, ${rootVal}) los valores de y son negativos.`,
          },
          {
            text: `C⁺ = ℝ  |  C⁻ = ∅`,
            explanationNote: 'La curva cruza por debajo del eje X a la izquierda de su raíz.',
          },
        ],
        seed + 1
      ),
    },
    {
      id: 'grafica',
      label: 'Gráfica',
      maxPoints: 0.5,
      prompt: '6) Selecciona la descripción correcta del bosquejo de la gráfica:',
      options: rotateOpts(
        {
          text: `Curva exponencial creciente asintótica a y = ${kNeg} por la izquierda, pasa por (0, ${cutYDec}) y sube cruzando (${rootVal}, 0).`,
          explanationNote: 'Describe fielmente concavidad, asíntota y ambos cortes.',
        },
        [
          {
            text: `Curva exponencial decreciente con asíntota vertical x = ${kNeg} que baja hacia -∞.`,
            explanationNote: 'Base > 1 y exponente positivo siempre producen crecimiento.',
          },
          {
            text: `Parábola abierta hacia arriba con vértice mínimo en (0, ${kNeg}).`,
            explanationNote: 'No es cuadrática, es exponencial.',
          },
          {
            text: `Recta creciente que pasa por (0, ${kNeg}) y (${rootVal}, 0).`,
            explanationNote: 'El crecimiento exponencial es curvo, no lineal.',
          },
        ],
        seed + 2
      ),
    },
  ];

  return {
    id: `exc_${slot === '15:00' ? '15' : '18'}_${idx}`,
    slot,
    slotName: slot === '15:00' ? `Reto 15h00 #${idx}` : `Reto 18h00 #${idx}`,
    title: `Análisis y Gráfica Exponencial: ${name}(x)`,
    topic: 'integral',
    functionFormula: formula,
    functionType: 'Exponencial',
    domain: 'ℝ = (-∞, +∞)',
    range: `(${kNeg}, +∞)`,
    asymptotesLabel: `A.H.: y = ${kNeg}`,
    zerosAndIntercepts: `Corte X: (${rootExactStr}, 0) | Corte Y: (0, ${cutYFrac})`,
    positivityInterval: `(${rootExactStr}, +∞)`,
    negativityInterval: `(-∞, ${rootExactStr})`,
    prompt: `Analice y grafique detalladamente la función ${formula} completando los 6 criterios de la rúbrica (2,50 Puntos).`,
    rubricSteps,
    stepByStepSolution: {
      title: `Desarrollo Completo de ${formula}`,
      formulaBreakdown: `1) Dominio: Por ser exponencial de exponente lineal, Dom(${name}) = ℝ.\n2) Asíntota: Como ${base}^u → 0 cuando x → -∞, la A.H. es y = ${kNeg}.`,
      domainExplanation: `Dom(${name}) = ℝ.`,
      rangeExplanation: `Ran(${name}) = (${kNeg}, +∞).`,
      interceptsExplanation: `Corte Y: ${name}(0) = ${base}^(-${q}) - ${Math.abs(k)} = 1/${denomY} - ${Math.abs(k)} = ${cutYFrac} ≈ ${cutYDec}. Raíz (${name}(x) = 0): ${base}^(${p === 1 ? `x - ${q}` : `x/${p} - ${q}`}) = ${Math.abs(k)} ⇒ x = ${rootExactStr}.`,
      graphObservation: `C⁺ = (${rootExactStr}, +∞), C⁻ = (-∞, ${rootExactStr}).`,
      pedagogicalTip: 'En el cuaderno de desarrollo: primero halla la A.H., luego evalúa x = 0 y despeja la raíz con logaritmos.',
    },
    graphConfig: {
      xMin: Math.min(-2, Math.floor(rootVal) - 4),
      xMax: Math.max(8, Math.ceil(rootVal) + 3),
      yMin: kNeg - 2,
      yMax: 8,
      asymptotes: { horizontal: [kNeg] },
      evalFunctionCode: `Math.pow(${base}, x / ${p} - ${q}) - ${Math.abs(k)}`,
      keyPoints: [
        { x: rootVal, y: 0, label: `Raíz (${rootVal}, 0)`, color: '#059669', type: 'x-intercept' },
        { x: 0, y: Number(cutYDec), label: `(0, ${cutYDec})`, color: '#0D47A1', type: 'y-intercept' },
      ],
    },
    baseXp: 60,
    doubleXp: 120,
    participationPoints: 2,
    tip: 'Despeja la potencia antes de aplicar logaritmo en base ' + base + '.',
  };
}

interface LogSpec {
  name: string;
  base: number;
  a: number;
  b: number; // ax + b
  slot: '15:00' | '18:00';
}

function buildLogChallenge(spec: LogSpec, idx: number, seed: number): ExclusiveChallenge {
  const { name, base, a, b, slot } = spec;
  const arg = fmtLinear(a, b);
  const formula = `${name}(x) = \\log_${base}(${arg})`;
  const avStr = simplifyFrac(-b, a);
  const avNum = Number((-b / a).toFixed(2));
  const rootStr = simplifyFrac(1 - b, a);
  const rootNum = Number(((1 - b) / a).toFixed(2));
  const hasCutY = b > 0;
  const cutYStr = hasCutY ? `(0, log_${base}(${b}))` : 'No existe (x = 0 fuera del dominio)';

  const rubricSteps: RubricStep[] = [
    {
      id: 'dominio',
      label: 'Dominio',
      maxPoints: 0.25,
      prompt: '1) Resuelve la condición del argumento para hallar el Dominio:',
      options: rotateOpts(
        { text: `Dom = (${avStr}, +∞)`, explanationNote: `Exigiendo ${arg} > 0 se obtiene x > ${avStr}.` },
        [
          { text: `Dom = [${avStr}, +∞)`, explanationNote: 'log(0) no está definido; debe ser paréntesis abierto.' },
          { text: `Dom = (${rootStr}, +∞)`, explanationNote: `${rootStr} es la raíz, no el extremo del dominio.` },
          { text: 'Dom = ℝ = (-∞, +∞)', explanationNote: 'El argumento de un logaritmo no puede ser ≤ 0.' },
        ],
        seed
      ),
    },
    {
      id: 'asintotas',
      label: 'Asíntotas',
      maxPoints: 0.25,
      prompt: '2) Determina la Asíntota de la función:',
      options: rotateOpts(
        { text: `Asíntota Vertical (A.V.): x = ${avStr}`, explanationNote: `Cuando ${arg} → 0⁺, x → ${avStr}⁺ y ${name}(x) → -∞.` },
        [
          { text: `Asíntota Horizontal (A.H.): y = ${avStr}`, explanationNote: 'Los logaritmos tienen asíntota vertical, no horizontal.' },
          { text: `Asíntota Vertical (A.V.): x = ${rootStr}`, explanationNote: 'En la raíz la función vale 0, no hay asíntota.' },
          { text: `Asíntota Vertical (A.V.): x = ${simplifyFrac(b, a)}`, explanationNote: 'Error de signo al despejar el argumento igualado a cero.' },
        ],
        seed + 1
      ),
    },
    {
      id: 'ceros',
      label: 'Ceros - Raíces o P.C. Ejes',
      maxPoints: 1.0,
      prompt: '3) Halla los Ceros / Raíces y Puntos de Corte con los ejes:',
      options: rotateOpts(
        {
          text: `Corte X (Raíz): (${rootStr}, 0)  |  Corte Y: ${cutYStr}`,
          explanationNote: `Igualando ${arg} = ${base}⁰ = 1 ⇒ x = ${rootStr}.`,
        },
        [
          {
            text: `Corte X (Raíz): (${avStr}, 0)  |  Corte Y: (0, ${b})`,
            explanationNote: 'Un logaritmo vale 0 cuando su argumento vale 1, no 0.',
          },
          {
            text: `Corte X (Raíz): (0, ${rootStr})  |  Corte Y: (0, ${base})`,
            explanationNote: 'Las coordenadas de corte están mal planteadas.',
          },
          {
            text: `Corte X (Raíz): (${simplifyFrac(base - b, a)}, 0)  |  Corte Y: (0, 0)`,
            explanationNote: `Al igualar log_${base}(u) = 0, u = ${base}⁰ = 1, no ${base}¹.`,
          },
        ],
        seed + 2
      ),
    },
    {
      id: 'rango',
      label: 'Rango',
      maxPoints: 0.25,
      prompt: '4) Determina el Rango:',
      options: rotateOpts(
        { text: 'Ran = ℝ = (-∞, +∞)', explanationNote: 'Toda función logarítmica recorre de -∞ a +∞.' },
        [
          { text: `Ran = (${avStr}, +∞)`, explanationNote: 'Confundiste el rango con el dominio.' },
          { text: 'Ran = (0, +∞)', explanationNote: 'El logaritmo sí toma valores negativos cuando 0 < argumento < 1.' },
          { text: `Ran = [${rootStr}, +∞)`, explanationNote: 'No existe cota inferior en el eje Y.' },
        ],
        seed + 3
      ),
    },
    {
      id: 'intervalos',
      label: 'Intervalos de C⁺ y C⁻',
      maxPoints: 0.25,
      prompt: '5) Determina los intervalos de positividad (C⁺) y negatividad (C⁻):',
      options: rotateOpts(
        {
          text: `C⁺ = (${rootStr}, +∞)  |  C⁻ = (${avStr}, ${rootStr})`,
          explanationNote: `Negativa entre la A.V. (${avStr}) y la raíz (${rootStr}); positiva después de la raíz.`,
        },
        [
          {
            text: `C⁺ = (${rootStr}, +∞)  |  C⁻ = (-∞, ${rootStr})`,
            explanationNote: `C⁻ no puede empezar en -∞ porque la función no existe a la izquierda de x = ${avStr}.`,
          },
          {
            text: `C⁺ = (${avStr}, ${rootStr})  |  C⁻ = (${rootStr}, +∞)`,
            explanationNote: 'Invertiste los signos de positividad y negatividad.',
          },
          {
            text: `C⁺ = (${avStr}, +∞)  |  C⁻ = ∅`,
            explanationNote: `Entre ${avStr} y ${rootStr} el argumento está entre 0 y 1, dando valores negativos.`,
          },
        ],
        seed + 1
      ),
    },
    {
      id: 'grafica',
      label: 'Gráfica',
      maxPoints: 0.5,
      prompt: '6) Identifica la gráfica correcta:',
      options: rotateOpts(
        {
          text: `Curva logarítmica creciente desde -∞ pegada a A.V. x = ${avStr}, cruza al eje X en (${rootStr}, 0) y sigue hacia +∞.`,
          explanationNote: 'Coincide exactamente con asíntota, raíz y monotonía.',
        },
        [
          {
            text: `Curva exponencial creciente con asíntota horizontal y = ${avStr}.`,
            explanationNote: 'Confundiste logarítmica con exponencial.',
          },
          {
            text: `Curva logarítmica decreciente que viene desde +∞ y se pega a x = ${rootStr}.`,
            explanationNote: `La base ${base} > 1 y el signo de x positivo hacen la curva creciente.`,
          },
          {
            text: `Semiparábola que parte exactamente del punto cerrado (${avStr}, 0).`,
            explanationNote: 'Una función logarítmica nunca toca su asíntota vertical.',
          },
        ],
        seed + 2
      ),
    },
  ];

  return {
    id: `exc_${slot === '15:00' ? '15' : '18'}_${idx}`,
    slot,
    slotName: slot === '15:00' ? `Reto 15h00 #${idx}` : `Reto 18h00 #${idx}`,
    title: `Análisis y Gráfica Logarítmica: ${name}(x)`,
    topic: 'integral',
    functionFormula: formula,
    functionType: 'Logarítmica',
    domain: `(${avStr}, +∞)`,
    range: 'ℝ = (-∞, +∞)',
    asymptotesLabel: `A.V.: x = ${avStr}`,
    zerosAndIntercepts: `Raíz: (${rootStr}, 0) | Corte Y: ${cutYStr}`,
    positivityInterval: `(${rootStr}, +∞)`,
    negativityInterval: `(${avStr}, ${rootStr})`,
    prompt: `Analice y grafique detalladamente la función ${formula} completando los 6 criterios de la rúbrica (2,50 Puntos).`,
    rubricSteps,
    stepByStepSolution: {
      title: `Desarrollo Completo de ${formula}`,
      formulaBreakdown: `1) Dominio: ${arg} > 0 ⇒ ${a}x > ${-b} ⇒ x > ${avStr} ⇒ Dom = (${avStr}, +∞).\n2) A.V.: x = ${avStr}.`,
      domainExplanation: `Dom(${name}) = (${avStr}, +∞).`,
      rangeExplanation: `Ran(${name}) = ℝ.`,
      interceptsExplanation: `Raíz (${name}(x)=0): log_${base}(${arg}) = 0 ⇒ ${arg} = ${base}⁰ = 1 ⇒ ${a}x = ${1 - b} ⇒ x = ${rootStr}. ${hasCutY ? `Corte Y: log_${base}(${b}).` : 'No corta eje Y porque 0 ∉ Dom.'}`,
      graphObservation: `C⁺ = (${rootStr}, +∞) y C⁻ = (${avStr}, ${rootStr}).`,
      pedagogicalTip: 'Recuerda siempre que C⁻ queda acotado a la izquierda por la asíntota vertical.',
    },
    graphConfig: {
      xMin: Math.floor(avNum) - 2,
      xMax: Math.ceil(avNum) + 6,
      yMin: -4,
      yMax: 4,
      asymptotes: { vertical: [avNum] },
      evalFunctionCode: `(${a} * x + (${b})) > 0 ? Math.log(${a} * x + (${b})) / Math.log(${base}) : null`,
      keyPoints: [
        { x: rootNum, y: 0, label: `Raíz (${rootStr}, 0)`, color: '#059669', type: 'x-intercept' },
      ],
    },
    baseXp: 60,
    doubleXp: 120,
    participationPoints: 2,
    tip: 'Iguala el argumento a 0 para la asíntota y a 1 para la raíz.',
  };
}

interface RatSpec {
  name: string;
  a: number;
  b: number;
  c: number;
  d: number;
  slot: '15:00' | '18:00';
}

function buildRationalChallenge(spec: RatSpec, idx: number, seed: number): ExclusiveChallenge {
  const { name, a, b, c, d, slot } = spec;
  const numStr = fmtLinear(a, b);
  const denStr = fmtLinear(c, d);
  const formula = `${name}(x) = \\frac{${numStr}}{${denStr}}`;
  const av = -d / c;
  const avStr = simplifyFrac(-d, c);
  const ah = a / c;
  const ahStr = simplifyFrac(a, c);
  const rootX = -b / a;
  const rootStr = simplifyFrac(-b, a);
  const cutYStr = simplifyFrac(b, d);
  const cutYNum = Number((b / d).toFixed(2));

  const minCrit = Math.min(av, rootX);
  const maxCrit = Math.max(av, rootX);
  const minStr = minCrit === av ? avStr : rootStr;
  const maxStr = maxCrit === av ? avStr : rootStr;
  const outsidePos = a / c > 0;
  const cPos = outsidePos ? `(-∞, ${minStr}) ∪ (${maxStr}, +∞)` : `(${minStr}, ${maxStr})`;
  const cNeg = outsidePos ? `(${minStr}, ${maxStr})` : `(-∞, ${minStr}) ∪ (${maxStr}, +∞)`;

  const rubricSteps: RubricStep[] = [
    {
      id: 'dominio',
      label: 'Dominio',
      maxPoints: 0.25,
      prompt: '1) Determina el Dominio excluyendo la raíz del denominador:',
      options: rotateOpts(
        { text: `Dom = ℝ \\ {${avStr}}`, explanationNote: `${denStr} ≠ 0 ⇒ x ≠ ${avStr}.` },
        [
          { text: `Dom = ℝ \\ {${ahStr}}`, explanationNote: `${ahStr} corresponde al valor excluido del Rango.` },
          { text: `Dom = ℝ \\ {${rootStr}}`, explanationNote: `En x = ${rootStr} el numerador es 0 (es la raíz, sí está en el dominio).` },
          { text: 'Dom = ℝ = (-∞, +∞)', explanationNote: 'El denominador no puede anularse.' },
        ],
        seed
      ),
    },
    {
      id: 'asintotas',
      label: 'Asíntotas',
      maxPoints: 0.25,
      prompt: '2) Halla tanto la Asíntota Vertical (A.V.) como la Horizontal (A.H.):',
      options: rotateOpts(
        { text: `A.V.: x = ${avStr}  |  A.H.: y = ${ahStr}`, explanationNote: `A.V. de ${denStr}=0 y A.H. = ${a}/${c}.` },
        [
          { text: `A.V.: x = ${ahStr}  |  A.H.: y = ${avStr}`, explanationNote: 'Están intercambiadas vertical y horizontal.' },
          { text: `A.V.: x = ${simplifyFrac(d, c)}  |  A.H.: y = ${ahStr}`, explanationNote: 'Error de signo al despejar la A.V.' },
          { text: `A.V.: x = ${avStr}  |  A.H.: y = 0`, explanationNote: 'Al tener igual grado, la A.H. es el cociente de coeficientes principales.' },
        ],
        seed + 1
      ),
    },
    {
      id: 'ceros',
      label: 'Ceros - Raíces o P.C. Ejes',
      maxPoints: 1.0,
      prompt: '3) Calcula exactamente los cortes con Eje X y Eje Y:',
      options: rotateOpts(
        {
          text: `Corte X (Raíz): (${rootStr}, 0)  |  Corte Y: (0, ${cutYStr})`,
          explanationNote: `${numStr} = 0 ⇒ x = ${rootStr}; evaluando x = 0 ⇒ ${b}/${d} = ${cutYStr}.`,
        },
        [
          {
            text: `Corte X: (${avStr}, 0)  |  Corte Y: (0, ${ahStr})`,
            explanationNote: 'Las asíntotas no son puntos de corte con los ejes.',
          },
          {
            text: `Corte X: (${simplifyFrac(b, a)}, 0)  |  Corte Y: (0, ${cutYStr})`,
            explanationNote: 'Error de signo al igualar el numerador a cero.',
          },
          {
            text: `Corte X: (0, ${cutYStr})  |  Corte Y: (${rootStr}, 0)`,
            explanationNote: 'Invertiste las coordenadas de corte X y corte Y.',
          },
        ],
        seed + 2
      ),
    },
    {
      id: 'rango',
      label: 'Rango',
      maxPoints: 0.25,
      prompt: '4) Determina el Rango de la función homográfica:',
      options: rotateOpts(
        { text: `Ran = ℝ \\ {${ahStr}}`, explanationNote: `Excluye únicamente la asíntota horizontal y = ${ahStr}.` },
        [
          { text: `Ran = ℝ \\ {${avStr}}`, explanationNote: `${avStr} pertenece al dominio, no al rango.` },
          { text: 'Ran = ℝ = (-∞, +∞)', explanationNote: `Nunca alcanza el valor y = ${ahStr}.` },
          { text: `Ran = (${ahStr}, +∞)`, explanationNote: 'La hipérbola tiene ramas por encima y por debajo de la A.H.' },
        ],
        seed + 3
      ),
    },
    {
      id: 'intervalos',
      label: 'Intervalos de C⁺ y C⁻',
      maxPoints: 0.25,
      prompt: '5) Analizando signos en la recta real, halla C⁺ y C⁻:',
      options: rotateOpts(
        {
          text: `C⁺ = ${cPos}  |  C⁻ = ${cNeg}`,
          explanationNote: `Los puntos críticos ${minStr} y ${maxStr} dividen la recta en tres intervalos de signo alternado.`,
        },
        [
          {
            text: `C⁺ = ${cNeg}  |  C⁻ = ${cPos}`,
            explanationNote: 'Verifica el signo evaluando un punto prueba como x = 0 o x = 10.',
          },
          {
            text: `C⁺ = (${maxStr}, +∞)  |  C⁻ = (-∞, ${maxStr})`,
            explanationNote: 'Debes considerar también la asíntota vertical donde el denominador cambia de signo.',
          },
          {
            text: `C⁺ = [${minStr}, ${maxStr}]  |  C⁻ = ℝ`,
            explanationNote: 'C⁺ y C⁻ llevan intervalos abiertos.',
          },
        ],
        seed + 1
      ),
    },
    {
      id: 'grafica',
      label: 'Gráfica',
      maxPoints: 0.5,
      prompt: '6) Selecciona la descripción gráfica correcta:',
      options: rotateOpts(
        {
          text: `Hipérbola con dos ramas asintóticas a x = ${avStr} y y = ${ahStr}, cruzando los ejes en (${rootStr}, 0) y (0, ${cutYStr}).`,
          explanationNote: 'Captura las dos ramas, las dos asíntotas y ambos cortes.',
        },
        [
          {
            text: `Recta oblicua con un hueco aislado en x = ${avStr}.`,
            explanationNote: 'Al no simplificarse factores, existe una asíntota vertical real, no un hueco.',
          },
          {
            text: `Curva única creciente sin asíntota horizontal que cruza x = ${avStr}.`,
            explanationNote: 'Ninguna curva puede cruzar su asíntota vertical.',
          },
          {
            text: `Parábola centrada en (${avStr}, ${ahStr}).`,
            explanationNote: 'Es una función homográfica (hipérbola), no cuadrática.',
          },
        ],
        seed + 2
      ),
    },
  ];

  return {
    id: `exc_${slot === '15:00' ? '15' : '18'}_${idx}`,
    slot,
    slotName: slot === '15:00' ? `Reto 15h00 #${idx}` : `Reto 18h00 #${idx}`,
    title: `Análisis y Gráfica Racional: ${name}(x)`,
    topic: 'integral',
    functionFormula: formula,
    functionType: 'Racional',
    domain: `ℝ \\ {${avStr}}`,
    range: `ℝ \\ {${ahStr}}`,
    asymptotesLabel: `A.V.: x = ${avStr} | A.H.: y = ${ahStr}`,
    zerosAndIntercepts: `Corte X: (${rootStr}, 0) | Corte Y: (0, ${cutYStr})`,
    positivityInterval: cPos,
    negativityInterval: cNeg,
    prompt: `Analice y grafique detalladamente la función racional ${formula} completando los 6 criterios de la rúbrica (2,50 Puntos).`,
    rubricSteps,
    stepByStepSolution: {
      title: `Desarrollo Completo de ${formula}`,
      formulaBreakdown: `1) Dominio: ${denStr} ≠ 0 ⇒ x ≠ ${avStr}.\n2) Asíntotas: A.V. x = ${avStr}; A.H. y = ${a}/${c} = ${ahStr}.`,
      domainExplanation: `Dom(${name}) = ℝ \\ {${avStr}}.`,
      rangeExplanation: `Ran(${name}) = ℝ \\ {${ahStr}}.`,
      interceptsExplanation: `Corte X: ${numStr} = 0 ⇒ x = ${rootStr} ⇒ (${rootStr}, 0). Corte Y: ${name}(0) = ${cutYStr} ⇒ (0, ${cutYStr}).`,
      graphObservation: `Tabla de signos con puntos críticos ${minStr} y ${maxStr}: C⁺ = ${cPos}, C⁻ = ${cNeg}.`,
      pedagogicalTip: 'En funciones racionales homográficas, tanto la raíz del numerador como la del denominador cambian el signo de la fracción.',
    },
    graphConfig: {
      xMin: Math.floor(minCrit) - 5,
      xMax: Math.ceil(maxCrit) + 5,
      yMin: Math.floor(ah) - 5,
      yMax: Math.ceil(ah) + 5,
      asymptotes: { vertical: [av], horizontal: [ah] },
      evalFunctionCode: `(${a} * x + (${b})) / (${c} * x + (${d}))`,
      keyPoints: [
        { x: rootX, y: 0, label: `(${rootStr}, 0)`, color: '#059669', type: 'x-intercept' },
        { x: 0, y: cutYNum, label: `(0, ${cutYStr})`, color: '#0D47A1', type: 'y-intercept' },
      ],
    },
    baseXp: 65,
    doubleXp: 130,
    participationPoints: 2,
    tip: 'Ubica raíz y asíntota vertical en la recta numérica para construir la tabla de signos.',
  };
}

interface AbsSpec {
  name: string;
  a: number;
  h: number;
  k: number;
  slot: '15:00' | '18:00';
}

function buildAbsChallenge(spec: AbsSpec, idx: number, seed: number): ExclusiveChallenge {
  const { name, a, h, k, slot } = spec;
  const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`;
  const inner = h >= 0 ? `x - ${h}` : `x + ${Math.abs(h)}`;
  const formula = `${name}(x) = ${aStr}|${inner}| ${fmtSigned(k)}`;
  const ranStr = a > 0 ? `[${k}, +∞)` : `(-∞, ${k}]`;
  const cutY = a * Math.abs(-h) + k;
  const hasRoots = a * k <= 0;
  const delta = hasRoots ? Math.abs(k / a) : 0;
  const x1 = h - delta;
  const x2 = h + delta;
  const rootsLabel = !hasRoots
    ? 'No corta al eje X (∅)'
    : delta === 0
    ? `(${h}, 0)`
    : `(${x1}, 0) y (${x2}, 0)`;

  const cPos = !hasRoots
    ? a > 0
      ? 'ℝ = (-∞, +∞)'
      : '∅'
    : a > 0
    ? `(-∞, ${x1}) ∪ (${x2}, +∞)`
    : `(${x1}, ${x2})`;
  const cNeg = !hasRoots
    ? a > 0
      ? '∅'
      : 'ℝ = (-∞, +∞)'
    : a > 0
    ? `(${x1}, ${x2})`
    : `(-∞, ${x1}) ∪ (${x2}, +∞)`;

  const rubricSteps: RubricStep[] = [
    {
      id: 'dominio',
      label: 'Dominio',
      maxPoints: 0.25,
      prompt: '1) Determina el Dominio de la función valor absoluto:',
      options: rotateOpts(
        { text: 'Dom = ℝ = (-∞, +∞)', explanationNote: 'El valor absoluto admite cualquier número real.' },
        [
          { text: `Dom = [${h}, +∞)`, explanationNote: 'x puede tomar valores menores a ' + h + '.' },
          { text: `Dom = [${k}, +∞)`, explanationNote: 'Confundiste dominio con rango.' },
          { text: `Dom = ℝ \\ {${h}}`, explanationNote: 'En x = ' + h + ' la función existe perfectamente y vale ' + k + '.' },
        ],
        seed
      ),
    },
    {
      id: 'asintotas',
      label: 'Asíntotas',
      maxPoints: 0.25,
      prompt: '2) ¿Posee asíntotas esta función?',
      options: rotateOpts(
        { text: 'No posee asíntotas (es continua en forma de V)', explanationNote: 'Las funciones valor absoluto no tienen asíntotas.' },
        [
          { text: `A.V.: x = ${h}`, explanationNote: `x = ${h} es el eje de simetría de la V, no una asíntota.` },
          { text: `A.H.: y = ${k}`, explanationNote: `y = ${k} es la ordenada del vértice, la gráfica sí toca (${h}, ${k}).` },
          { text: `A.V.: x = ${h} | A.H.: y = ${k}`, explanationNote: 'No es una función racional.' },
        ],
        seed + 1
      ),
    },
    {
      id: 'ceros',
      label: 'Ceros - Raíces o P.C. Ejes',
      maxPoints: 1.0,
      prompt: '3) Determina el vértice y los cortes exactos con Eje X y Eje Y:',
      options: rotateOpts(
        {
          text: `Cortes X: ${rootsLabel}  |  Corte Y: (0, ${cutY})  |  Vértice: (${h}, ${k})`,
          explanationNote: `Vértice en (${h}, ${k}) y ${name}(0) = ${cutY}.`,
        },
        [
          {
            text: `Cortes X: (${h}, 0)  |  Corte Y: (0, ${k})`,
            explanationNote: 'El vértice no está sobre los ejes a menos que k=0 o h=0.',
          },
          {
            text: `Cortes X: (${h - 1}, 0) y (${h + 1}, 0)  |  Corte Y: (0, ${k - h})`,
            explanationNote: 'Olvidaste que |x - h| siempre arroja resultados no negativos.',
          },
          {
            text: `Cortes X: (0, ${cutY})  |  Corte Y: (${h}, ${k})`,
            explanationNote: 'Los ejes de corte están mal identificados.',
          },
        ],
        seed + 2
      ),
    },
    {
      id: 'rango',
      label: 'Rango',
      maxPoints: 0.25,
      prompt: '4) Determina el Rango exacto:',
      options: rotateOpts(
        { text: `Ran = ${ranStr}`, explanationNote: `Vértice en y = ${k} y abre hacia ${a > 0 ? 'arriba' : 'abajo'}.` },
        [
          { text: `Ran = (${k}, +∞)`, explanationNote: 'El punto vértice sí pertenece a la gráfica, debe ser corchete cerrado [ ].' },
          { text: `Ran = ${a > 0 ? `(-∞, ${k}]` : `[${k}, +∞)`}`, explanationNote: 'Invertiste la dirección de apertura de la V.' },
          { text: 'Ran = ℝ = (-∞, +∞)', explanationNote: 'El valor absoluto siempre está acotado por su vértice.' },
        ],
        seed + 3
      ),
    },
    {
      id: 'intervalos',
      label: 'Intervalos de C⁺ y C⁻',
      maxPoints: 0.25,
      prompt: '5) Indica los intervalos de positividad (C⁺) y negatividad (C⁻):',
      options: rotateOpts(
        {
          text: `C⁺ = ${cPos}  |  C⁻ = ${cNeg}`,
          explanationNote: !hasRoots
            ? a > 0
              ? 'Toda la gráfica está sobre el eje X, por eso siempre es positiva.'
              : 'Toda la gráfica está debajo del eje X.'
            : `Cambia de signo en las raíces ${x1} y ${x2}.`,
        },
        [
          {
            text: `C⁺ = (${h}, +∞)  |  C⁻ = (-∞, ${h})`,
            explanationNote: 'Confundiste el eje de simetría con un cambio de signo.',
          },
          {
            text: `C⁺ = ${cNeg}  |  C⁻ = ${cPos}`,
            explanationNote: 'Los signos de C⁺ y C⁻ están invertidos.',
          },
          {
            text: `C⁺ = [${k}, +∞)  |  C⁻ = ∅`,
            explanationNote: 'Los intervalos C⁺ y C⁻ se leen en el eje X (dominio), no en el rango.',
          },
        ],
        seed + 1
      ),
    },
    {
      id: 'grafica',
      label: 'Gráfica',
      maxPoints: 0.5,
      prompt: '6) Elige la descripción gráfica fiel:',
      options: rotateOpts(
        {
          text: `Gráfica en forma de V abierta hacia ${a > 0 ? 'arriba' : 'abajo'} con vértice en (${h}, ${k}) y corte Y en (0, ${cutY}).`,
          explanationNote: 'Correcto: dos semirrectas simétricas respecto a x = ' + h,
        },
        [
          {
            text: `Parábola curva suave con vértice en (${-h}, ${k}).`,
            explanationNote: 'El valor absoluto forma esquina aguda (V), no parábola curva, y h tiene signo correcto.',
          },
          {
            text: `Recta continua con pendiente ${a} sin cambio de dirección.`,
            explanationNote: 'Las barras | | reflejan una rama creando un quiebre en x = ' + h,
          },
          {
            text: `Hipérbola con asíntota vertical en x = ${h}.`,
            explanationNote: 'No tiene divisiones ni asíntotas.',
          },
        ],
        seed + 2
      ),
    },
  ];

  return {
    id: `exc_${slot === '15:00' ? '15' : '18'}_${idx}`,
    slot,
    slotName: slot === '15:00' ? `Reto 15h00 #${idx}` : `Reto 18h00 #${idx}`,
    title: `Análisis y Gráfica Valor Absoluto: ${name}(x)`,
    topic: 'integral',
    functionFormula: formula,
    functionType: 'Valor Absoluto',
    domain: 'ℝ = (-∞, +∞)',
    range: ranStr,
    asymptotesLabel: 'No posee asíntotas',
    zerosAndIntercepts: `Cortes X: ${rootsLabel} | Corte Y: (0, ${cutY})`,
    positivityInterval: cPos,
    negativityInterval: cNeg,
    prompt: `Analice y grafique detalladamente la función ${formula} completando los 6 criterios de la rúbrica (2,50 Puntos).`,
    rubricSteps,
    stepByStepSolution: {
      title: `Desarrollo Completo de ${formula}`,
      formulaBreakdown: `1) Dominio: ℝ.\n2) Vértice: ${inner} = 0 ⇒ x = ${h}, y = ${k} ⇒ V(${h}, ${k}).\n3) Como a = ${a} ${a > 0 ? '> 0 abre hacia arriba' : '< 0 abre hacia abajo'}.`,
      domainExplanation: 'Dom = ℝ.',
      rangeExplanation: `Ran = ${ranStr}.`,
      interceptsExplanation: `Corte Y: ${name}(0) = ${a}|${-h}| ${fmtSigned(k)} = ${cutY}. Corte X: ${rootsLabel}.`,
      graphObservation: `C⁺ = ${cPos}; C⁻ = ${cNeg}.`,
      pedagogicalTip: 'Recuerda: C⁺ y C⁻ siempre son intervalos sobre el eje X, jamás sobre el eje Y.',
    },
    graphConfig: {
      xMin: Math.min(-2, h - 6),
      xMax: h + 6,
      yMin: a > 0 ? Math.min(-2, k - 3) : k - 7,
      yMax: a > 0 ? Math.max(cutY + 2, k + 7) : Math.max(3, k + 3),
      evalFunctionCode: `${a} * Math.abs(x - (${h})) + (${k})`,
      keyPoints: [
        { x: h, y: k, label: `V(${h}, ${k})`, color: '#D97706', type: 'vertex' },
        { x: 0, y: cutY, label: `(0, ${cutY})`, color: '#0D47A1', type: 'y-intercept' },
      ],
    },
    baseXp: 60,
    doubleXp: 120,
    participationPoints: 2,
    tip: 'Si |x - h| + k = 0 exige |x - h| = -k < 0, entonces no hay raíces reales.',
  };
}

// =========================================================================
// 15 RETOS VESPERTINOS (15h00 pm) - Incluye los 4 modelos exactos de la imagen
// =========================================================================
const CHALLENGES_15_00: ExclusiveChallenge[] = [
  // Exact 4 exercises from user's attached image (image_3648547e.png):
  buildExponentialChallenge({ name: 'g', base: 6, p: 2, q: 2, k: -4, slot: '15:00' }, 1, 0),
  buildLogChallenge({ name: 'h', base: 6, a: 5, b: -3, slot: '15:00' }, 2, 1),
  buildRationalChallenge({ name: 'f', a: 2, b: 6, c: 1, d: 4, slot: '15:00' }, 3, 2),
  buildAbsChallenge({ name: 'l', a: 1, h: 6, k: 5, slot: '15:00' }, 4, 3),

  // 11 more non-trivial variations for 15:00 slot (total 15)
  buildExponentialChallenge({ name: 'g', base: 3, p: 2, q: 1, k: -9, slot: '15:00' }, 5, 1),
  buildLogChallenge({ name: 'h', base: 2, a: 3, b: -5, slot: '15:00' }, 6, 2),
  buildRationalChallenge({ name: 'f', a: 3, b: -6, c: 1, d: 2, slot: '15:00' }, 7, 3),
  buildAbsChallenge({ name: 'l', a: 1, h: 4, k: -3, slot: '15:00' }, 8, 0),
  buildExponentialChallenge({ name: 'g', base: 2, p: 3, q: 1, k: -4, slot: '15:00' }, 9, 2),
  buildLogChallenge({ name: 'h', base: 5, a: 4, b: -7, slot: '15:00' }, 10, 3),
  buildRationalChallenge({ name: 'f', a: -2, b: 8, c: 1, d: 3, slot: '15:00' }, 11, 0),
  buildAbsChallenge({ name: 'l', a: -1, h: 3, k: 4, slot: '15:00' }, 12, 1),
  buildExponentialChallenge({ name: 'g', base: 5, p: 2, q: 2, k: -5, slot: '15:00' }, 13, 3),
  buildLogChallenge({ name: 'h', base: 3, a: 2, b: -7, slot: '15:00' }, 14, 0),
  buildRationalChallenge({ name: 'f', a: 4, b: 8, c: 1, d: -3, slot: '15:00' }, 15, 1),
];

// =========================================================================
// 15 RETOS CREPUSCULARES (18h00 pm) - 15 ejercicios profundos adicionales
// =========================================================================
const CHALLENGES_18_00: ExclusiveChallenge[] = [
  buildExponentialChallenge({ name: 'g', base: 4, p: 2, q: 1, k: -16, slot: '18:00' }, 1, 1),
  buildLogChallenge({ name: 'h', base: 4, a: 3, b: -2, slot: '18:00' }, 2, 2),
  buildRationalChallenge({ name: 'f', a: 3, b: 9, c: 1, d: -2, slot: '18:00' }, 3, 3),
  buildAbsChallenge({ name: 'l', a: 2, h: 5, k: 3, slot: '18:00' }, 4, 0),
  buildExponentialChallenge({ name: 'g', base: 2, p: 2, q: 3, k: -8, slot: '18:00' }, 5, 2),
  buildLogChallenge({ name: 'h', base: 6, a: 2, b: -7, slot: '18:00' }, 6, 3),
  buildRationalChallenge({ name: 'f', a: 5, b: -10, c: 1, d: 4, slot: '18:00' }, 7, 0),
  buildAbsChallenge({ name: 'l', a: 1, h: -3, k: -4, slot: '18:00' }, 8, 1),
  buildExponentialChallenge({ name: 'g', base: 3, p: 3, q: 1, k: -3, slot: '18:00' }, 9, 3),
  buildLogChallenge({ name: 'h', base: 2, a: 5, b: -4, slot: '18:00' }, 10, 0),
  buildRationalChallenge({ name: 'f', a: -3, b: 12, c: 1, d: 2, slot: '18:00' }, 11, 1),
  buildAbsChallenge({ name: 'l', a: -2, h: 4, k: 6, slot: '18:00' }, 12, 2),
  buildExponentialChallenge({ name: 'g', base: 6, p: 1, q: 2, k: -6, slot: '18:00' }, 13, 0),
  buildLogChallenge({ name: 'h', base: 5, a: 3, b: -8, slot: '18:00' }, 14, 1),
  buildRationalChallenge({ name: 'f', a: 4, b: -12, c: 2, d: 4, slot: '18:00' }, 15, 2),
];

export const EXCLUSIVE_CHALLENGES: ExclusiveChallenge[] = [
  ...CHALLENGES_15_00,
  ...CHALLENGES_18_00,
];
