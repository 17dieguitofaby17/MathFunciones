import React from 'react';

interface MathFormulaProps {
  formula: string;
  className?: string;
}

/**
 * Beautiful Math Formula formatter that converts LaTeX strings 
 * (like \sqrt{x}, \frac{a}{b}, x^2, \log_2(x), etc.) into clean HTML typographic math
 * avoiding raw backslashes or ugly code syntax.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({ formula, className = '' }) => {
  if (!formula) return null;

  // Format the formula string
  const formatMathString = (str: string): React.ReactNode => {
    // If it's a piecewise function with cases
    if (str.includes('\\begin{cases}')) {
      const cleanContent = str
        .replace(/\\begin\{cases\}/g, '')
        .replace(/\\end\{cases\}/g, '')
        .trim();
      const parts = cleanContent.split('\\\\').map((p) => p.trim());

      return (
        <span className="inline-flex items-center gap-2 font-math">
          <span className="text-2xl sm:text-3xl font-light text-slate-400">{'{'}</span>
          <span className="flex flex-col text-left text-xs sm:text-sm space-y-0.5">
            {parts.map((part, idx) => {
              const [val, cond] = part.split('&').map((s) => s.trim());
              return (
                <span key={idx} className="flex items-center gap-2">
                  <span className="font-bold">{cleanMathTokens(val)}</span>
                  {cond && <span className="text-slate-500 font-sans text-xs">{cleanMathTokens(cond)}</span>}
                </span>
              );
            })}
          </span>
        </span>
      );
    }

    // Standard formula formatting
    return <span className="font-math">{cleanMathTokens(str)}</span>;
  };

  const cleanMathTokens = (text: string): React.ReactNode => {
    if (!text) return '';

    // Replace common LaTeX symbols
    let res = text
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\ge/g, '≥')
      .replace(/\\le/g, '≤')
      .replace(/\\neq/g, '≠')
      .replace(/\\ne/g, '≠')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\pm/g, '±')
      .replace(/\\infty/g, '∞')
      .replace(/\\mathbb\{R\}/g, 'ℝ')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\in/g, '∈')
      .replace(/\\circ/g, '∘');

    // Handle fractions: \frac{num}{den} => (num)/(den) or nice stacked look
    res = res.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');

    // Handle square roots: \sqrt{x} => √(x)
    res = res.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

    // Handle superscripts: x^2 => x²
    res = res
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^x/g, 'ˣ')
      .replace(/\^\{-1\}/g, '⁻¹')
      .replace(/\^-1/g, '⁻¹')
      .replace(/f\^\{-1\}/g, 'f⁻¹')
      .replace(/f\^-1/g, 'f⁻¹');

    // Handle log subscripts: \log_2(x) => log₂(x)
    res = res
      .replace(/\\log_2/g, 'log₂')
      .replace(/\\log_a/g, 'logₐ')
      .replace(/\\log/g, 'log');

    // Remove any stray backslashes
    res = res.replace(/\\/g, '');

    return res;
  };

  return (
    <span className={`inline-block select-text ${className}`}>
      {formatMathString(formula)}
    </span>
  );
};
