import React, { useMemo, useState } from 'react';
import { GraphConfig } from '../types';

interface FunctionPlotterProps {
  config: GraphConfig;
  title?: string;
  height?: number;
  interactive?: boolean;
}

export const FunctionPlotter: React.FC<FunctionPlotterProps> = ({
  config,
  title,
  height = 320,
  interactive = true,
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; pixelX: number; pixelY: number } | null>(null);

  const { 
    xMin, 
    xMax, 
    yMin, 
    yMax, 
    evalFunctionCode, 
    secondaryEvalCode, 
    secondaryLabel,
    showDiagonalSymmetry,
    asymptotes, 
    keyPoints 
  } = config;

  // SVG dimensions
  const width = 500;
  const padding = 36;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // Coordinate transforms
  const toPixelX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toPixelY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * plotHeight;
  const toMathX = (px: number) => xMin + ((px - padding) / plotWidth) * (xMax - xMin);
  const toMathY = (py: number) => yMin + ((height - padding - py) / plotHeight) * (yMax - yMin);

  // Compile primary evaluator safely
  const evalFunc = useMemo(() => {
    try {
      const fn = new Function('x', 'Math', `
        try {
          return ${evalFunctionCode};
        } catch (e) {
          return null;
        }
      `);
      return (x: number) => {
        const val = fn(x, Math);
        return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : null;
      };
    } catch {
      return () => null;
    }
  }, [evalFunctionCode]);

  // Compile secondary evaluator safely (for inverse or g(x))
  const evalSecondaryFunc = useMemo(() => {
    if (!secondaryEvalCode) return null;
    try {
      const fn = new Function('x', 'Math', `
        try {
          return ${secondaryEvalCode};
        } catch (e) {
          return null;
        }
      `);
      return (x: number) => {
        const val = fn(x, Math);
        return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : null;
      };
    } catch {
      return null;
    }
  }, [secondaryEvalCode]);

  // Generate SVG path segments helper
  const createPathSegments = (evaluator: (x: number) => number | null) => {
    const steps = 300;
    const dx = (xMax - xMin) / steps;
    const segments: string[] = [];
    let currentSegment = '';

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = evaluator(x);

      if (y !== null && y >= yMin - 15 && y <= yMax + 15) {
        const px = toPixelX(x);
        const py = toPixelY(y);

        if (!currentSegment) {
          currentSegment = `M ${px.toFixed(1)} ${py.toFixed(1)}`;
        } else {
          const prevX = xMin + (i - 1) * dx;
          const prevY = evaluator(prevX);
          if (prevY !== null && Math.abs(y - prevY) > (yMax - yMin) * 0.85) {
            segments.push(currentSegment);
            currentSegment = `M ${px.toFixed(1)} ${py.toFixed(1)}`;
          } else {
            currentSegment += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
          }
        }
      } else {
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = '';
        }
      }
    }
    if (currentSegment) {
      segments.push(currentSegment);
    }
    return segments;
  };

  const primarySegments = useMemo(() => createPathSegments(evalFunc), [evalFunc, xMin, xMax, yMin, yMax]);
  const secondarySegments = useMemo(() => evalSecondaryFunc ? createPathSegments(evalSecondaryFunc) : [], [evalSecondaryFunc, xMin, xMax, yMin, yMax]);

  // Axis lines
  const originX = toPixelX(0);
  const originY = toPixelY(0);

  // Tick generators
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.max(1, Math.round((xMax - xMin) / 8));
    const start = Math.ceil(xMin / step) * step;
    for (let t = start; t <= xMax; t += step) {
      if (t !== 0) ticks.push(t);
    }
    return ticks;
  }, [xMin, xMax]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.max(1, Math.round((yMax - yMin) / 6));
    const start = Math.ceil(yMin / step) * step;
    for (let t = start; t <= yMax; t += step) {
      if (t !== 0) ticks.push(t);
    }
    return ticks;
  }, [yMin, yMax]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    if (svgX >= padding && svgX <= width - padding) {
      const mathX = Number(toMathX(svgX).toFixed(2));
      const mathYVal = evalFunc(mathX);
      if (mathYVal !== null && mathYVal >= yMin && mathYVal <= yMax) {
        setHoverCoord({
          x: mathX,
          y: Number(mathYVal.toFixed(2)),
          pixelX: toPixelX(mathX),
          pixelY: toPixelY(mathYVal),
        });
        return;
      }
    }
    setHoverCoord(null);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>{title}</span>
          <span className="font-mono text-[11px] text-slate-500">Cartesiano (X, Y)</span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoord(null)}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800/60" strokeWidth="1" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
          </marker>
        </defs>

        {/* Background Grid */}
        <rect x={padding} y={padding} width={plotWidth} height={plotHeight} fill="url(#grid)" />

        {/* Diagonal Line of Symmetry y = x for Inverses */}
        {showDiagonalSymmetry && (
          <g>
            <line
              x1={toPixelX(Math.max(xMin, yMin))}
              y1={toPixelY(Math.max(xMin, yMin))}
              x2={toPixelX(Math.min(xMax, yMax))}
              y2={toPixelY(Math.min(xMax, yMax))}
              stroke="#F59E0B"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x={toPixelX(Math.min(xMax, yMax)) - 35}
              y={toPixelY(Math.min(xMax, yMax)) + 14}
              fill="#D97706"
              fontSize="9"
              fontWeight="bold"
            >
              y = x (Espejo)
            </text>
          </g>
        )}

        {/* Coordinate Axes */}
        {/* X Axis */}
        {originY >= padding && originY <= height - padding && (
          <g>
            <line
              x1={padding - 10}
              y1={originY}
              x2={width - padding + 15}
              y2={originY}
              stroke="#64748B"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
            <text x={width - padding + 18} y={originY + 4} fill="#475569" fontSize="11" fontWeight="600" fontFamily="sans-serif">
              X
            </text>
          </g>
        )}

        {/* Y Axis */}
        {originX >= padding && originX <= width - padding && (
          <g>
            <line
              x1={originX}
              y1={height - padding + 10}
              x2={originX}
              y2={padding - 15}
              stroke="#64748B"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
            <text x={originX - 4} y={padding - 18} fill="#475569" fontSize="11" fontWeight="600" fontFamily="sans-serif" textAnchor="middle">
              Y
            </text>
          </g>
        )}

        {/* Ticks & Labels on X Axis */}
        {xTicks.map((t) => {
          const px = toPixelX(t);
          const py = Math.min(Math.max(originY, padding + 10), height - padding);
          return (
            <g key={`xtick-${t}`}>
              <line x1={px} y1={py - 3} x2={px} y2={py + 3} stroke="#94A3B8" strokeWidth="1" />
              <text x={px} y={py + 13} fill="#64748B" fontSize="9" textAnchor="middle" className="font-mono">
                {t}
              </text>
            </g>
          );
        })}

        {/* Ticks & Labels on Y Axis */}
        {yTicks.map((t) => {
          const py = toPixelY(t);
          const px = Math.min(Math.max(originX, padding), width - padding - 15);
          return (
            <g key={`ytick-${t}`}>
              <line x1={px - 3} y1={py} x2={px + 3} y2={py} stroke="#94A3B8" strokeWidth="1" />
              <text x={px - 7} y={py + 3} fill="#64748B" fontSize="9" textAnchor="end" className="font-mono">
                {t}
              </text>
            </g>
          );
        })}

        {/* Origin Label (0,0) */}
        {originX >= padding && originX <= width - padding && originY >= padding && originY <= height - padding && (
          <text x={originX - 7} y={originY + 12} fill="#94A3B8" fontSize="9" className="font-mono">
            0
          </text>
        )}

        {/* Asymptotes */}
        {asymptotes?.vertical?.map((vx, idx) => {
          const px = toPixelX(vx);
          return (
            <g key={`vasymp-${idx}`}>
              <line
                x1={px}
                y1={padding}
                x2={px}
                y2={height - padding}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={px + 4} y={padding + 14} fill="#DC2626" fontSize="9" fontWeight="bold">
                x = {vx}
              </text>
            </g>
          );
        })}

        {asymptotes?.horizontal?.map((hy, idx) => {
          const py = toPixelY(hy);
          return (
            <g key={`hasymp-${idx}`}>
              <line
                x1={padding}
                y1={py}
                x2={width - padding}
                y2={py}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={width - padding - 28} y={py - 4} fill="#DC2626" fontSize="9" fontWeight="bold">
                y = {hy}
              </text>
            </g>
          );
        })}

        {/* Secondary Curve (Inverse f^-1 or g(x)) */}
        {secondarySegments.map((d, idx) => (
          <path
            key={`sec-seg-${idx}`}
            d={d}
            fill="none"
            stroke="#DC2626"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Main Function Curve (Royal Blue #0D47A1) */}
        {primarySegments.map((d, idx) => (
          <path
            key={`segment-${idx}`}
            d={d}
            fill="none"
            stroke="#0D47A1"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Key Points (Intercepts, Vertex, Roots) */}
        {keyPoints?.map((pt, idx) => {
          const px = toPixelX(pt.x);
          const py = toPixelY(pt.y);
          if (px < padding || px > width - padding || py < padding || py > height - padding) {
            return null;
          }
          return (
            <g key={`pt-${idx}`}>
              <circle cx={px} cy={py} r="5" fill={pt.color} stroke="#FFFFFF" strokeWidth="2" />
              <rect
                x={px + 6}
                y={py - 14}
                width={pt.label.length * 6 + 12}
                height="16"
                rx="3"
                fill="rgba(15, 23, 42, 0.85)"
              />
              <text x={px + 12} y={py - 3} fill="#FFFFFF" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                {pt.label}
              </text>
            </g>
          );
        })}

        {/* Hover Coordinate Crosshair */}
        {hoverCoord && (
          <g>
            <line
              x1={hoverCoord.pixelX}
              y1={padding}
              x2={hoverCoord.pixelX}
              y2={height - padding}
              stroke="#0D47A1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={padding}
              y1={hoverCoord.pixelY}
              x2={width - padding}
              y2={hoverCoord.pixelY}
              stroke="#0D47A1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle cx={hoverCoord.pixelX} cy={hoverCoord.pixelY} r="4.5" fill="#0D47A1" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect
              x={Math.min(hoverCoord.pixelX + 8, width - 110)}
              y={Math.max(hoverCoord.pixelY - 24, padding + 4)}
              width="90"
              height="20"
              rx="4"
              fill="#0F172A"
            />
            <text
              x={Math.min(hoverCoord.pixelX + 14, width - 104)}
              y={Math.max(hoverCoord.pixelY - 10, padding + 18)}
              fill="#FFFFFF"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="600"
            >
              ({hoverCoord.x}, {hoverCoord.y})
            </text>
          </g>
        )}
      </svg>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-0.5 bg-[#0D47A1] rounded-full" />
            <span>Curva f(x)</span>
          </span>
          {secondaryEvalCode && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-0.5 border-b-2 border-dashed border-red-600" />
              <span>{secondaryLabel || 'Segunda Función'}</span>
            </span>
          )}
          {showDiagonalSymmetry && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-0.5 border-b border-dashed border-amber-500" />
              <span>Eje y = x</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
            <span>Corte X</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0D47A1]" />
            <span>Corte Y</span>
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Pasa el cursor para coordenadas</span>
      </div>
    </div>
  );
};
