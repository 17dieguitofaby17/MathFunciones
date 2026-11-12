import React from 'react';

interface MathFormulaProps {
  formula: string;
  className?: string;
}

/**
 * Clean, recursive LaTeX-to-HTML typographic math formatter.
 * Renders fractions, arbitrary log bases (\log_6), nested exponents (6^{\frac{x}{2}-2}),
 * square roots, piecewise cases, and standard mathematical symbols cleanly.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({ formula, className = '' }) => {
  if (!formula) return null;

  const replaceSymbols = (str: string): string => {
    return str
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\ge/g, '≥')
      .replace(/\\le/g, '≤')
      .replace(/\\neq/g, '≠')
      .replace(/\\ne/g, '≠')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\pm/g, '±')
      .replace(/\\infty/g, '∞')
      .replace(/\\emptyset/g, '∅')
      .replace(/\\mathbb\{R\}/g, 'ℝ')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\in/g, '∈')
      .replace(/\\circ/g, '∘')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\left\|/g, '|')
      .replace(/\\right\|/g, '|')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\log/g, 'log')
      .replace(/\\ln/g, 'ln');
  };

  // Helper to read a balanced {...} block starting at index `start` (pointing to '{')
  const readBraceGroup = (str: string, start: number): { content: string; endIndex: number } | null => {
    if (str[start] !== '{') return null;
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          return { content: str.slice(start + 1, i), endIndex: i };
        }
      }
    }
    return null;
  };

  const renderMathNodes = (raw: string, keyPrefix = 'm'): React.ReactNode[] => {
    const str = replaceSymbols(raw);
    const nodes: React.ReactNode[] = [];
    let buffer = '';
    let i = 0;
    let partIdx = 0;

    const flushBuffer = () => {
      if (buffer) {
        nodes.push(<span key={`${keyPrefix}-t-${partIdx++}`}>{buffer.replace(/\\/g, '')}</span>);
        buffer = '';
      }
    };

    while (i < str.length) {
      // Handle \frac{num}{den}
      if (str.startsWith('\\frac{', i)) {
        const numGroup = readBraceGroup(str, i + 5);
        if (numGroup && str[numGroup.endIndex + 1] === '{') {
          const denGroup = readBraceGroup(str, numGroup.endIndex + 1);
          if (denGroup) {
            flushBuffer();
            nodes.push(
              <span
                key={`${keyPrefix}-frac-${partIdx++}`}
                className="inline-flex flex-col items-center align-middle mx-1 leading-none text-[0.82em]"
              >
                <span className="border-b border-current px-1 pb-0.5">
                  {renderMathNodes(numGroup.content, `${keyPrefix}-fn-${partIdx}`)}
                </span>
                <span className="px-1 pt-0.5">
                  {renderMathNodes(denGroup.content, `${keyPrefix}-fd-${partIdx}`)}
                </span>
              </span>
            );
            i = denGroup.endIndex + 1;
            continue;
          }
        }
      }

      // Handle \sqrt{expr}
      if (str.startsWith('\\sqrt{', i)) {
        const inner = readBraceGroup(str, i + 5);
        if (inner) {
          flushBuffer();
          nodes.push(
            <span key={`${keyPrefix}-sqrt-${partIdx++}`} className="inline-flex items-center">
              <span className="mr-0.5">√</span>
              <span className="border-t border-current px-0.5">
                {renderMathNodes(inner.content, `${keyPrefix}-sq-${partIdx}`)}
              </span>
            </span>
          );
          i = inner.endIndex + 1;
          continue;
        }
      }

      // Handle superscripts ^{...} or ^x
      if (str[i] === '^') {
        if (str[i + 1] === '{') {
          const inner = readBraceGroup(str, i + 1);
          if (inner) {
            flushBuffer();
            nodes.push(
              <sup key={`${keyPrefix}-sup-${partIdx++}`} className="text-[0.72em] leading-none ml-0.5">
                {renderMathNodes(inner.content, `${keyPrefix}-sp-${partIdx}`)}
              </sup>
            );
            i = inner.endIndex + 1;
            continue;
          }
        } else if (i + 1 < str.length && str[i + 1] !== ' ') {
          flushBuffer();
          nodes.push(
            <sup key={`${keyPrefix}-sup-${partIdx++}`} className="text-[0.72em] leading-none">
              {str[i + 1]}
            </sup>
          );
          i += 2;
          continue;
        }
      }

      // Handle subscripts _{...} or _n
      if (str[i] === '_') {
        if (str[i + 1] === '{') {
          const inner = readBraceGroup(str, i + 1);
          if (inner) {
            flushBuffer();
            nodes.push(
              <sub key={`${keyPrefix}-sub-${partIdx++}`} className="text-[0.7em] leading-none">
                {renderMathNodes(inner.content, `${keyPrefix}-sb-${partIdx}`)}
              </sub>
            );
            i = inner.endIndex + 1;
            continue;
          }
        } else if (i + 1 < str.length && str[i + 1] !== ' ') {
          flushBuffer();
          nodes.push(
            <sub key={`${keyPrefix}-sub-${partIdx++}`} className="text-[0.7em] leading-none">
              {str[i + 1]}
            </sub>
          );
          i += 2;
          continue;
        }
      }

      buffer += str[i];
      i++;
    }

    flushBuffer();
    return nodes;
  };

  const formatMathString = (str: string): React.ReactNode => {
    if (str.includes('\\begin{cases}')) {
      const cleanContent = str
        .replace(/\\begin\{cases\}/g, '')
        .replace(/\\end\{cases\}/g, '')
        .trim();
      const parts = cleanContent.split('\\\\').map((p) => p.trim());

      return (
        <span className="inline-flex items-center gap-2 font-math">
          <span className="text-2xl sm:text-3xl font-light text-slate-400">{'{'}</span>
          <span className="flex flex-col text-left text-xs sm:text-sm space-y-1">
            {parts.map((part, idx) => {
              const [val, cond] = part.split('&').map((s) => s.trim());
              return (
                <span key={idx} className="flex items-center gap-2">
                  <span className="font-bold">{renderMathNodes(val, `c-${idx}-v`)}</span>
                  {cond && <span className="text-slate-500 font-sans text-xs">{renderMathNodes(cond, `c-${idx}-c`)}</span>}
                </span>
              );
            })}
          </span>
        </span>
      );
    }

    return <span className="font-math inline-flex items-center flex-wrap justify-center">{renderMathNodes(str)}</span>;
  };

  return (
    <span className={`inline-block select-text ${className}`}>
      {formatMathString(formula)}
    </span>
  );
};
