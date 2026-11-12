import React, { useState, useMemo } from 'react';
import { FunctionCategory, GraphConfig, KeyPoint } from '../types';
import { FunctionPlotter } from './FunctionPlotter';
import { Sliders, RotateCcw, Table, Eye, Sparkles, Repeat, GitMerge } from 'lucide-react';
import { sound } from '../utils/audio';

export const FunctionLab: React.FC = () => {
  const [selectedType, setSelectedType] = useState<FunctionCategory>('Lineal');

  // Sliders parameters
  // Linear / Inversa: f(x) = m*x + b
  const [m, setM] = useState<number>(2);
  const [b, setB] = useState<number>(-4);

  // Quadratic: f(x) = a*x^2 + bQuad*x + c
  const [aQuad, setAQuad] = useState<number>(1);
  const [bQuad, setBQuad] = useState<number>(-2);
  const [cQuad, setCQuad] = useState<number>(-3);

  // Rational: f(x) = k / (x - cRat) + dRat
  const [kRat, setKRat] = useState<number>(2);
  const [cRat, setCRat] = useState<number>(1);
  const [dRat, setDRat] = useState<number>(0);

  // Radical: f(x) = aRad * sqrt(x - hRad) + kRad
  const [aRad, setARad] = useState<number>(1);
  const [hRad, setHRad] = useState<number>(-2);
  const [kRad, setKRad] = useState<number>(0);

  // Composition: f(x) = aComp * x + bComp, g(x) = x^2 + cComp
  const [aComp, setAComp] = useState<number>(2);
  const [bComp, setBComp] = useState<number>(1);
  const [cComp, setCComp] = useState<number>(-2);

  // Active computed analysis
  const currentAnalysis = useMemo(() => {
    switch (selectedType) {
      case 'Inversa': {
        // f(x) = m*x + b  =>  f^-1(x) = (x - b) / m
        const formula = `f(x) = ${m !== 1 ? (m === -1 ? '-' : m) : ''}x ${b > 0 ? '+ ' + b : b < 0 ? '- ' + Math.abs(b) : ''}`.trim();
        const invFormula = m !== 0 ? `f⁻¹(x) = (x ${b > 0 ? '- ' + b : '+ ' + Math.abs(b)}) / ${m}` : 'No existe (no biyectiva)';
        const fixedPoint = m !== 1 && m !== 0 ? b / (1 - m) : null;

        const keyPoints: KeyPoint[] = [
          { x: 0, y: b, label: `f corte Y: (0, ${b})`, color: '#0D47A1', type: 'y-intercept' },
          { x: -b / m, y: 0, label: `f corte X: (${(-b / m).toFixed(1)}, 0)`, color: '#059669', type: 'x-intercept' },
          { x: b, y: 0, label: `f⁻¹ corte X: (${b}, 0)`, color: '#DC2626', type: 'reference' },
          { x: 0, y: -b / m, label: `f⁻¹ corte Y: (0, ${(-b / m).toFixed(1)})`, color: '#DC2626', type: 'reference' }
        ];

        if (fixedPoint !== null) {
          keyPoints.push({
            x: Number(fixedPoint.toFixed(1)),
            y: Number(fixedPoint.toFixed(1)),
            label: `Punto de corte común f = f⁻¹: (${fixedPoint.toFixed(1)}, ${fixedPoint.toFixed(1)})`,
            color: '#F59E0B',
            type: 'reference'
          });
        }

        return {
          formula,
          secondaryFormula: invFormula,
          type: 'Función Inversa con Espejo y = x',
          domain: 'Dom(f) = ℝ | Dom(f⁻¹) = ℝ',
          range: 'Ran(f) = ℝ | Ran(f⁻¹) = ℝ',
          xInt: `f: (${(-b / m).toFixed(1)}, 0) | f⁻¹: (${b}, 0)`,
          yInt: `f: (0, ${b}) | f⁻¹: (0, ${(-b / m).toFixed(1)})`,
          vertex: 'Simetría exacta sobre y = x',
          asymptotes: null,
          graphConfig: {
            xMin: -6,
            xMax: 6,
            yMin: -6,
            yMax: 6,
            evalFunctionCode: `${m} * x + ${b}`,
            secondaryEvalCode: m !== 0 ? `(x - (${b})) / ${m}` : undefined,
            secondaryLabel: 'f⁻¹(x) Inversa',
            showDiagonalSymmetry: true,
            keyPoints,
          } as GraphConfig,
          tableValues: [-2, -1, 0, 1, 2].map(v => ({
            x: v,
            y: Number((m * v + b).toFixed(1)),
            invY: m !== 0 ? Number(((v - b) / m).toFixed(1)) : 0
          }))
        };
      }

      case 'Compuesta': {
        // f(x) = aComp * x + bComp, g(x) = x^2 + cComp
        // (f ∘ g)(x) = aComp * (x^2 + cComp) + bComp = aComp*x^2 + (aComp*cComp + bComp)
        const kVertex = aComp * cComp + bComp;
        const formula = `f(x) = ${aComp}x + ${bComp},  g(x) = x² ${cComp >= 0 ? '+ ' + cComp : '- ' + Math.abs(cComp)}`;
        const compFormula = `(f ∘ g)(x) = ${aComp}x² ${kVertex >= 0 ? '+ ' + kVertex : '- ' + Math.abs(kVertex)}`;

        const keyPoints: KeyPoint[] = [
          { x: 0, y: kVertex, label: `Vértice (f∘g): (0, ${kVertex})`, color: '#0D47A1', type: 'vertex' },
          { x: 0, y: cComp, label: `Vértice g: (0, ${cComp})`, color: '#DC2626', type: 'reference' }
        ];

        return {
          formula,
          secondaryFormula: compFormula,
          type: 'Composición de Funciones (f ∘ g)',
          domain: 'Dom(f ∘ g) = ℝ',
          range: aComp > 0 ? `[${kVertex}, +∞)` : `(-∞, ${kVertex}]`,
          xInt: `Vértice en (0, ${kVertex})`,
          yInt: `(0, ${kVertex})`,
          vertex: `(0, ${kVertex})`,
          asymptotes: null,
          graphConfig: {
            xMin: -5,
            xMax: 5,
            yMin: -7,
            yMax: 9,
            evalFunctionCode: `${aComp} * (x * x + ${cComp}) + ${bComp}`,
            secondaryEvalCode: `x * x + ${cComp}`,
            secondaryLabel: 'g(x) interior',
            keyPoints,
          } as GraphConfig,
          tableValues: [-2, -1, 0, 1, 2].map(v => ({
            x: v,
            y: Number((aComp * (v * v + cComp) + bComp).toFixed(1)),
            invY: Number((v * v + cComp).toFixed(1))
          }))
        };
      }

      case 'Lineal':
      case 'Afín': {
        const formula = `f(x) = ${m !== 1 ? (m === -1 ? '-' : m) : ''}x ${b > 0 ? '+ ' + b : b < 0 ? '- ' + Math.abs(b) : ''}`.trim();
        const root = m !== 0 ? -b / m : null;
        const yInt = b;
        const keyPoints: KeyPoint[] = [
          { x: 0, y: yInt, label: `Corte Y: (0, ${yInt})`, color: '#0D47A1', type: 'y-intercept' },
        ];
        if (root !== null) {
          keyPoints.push({
            x: Number(root.toFixed(2)),
            y: 0,
            label: `Corte X: (${root.toFixed(2)}, 0)`,
            color: '#059669',
            type: 'x-intercept',
          });
        }
        return {
          formula,
          secondaryFormula: undefined,
          type: m === 0 ? 'Constante' : b === 0 ? 'Lineal pura' : 'Afín',
          domain: 'ℝ = (-∞, +∞)',
          range: m === 0 ? `{ ${b} }` : 'ℝ = (-∞, +∞)',
          xInt: root !== null ? `(${root.toFixed(2)}, 0)` : 'No tiene cortes',
          yInt: `(0, ${yInt})`,
          vertex: 'No aplica (es una recta)',
          asymptotes: null,
          graphConfig: {
            xMin: -6,
            xMax: 6,
            yMin: -8,
            yMax: 8,
            evalFunctionCode: `${m} * x + ${b}`,
            keyPoints,
          } as GraphConfig,
          tableValues: [-3, -2, -1, 0, 1, 2, 3].map((val) => ({
            x: val,
            y: Number((m * val + b).toFixed(2)),
          })),
        };
      }

      case 'Cuadrática': {
        const h = -bQuad / (2 * aQuad);
        const k = aQuad * h * h + bQuad * h + cQuad;
        const disc = bQuad * bQuad - 4 * aQuad * cQuad;
        let rootsStr = 'No tiene cortes reales (Δ < 0)';
        const keyPoints: KeyPoint[] = [
          { x: Number(h.toFixed(2)), y: Number(k.toFixed(2)), label: `Vértice: (${h.toFixed(2)}, ${k.toFixed(2)})`, color: '#F59E0B', type: 'vertex' },
          { x: 0, y: cQuad, label: `Corte Y: (0, ${cQuad})`, color: '#0D47A1', type: 'y-intercept' },
        ];

        if (disc > 0) {
          const r1 = (-bQuad - Math.sqrt(disc)) / (2 * aQuad);
          const r2 = (-bQuad + Math.sqrt(disc)) / (2 * aQuad);
          rootsStr = `(${r1.toFixed(2)}, 0) y (${r2.toFixed(2)}, 0)`;
          keyPoints.push(
            { x: Number(r1.toFixed(2)), y: 0, label: `Raíz 1: ${r1.toFixed(2)}`, color: '#059669', type: 'x-intercept' },
            { x: Number(r2.toFixed(2)), y: 0, label: `Raíz 2: ${r2.toFixed(2)}`, color: '#059669', type: 'x-intercept' }
          );
        } else if (disc === 0) {
          rootsStr = `(${h.toFixed(2)}, 0) [Tangente]`;
          keyPoints.push({ x: Number(h.toFixed(2)), y: 0, label: `Corte único: ${h.toFixed(2)}`, color: '#059669', type: 'x-intercept' });
        }

        const formula = `f(x) = ${aQuad !== 1 ? (aQuad === -1 ? '-' : aQuad) : ''}x² ${bQuad >= 0 ? '+ ' + bQuad : '- ' + Math.abs(bQuad)}x ${cQuad >= 0 ? '+ ' + cQuad : '- ' + Math.abs(cQuad)}`;
        const range = aQuad > 0 ? `[${k.toFixed(2)}, +∞)` : `(-∞, ${k.toFixed(2)}]`;

        return {
          formula,
          secondaryFormula: undefined,
          type: 'Cuadrática (Parábola)',
          domain: 'ℝ = (-∞, +∞)',
          range,
          xInt: rootsStr,
          yInt: `(0, ${cQuad})`,
          vertex: `(${h.toFixed(2)}, ${k.toFixed(2)}) [${aQuad > 0 ? 'Mínimo' : 'Máximo'}]`,
          asymptotes: null,
          graphConfig: {
            xMin: Math.min(-6, Math.floor(h - 4)),
            xMax: Math.max(6, Math.ceil(h + 4)),
            yMin: Math.min(-8, Math.floor(k - 4)),
            yMax: Math.max(8, Math.ceil(k + 4)),
            evalFunctionCode: `${aQuad} * x * x + ${bQuad} * x + ${cQuad}`,
            keyPoints,
          } as GraphConfig,
          tableValues: [-3, -2, -1, 0, 1, 2, 3].map((val) => ({
            x: val,
            y: Number((aQuad * val * val + bQuad * val + cQuad).toFixed(2)),
          })),
        };
      }

      default: {
        return {
          formula: 'f(x) = x',
          secondaryFormula: undefined,
          type: 'Lineal',
          domain: 'ℝ',
          range: 'ℝ',
          xInt: '(0, 0)',
          yInt: '(0, 0)',
          vertex: 'No aplica',
          asymptotes: null,
          graphConfig: {
            xMin: -5,
            xMax: 5,
            yMin: -5,
            yMax: 5,
            evalFunctionCode: 'x',
          } as GraphConfig,
          tableValues: [],
        };
      }
    }
  }, [selectedType, m, b, aQuad, bQuad, cQuad, kRat, cRat, dRat, aRad, hRad, kRad, aComp, bComp, cComp]);

  const handleReset = () => {
    sound.playClick();
    setM(2);
    setB(-4);
    setAQuad(1);
    setBQuad(-2);
    setCQuad(-3);
    setAComp(2);
    setBComp(1);
    setCComp(-2);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#0D47A1] text-white">
              <Sliders className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Laboratorio Gráfico: MATHFUNCIONES
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Experimenta en tiempo real con <strong>Composición (f ∘ g)</strong>, <strong>Función Inversa (f⁻¹)</strong>, Parábolas y Rectas observando el espejo diagonal y = x.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Function Type Selector (Including Composición and Inversa) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['Lineal', 'Cuadrática', 'Inversa', 'Compuesta'] as FunctionCategory[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              sound.playClick();
              setSelectedType(type);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === type
                ? 'bg-[#0D47A1] text-white shadow-sm ring-2 ring-[#0D47A1]/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {type === 'Inversa' && <Repeat className="w-3.5 h-3.5 text-amber-300" />}
            {type === 'Compuesta' && <GitMerge className="w-3.5 h-3.5 text-amber-300" />}
            <span>{type === 'Inversa' ? 'Función Inversa (f⁻¹)' : type === 'Compuesta' ? 'Composición (f ∘ g)' : type}</span>
          </button>
        ))}
      </div>

      {/* Two-Zone Sandbox Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Sliders & Analysis (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Controles de Parámetros
            </h3>

            {/* Inversa Sliders */}
            {selectedType === 'Inversa' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Pendiente de f (m):</span>
                    <span className="font-mono text-[#0D47A1] dark:text-blue-400 font-bold">{m}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.5"
                    value={m}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setM(v === 0 ? 0.5 : v);
                    }}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">
                    La pendiente de la inversa f⁻¹ será 1/m = {(1/m).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Corte Y de f (b):</span>
                    <span className="font-mono text-[#0D47A1] dark:text-blue-400 font-bold">{b}</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={b}
                    onChange={(e) => setB(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">
                    Corte X de la inversa f⁻¹ reflejado en ({b}, 0)
                  </div>
                </div>
              </div>
            )}

            {/* Composición Sliders */}
            {selectedType === 'Compuesta' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Pendiente de f exterior (a):</span>
                    <span className="font-mono text-[#0D47A1] font-bold">{aComp}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={aComp}
                    onChange={(e) => setAComp(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Desplazamiento de g interior (c):</span>
                    <span className="font-mono text-[#DC2626] font-bold">{cComp}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="1"
                    value={cComp}
                    onChange={(e) => setCComp(parseFloat(e.target.value))}
                    className="w-full accent-[#DC2626] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Lineal / Cuadrática */}
            {(selectedType === 'Lineal' || selectedType === 'Afín') && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Pendiente (m):</span>
                    <span className="font-mono text-[#0D47A1] font-bold">{m}</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={m}
                    onChange={(e) => setM(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Ordenada al origen (b):</span>
                    <span className="font-mono text-[#0D47A1] font-bold">{b}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={b}
                    onChange={(e) => setB(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {selectedType === 'Cuadrática' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Coeficiente cuadrático (a):</span>
                    <span className="font-mono text-[#F59E0B] font-bold">{aQuad}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.5"
                    value={aQuad}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setAQuad(v === 0 ? 0.5 : v);
                    }}
                    className="w-full accent-[#F59E0B] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Coeficiente lineal (b):</span>
                    <span className="font-mono font-bold">{bQuad}</span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={bQuad}
                    onChange={(e) => setBQuad(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Término c:</span>
                    <span className="font-mono font-bold">{cQuad}</span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={cQuad}
                    onChange={(e) => setCQuad(parseFloat(e.target.value))}
                    className="w-full accent-[#0D47A1] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Math Specs Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-500">
              Propiedades Analíticas
            </h3>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Dominio:</span>
              <span className="font-math font-bold text-slate-900 dark:text-white">{currentAnalysis.domain}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Rango:</span>
              <span className="font-math font-bold text-slate-900 dark:text-white">{currentAnalysis.range}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Cortes con Ejes:</span>
              <span className="font-math font-bold text-[#0D47A1] dark:text-blue-400">{currentAnalysis.xInt}</span>
            </div>
          </div>
        </div>

        {/* Right Zone: Graph Stage & Values (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {currentAnalysis.type}
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0D47A1] dark:text-blue-400 font-math">
              {currentAnalysis.formula}
            </div>
            {currentAnalysis.secondaryFormula && (
              <div className="text-sm sm:text-base font-bold text-[#DC2626] dark:text-rose-400 font-math">
                {currentAnalysis.secondaryFormula}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FunctionPlotter
              config={currentAnalysis.graphConfig}
              height={320}
              interactive={true}
              title={`Gráfico Interactivo: ${currentAnalysis.type}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
