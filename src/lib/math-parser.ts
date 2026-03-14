/**
 * Plain-text math expression to LaTeX converter.
 * Supports fractions, exponents, roots, trig, Greek letters,
 * implicit multiplication, constants, and subscripts.
 */

// ─── Maps & Sets ─────────────────────────────────────────────────────────────

const GREEK_MAP: Record<string, string> = {
  alpha: String.raw`\alpha`,
  beta: String.raw`\beta`,
  gamma: String.raw`\gamma`,
  delta: String.raw`\delta`,
  epsilon: String.raw`\epsilon`,
  zeta: String.raw`\zeta`,
  eta: String.raw`\eta`,
  theta: String.raw`\theta`,
  iota: String.raw`\iota`,
  kappa: String.raw`\kappa`,
  lambda: String.raw`\lambda`,
  mu: String.raw`\mu`,
  nu: String.raw`\nu`,
  xi: String.raw`\xi`,
  pi: String.raw`\pi`,
  rho: String.raw`\rho`,
  sigma: String.raw`\sigma`,
  tau: String.raw`\tau`,
  upsilon: String.raw`\upsilon`,
  phi: String.raw`\phi`,
  chi: String.raw`\chi`,
  psi: String.raw`\psi`,
  omega: String.raw`\omega`,
  Alpha: String.raw`\Alpha`,
  Beta: String.raw`\Beta`,
  Gamma: String.raw`\Gamma`,
  Delta: String.raw`\Delta`,
  Epsilon: String.raw`\Epsilon`,
  Theta: String.raw`\Theta`,
  Lambda: String.raw`\Lambda`,
  Pi: String.raw`\Pi`,
  Sigma: String.raw`\Sigma`,
  Phi: String.raw`\Phi`,
  Psi: String.raw`\Psi`,
  Omega: String.raw`\Omega`,
  inf: String.raw`\infty`,
  infinity: String.raw`\infty`,
}

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'csc',
  'arcsin',
  'arccos',
  'arctan',
  'log',
  'ln',
  'exp',
  'lim',
  'sum',
  'prod',
  'int',
])

/** Operators at additive precedence — act as fraction numerator boundaries. */
const ADDITIVE_OPS = new Set(['+', '-', '±', '=', '<', '>', '<=', '>=', '!='])

/** Token types that can start an implicit-multiplication RHS. */
const IMPLICIT_MUL_STARTERS = new Set<Token['type']>([
  'number',
  'variable',
  'greek',
  'function',
  'lparen',
])

// ─── Types ────────────────────────────────────────────────────────────────────

type Token = {
  type:
    | 'number'
    | 'variable'
    | 'operator'
    | 'function'
    | 'lparen'
    | 'rparen'
    | 'caret'
    | 'underscore'
    | 'greek'
    | 'comma'
  value: string
}

export interface ParseOptions {
  /**
   * Controls the symbol emitted for implicit multiplication.
   *   'cdot'  → 2x becomes `2 \cdot x`   (default)
   *   'none'  → 2x becomes `2x`
   */
  implicitMul: 'cdot' | 'none'
}

const DEFAULT_OPTIONS: ParseOptions = {
  implicitMul: 'cdot',
}

export interface ParseResult {
  latex: string
  error: string | null
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

function tokenize(input: string): Token[] {
  const normalized = input.replace(/\+-/g, '±')
  const tokens: Token[] = []
  let index = 0

  while (index < normalized.length) {
    const ch = normalized[index]

    if (/\s/.test(ch)) {
      index++
      continue
    }

    if (
      /[0-9]/.test(ch) ||
      (ch === '.' && index + 1 < normalized.length && /[0-9]/.test(normalized[index + 1]))
    ) {
      let number_ = ''
      while (
        index < normalized.length &&
        (/[0-9]/.test(normalized[index]) || normalized[index] === '.')
      ) {
        number_ += normalized[index]
        index++
      }
      tokens.push({ type: 'number', value: number_ })
      continue
    }

    if (/[a-zA-Z]/.test(ch)) {
      let word = ''
      while (index < normalized.length && /[a-zA-Z]/.test(normalized[index])) {
        word += normalized[index]
        index++
      }

      if (word === 'sqrt') {
        tokens.push({ type: 'function', value: 'sqrt' })
      } else if (FUNCTIONS.has(word)) {
        tokens.push({ type: 'function', value: word })
      } else if (GREEK_MAP[word]) {
        tokens.push({ type: 'greek', value: word })
      } else {
        for (const c of word) {
          tokens.push({ type: 'variable', value: c })
        }
      }
      continue
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen', value: '(' })
      index++
      continue
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' })
      index++
      continue
    }
    if (ch === '^') {
      tokens.push({ type: 'caret', value: '^' })
      index++
      continue
    }
    if (ch === '_') {
      tokens.push({ type: 'underscore', value: '_' })
      index++
      continue
    }
    if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' })
      index++
      continue
    }

    if (['+', '-', '±', '*', '/', '=', '<', '>', '!'].includes(ch)) {
      if (index + 1 < normalized.length && normalized[index + 1] === '=') {
        tokens.push({ type: 'operator', value: ch + '=' })
        index += 2
        continue
      }
      tokens.push({ type: 'operator', value: ch })
      index++
      continue
    }

    index++
  }

  return tokens
}

// ─── Parenthesis guard ────────────────────────────────────────────────────────

function checkParentheses(tokens: Token[]): string | null {
  let depth = 0
  for (const t of tokens) {
    if (t.type === 'lparen') depth++
    if (t.type === 'rparen') depth--
    if (depth < 0) return 'Unexpected closing parenthesis'
  }
  if (depth > 0) return `${depth} unclosed parenthesis${depth > 1 ? 'es' : ''}`
  return null
}

// ─── Operator helper ──────────────────────────────────────────────────────────

function operatorToLatex(op: string): string {
  switch (op) {
    case '*':
      return String.raw` \times `
    case '/':
      return ' / '
    case '+':
      return ' + '
    case '±':
      return String.raw` \pm `
    case '-':
      return ' - '
    case '=':
      return ' = '
    case '<':
      return ' < '
    case '>':
      return ' > '
    case '<=':
      return String.raw` \leq `
    case '>=':
      return String.raw` \geq `
    case '!=':
      return String.raw` \neq `
    default:
      return ` ${op} `
  }
}

// ─── Recursive-descent renderer ──────────────────────────────────────────────

class LatexRenderer {
  private readonly tokens: Token[]
  private readonly implicitMulSep: string
  private pos = 0

  constructor(tokens: Token[], options: ParseOptions) {
    this.tokens = tokens
    // Resolve the separator string once at construction — no per-token branching.
    this.implicitMulSep = options.implicitMul === 'cdot' ? String.raw` \cdot ` : ''
  }

  render(): string {
    return this.parseAdditive()
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null
  }

  private consume(): Token {
    return this.tokens[this.pos++]
  }

  private parseAdditive(): string {
    const parts: string[] = [this.parseMultiplicative()]

    while (true) {
      const t = this.peek()
      if (!t || t.type !== 'operator' || !ADDITIVE_OPS.has(t.value)) break
      this.consume()
      parts.push(operatorToLatex(t.value))
      parts.push(this.parseMultiplicative())
    }

    return parts.join('')
  }

  private parseMultiplicative(): string {
    const parts: string[] = [this.parseUnary()]

    while (true) {
      const t = this.peek()
      if (!t) break

      if (t.type === 'operator' && t.value === '/') {
        this.consume()
        const numerator = parts.join('')
        const denominator = this.parseUnary()
        parts.length = 0
        parts.push(`\\frac{${numerator}}{${denominator}}`)
        continue
      }

      if (t.type === 'operator' && t.value === '*') {
        this.consume()
        parts.push(String.raw` \times `)
        parts.push(this.parseUnary())
        continue
      }

      if (IMPLICIT_MUL_STARTERS.has(t.type)) {
        parts.push(this.implicitMulSep)
        parts.push(this.parseUnary())
        continue
      }

      break
    }

    return parts.join('')
  }

  private parseUnary(): string {
    const t = this.peek()
    if (t?.type === 'operator' && (t.value === '-' || t.value === '+')) {
      this.consume()
      return t.value + this.parsePower()
    }
    return this.parsePower()
  }

  private parsePower(): string {
    const parts: string[] = [this.parseAtom()]

    while (true) {
      const t = this.peek()
      if (t?.type === 'caret') {
        this.consume()
        parts.push(`^{${this.parseAtom()}}`)
        continue
      }
      if (t?.type === 'underscore') {
        this.consume()
        parts.push(`_{${this.parseAtom()}}`)
        continue
      }
      break
    }

    return parts.join('')
  }

  private parseAtom(): string {
    const t = this.peek()
    if (!t) return ''

    if (t.type === 'number') {
      this.consume()
      return t.value
    }
    if (t.type === 'variable') {
      this.consume()
      return t.value
    }
    if (t.type === 'comma') {
      this.consume()
      return ', '
    }

    if (t.type === 'greek') {
      this.consume()
      return GREEK_MAP[t.value] ?? t.value
    }

    if (t.type === 'lparen') {
      this.consume()
      const inner = this.parseAdditive()
      if (this.peek()?.type === 'rparen') this.consume()
      return String.raw`\left(` + inner + String.raw`\right)`
    }

    if (t.type === 'function') {
      this.consume()

      if (t.value === 'sqrt') {
        if (this.peek()?.type === 'lparen') {
          this.consume()
          const inner = this.parseAdditive()
          if (this.peek()?.type === 'rparen') this.consume()
          return `\\sqrt{${inner}}`
        }
        return `\\sqrt{${this.parseAtom()}}`
      }

      if (this.peek()?.type === 'lparen') {
        this.consume()
        const inner = this.parseAdditive()
        if (this.peek()?.type === 'rparen') this.consume()
        return `\\${t.value}\\left(${inner}\\right)`
      }

      return `\\${t.value}`
    }

    return ''
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseExpression(input: string, options?: Partial<ParseOptions>): ParseResult {
  const trimmed = input.trim()

  if (!trimmed) return { latex: '', error: null }
  if (trimmed.length > 5_000) return { latex: '', error: 'Expression too long' }

  const resolvedOptions: ParseOptions = { ...DEFAULT_OPTIONS, ...options }

  try {
    const tokens = tokenize(trimmed)
    if (tokens.length === 0) return { latex: '', error: 'Empty expression' }

    const parenError = checkParentheses(tokens)
    if (parenError) return { latex: '', error: parenError }

    return { latex: new LatexRenderer(tokens, resolvedOptions).render(), error: null }
  } catch (error) {
    console.error('Expression parsing failed:', error)
    return { latex: '', error: 'Invalid expression' }
  }
}
