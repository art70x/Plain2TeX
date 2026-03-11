/**
 * Plain-text math expression to LaTeX converter.
 * Supports fractions, exponents, roots, trig, Greek letters,
 * implicit multiplication, constants, and subscripts.
 */

const GREEK_MAP: Record<string, string> = {
  alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta',
  epsilon: '\\epsilon', zeta: '\\zeta', eta: '\\eta', theta: '\\theta',
  iota: '\\iota', kappa: '\\kappa', lambda: '\\lambda', mu: '\\mu',
  nu: '\\nu', xi: '\\xi', pi: '\\pi', rho: '\\rho',
  sigma: '\\sigma', tau: '\\tau', upsilon: '\\upsilon', phi: '\\phi',
  chi: '\\chi', psi: '\\psi', omega: '\\omega',
  Alpha: '\\Alpha', Beta: '\\Beta', Gamma: '\\Gamma', Delta: '\\Delta',
  Epsilon: '\\Epsilon', Theta: '\\Theta', Lambda: '\\Lambda',
  Pi: '\\Pi', Sigma: '\\Sigma', Phi: '\\Phi', Psi: '\\Psi', Omega: '\\Omega',
  inf: '\\infty', infinity: '\\infty',
};

const FUNCTIONS = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan', 'log', 'ln', 'exp', 'lim', 'sum', 'prod', 'int'];

type Token = {
  type: 'number' | 'variable' | 'operator' | 'function' | 'lparen' | 'rparen' | 'caret' | 'underscore' | 'greek' | 'comma';
  value: string;
};

export interface ParseResult {
  latex: string;
  error: string | null;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < input.length && /[0-9]/.test(input[i + 1]))) {
      let num = '';
      while (i < input.length && (/[0-9]/.test(input[i]) || input[i] === '.')) {
        num += input[i]; i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let word = '';
      while (i < input.length && /[a-zA-Z]/.test(input[i])) {
        word += input[i]; i++;
      }

      if (word === 'sqrt') {
        tokens.push({ type: 'function', value: 'sqrt' });
      } else if (FUNCTIONS.includes(word)) {
        tokens.push({ type: 'function', value: word });
      } else if (GREEK_MAP[word]) {
        tokens.push({ type: 'greek', value: word });
      } else if (word === 'e' && (i >= input.length || input[i] !== 'x')) {
        // 'e' as Euler's number unless followed by more letters
        tokens.push({ type: 'variable', value: 'e' });
      } else {
        // Split multi-char variables into individual chars for implicit multiplication
        for (const c of word) {
          tokens.push({ type: 'variable', value: c });
        }
      }
      continue;
    }

    if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (ch === '^') { tokens.push({ type: 'caret', value: '^' }); i++; continue; }
    if (ch === '_') { tokens.push({ type: 'underscore', value: '_' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
    if (['+', '-', '*', '/', '=', '<', '>', '!'].includes(ch)) {
      // Check for !=, <=, >=
      if (i + 1 < input.length && input[i + 1] === '=') {
        const op = ch + '=';
        tokens.push({ type: 'operator', value: op });
        i += 2;
        continue;
      }
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Unknown character — skip
    i++;
  }

  return tokens;
}

function checkParentheses(tokens: Token[]): string | null {
  let depth = 0;
  for (const t of tokens) {
    if (t.type === 'lparen') depth++;
    if (t.type === 'rparen') depth--;
    if (depth < 0) return 'Unexpected closing parenthesis';
  }
  if (depth > 0) return `${depth} unclosed parenthesis${depth > 1 ? 'es' : ''}`;
  return null;
}

function tokensToLatex(tokens: Token[]): string {
  let result = '';
  
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i + 1 < tokens.length ? tokens[i + 1] : null;

    // Implicit multiplication: number before variable/greek/function/lparen, or variable before lparen
    if (prev && needsImplicitMul(prev, t)) {
      result += ' \\cdot ';
    }

    switch (t.type) {
      case 'number':
        result += t.value;
        break;

      case 'variable':
        result += t.value;
        break;

      case 'greek':
        result += GREEK_MAP[t.value] || t.value;
        break;

      case 'function':
        if (t.value === 'sqrt') {
          result += '\\sqrt';
        } else {
          result += `\\${t.value}`;
        }
        break;

      case 'operator':
        result += operatorToLatex(t.value);
        break;

      case 'lparen':
        result += '\\left(';
        break;

      case 'rparen':
        result += '\\right)';
        break;

      case 'caret':
        result += '^';
        // Wrap the next token/group in braces
        if (next) {
          if (next.type === 'lparen') {
            // Find matching paren and wrap content
            const group = extractGroup(tokens, i + 1);
            result += `{${tokensToLatex(group.inner)}}`;
            i = group.endIndex;
          } else {
            result += `{${tokenToLatex(next)}}`;
            i++;
          }
        }
        break;

      case 'underscore':
        result += '_';
        if (next) {
          if (next.type === 'lparen') {
            const group = extractGroup(tokens, i + 1);
            result += `{${tokensToLatex(group.inner)}}`;
            i = group.endIndex;
          } else {
            result += `{${tokenToLatex(next)}}`;
            i++;
          }
        }
        break;

      case 'comma':
        result += ', ';
        break;
    }
  }

  return result;
}

function needsImplicitMul(prev: Token, curr: Token): boolean {
  const prevIsValue = ['number', 'variable', 'greek', 'rparen'].includes(prev.type);
  const currIsValue = ['number', 'variable', 'greek', 'function', 'lparen'].includes(curr.type);
  return prevIsValue && currIsValue;
}

function operatorToLatex(op: string): string {
  switch (op) {
    case '*': return ' \\times ';
    case '/': return ' / ';
    case '+': return ' + ';
    case '-': return ' - ';
    case '=': return ' = ';
    case '<': return ' < ';
    case '>': return ' > ';
    case '<=': return ' \\leq ';
    case '>=': return ' \\geq ';
    case '!=': return ' \\neq ';
    default: return ` ${op} `;
  }
}

function tokenToLatex(t: Token): string {
  if (t.type === 'greek') return GREEK_MAP[t.value] || t.value;
  if (t.type === 'function') return t.value === 'sqrt' ? '\\sqrt' : `\\${t.value}`;
  return t.value;
}

function extractGroup(tokens: Token[], startIndex: number): { inner: Token[]; endIndex: number } {
  let depth = 0;
  const inner: Token[] = [];
  for (let i = startIndex; i < tokens.length; i++) {
    if (tokens[i].type === 'lparen') {
      if (depth > 0) inner.push(tokens[i]);
      depth++;
    } else if (tokens[i].type === 'rparen') {
      depth--;
      if (depth === 0) return { inner, endIndex: i };
      inner.push(tokens[i]);
    } else {
      inner.push(tokens[i]);
    }
  }
  return { inner, endIndex: tokens.length - 1 };
}

/**
 * Convert fractions: detect `a/b` patterns and convert to \frac{a}{b}
 */
function convertFractions(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'operator' && tokens[i].value === '/') {
      // Get numerator (previous token or group)
      const numerator = popNumerator(result);
      // Get denominator (next token or group)
      const { denom, newIndex } = getDenominator(tokens, i + 1);

      // Push a synthetic token representing the fraction
      result.push({
        type: 'variable',
        value: `\\frac{${numerator}}{${denom}}`,
      });
      i = newIndex;
    } else {
      result.push(tokens[i]);
    }
  }

  return result;
}

function popNumerator(tokens: Token[]): string {
  if (tokens.length === 0) return '?';

  const last = tokens[tokens.length - 1];
  if (last.type === 'rparen') {
    // Find matching lparen
    let depth = 0;
    let start = tokens.length - 1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].type === 'rparen') depth++;
      if (tokens[i].type === 'lparen') depth--;
      if (depth === 0) { start = i; break; }
    }
    const group = tokens.splice(start);
    return tokensToLatex(group.slice(1, -1)); // Remove parens
  }

  const t = tokens.pop()!;
  return tokenToLatex(t);
}

function getDenominator(tokens: Token[], index: number): { denom: string; newIndex: number } {
  if (index >= tokens.length) return { denom: '?', newIndex: index - 1 };

  if (tokens[index].type === 'lparen') {
    const group = extractGroup(tokens, index);
    return { denom: tokensToLatex(group.inner), newIndex: group.endIndex };
  }

  return { denom: tokenToLatex(tokens[index]), newIndex: index };
}

export function parseExpression(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { latex: '', error: null };

  try {
    const tokens = tokenize(trimmed);
    
    const parenError = checkParentheses(tokens);
    if (parenError) return { latex: '', error: parenError };

    if (tokens.length === 0) return { latex: '', error: 'Empty expression' };

    // Convert fractions first
    const withFractions = convertFractions([...tokens]);
    const latex = tokensToLatex(withFractions);

    return { latex, error: null };
  } catch {
    return { latex: '', error: 'Invalid expression' };
  }
}
