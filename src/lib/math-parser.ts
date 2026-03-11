/**
 * Plain-text math expression to LaTeX converter.
 * Supports fractions, exponents, roots, trig, Greek letters,
 * implicit multiplication, constants, and subscripts.
 */

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

export interface ParseResult {
  latex: string
  error: string | null
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < input.length) {
    const ch = input[index]

    if (/\s/.test(ch)) {
      index++
      continue
    }

    if (
      /[0-9]/.test(ch) ||
      (ch === '.' && index + 1 < input.length && /[0-9]/.test(input[index + 1]))
    ) {
      let number_ = ''
      while (index < input.length && (/[0-9]/.test(input[index]) || input[index] === '.')) {
        number_ += input[index]
        index++
      }
      tokens.push({ type: 'number', value: number_ })
      continue
    }

    if (/[a-zA-Z]/.test(ch)) {
      let word = ''
      while (index < input.length && /[a-zA-Z]/.test(input[index])) {
        word += input[index]
        index++
      }

      if (word === 'sqrt') {
        tokens.push({ type: 'function', value: 'sqrt' })
      } else if (FUNCTIONS.has(word)) {
        tokens.push({ type: 'function', value: word })
      } else if (GREEK_MAP[word]) {
        tokens.push({ type: 'greek', value: word })
      } else if (word === 'e' && (index >= input.length || input[index] !== 'x')) {
        // 'e' as Euler's number unless followed by more letters
        tokens.push({ type: 'variable', value: 'e' })
      } else {
        // Split multi-char variables into individual chars for implicit multiplication
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
    if (['+', '-', '*', '/', '=', '<', '>', '!'].includes(ch)) {
      // Check for !=, <=, >=
      if (index + 1 < input.length && input[index + 1] === '=') {
        const op = ch + '='
        tokens.push({ type: 'operator', value: op })
        index += 2
        continue
      }
      tokens.push({ type: 'operator', value: ch })
      index++
      continue
    }

    // Unknown character — skip
    index++
  }

  return tokens
}

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

function tokensToLatex(tokens: Token[]): string {
  let result = ''

  for (let index = 0; index < tokens.length; index++) {
    const t = tokens[index]
    const previous = index > 0 ? tokens[index - 1] : null
    const next = index + 1 < tokens.length ? tokens[index + 1] : null

    // Implicit multiplication: number before variable/greek/function/lparen, or variable before lparen
    if (previous && needsImplicitMul(previous, t)) {
      result += String.raw` \cdot `
    }

    switch (t.type) {
      case 'number': {
        result += t.value
        break
      }

      case 'variable': {
        result += t.value
        break
      }

      case 'greek': {
        result += GREEK_MAP[t.value] || t.value
        break
      }

      case 'function': {
        result += t.value === 'sqrt' ? String.raw`\sqrt` : `\\${t.value}`
        break
      }

      case 'operator': {
        result += operatorToLatex(t.value)
        break
      }

      case 'lparen': {
        result += String.raw`\left(`
        break
      }

      case 'rparen': {
        result += String.raw`\right)`
        break
      }

      case 'caret': {
        result += '^'
        // Wrap the next token/group in braces
        if (next) {
          if (next.type === 'lparen') {
            // Find matching paren and wrap content
            const group = extractGroup(tokens, index + 1)
            result += `{${tokensToLatex(group.inner)}}`
            index = group.endIndex
          } else {
            result += `{${tokenToLatex(next)}}`
            index++
          }
        }
        break
      }

      case 'underscore': {
        result += '_'
        if (next) {
          if (next.type === 'lparen') {
            const group = extractGroup(tokens, index + 1)
            result += `{${tokensToLatex(group.inner)}}`
            index = group.endIndex
          } else {
            result += `{${tokenToLatex(next)}}`
            index++
          }
        }
        break
      }

      case 'comma': {
        result += ', '
        break
      }
    }
  }

  return result
}

function needsImplicitMul(previous: Token, current: Token): boolean {
  const previousIsValue = ['number', 'variable', 'greek', 'rparen'].includes(previous.type)
  const currentIsValue = ['number', 'variable', 'greek', 'function', 'lparen'].includes(
    current.type,
  )
  return previousIsValue && currentIsValue
}

function operatorToLatex(op: string): string {
  switch (op) {
    case '*': {
      return String.raw` \times `
    }
    case '/': {
      return ' / '
    }
    case '+': {
      return ' + '
    }
    case '-': {
      return ' - '
    }
    case '=': {
      return ' = '
    }
    case '<': {
      return ' < '
    }
    case '>': {
      return ' > '
    }
    case '<=': {
      return String.raw` \leq `
    }
    case '>=': {
      return String.raw` \geq `
    }
    case '!=': {
      return String.raw` \neq `
    }
    default: {
      return ` ${op} `
    }
  }
}

function tokenToLatex(t: Token): string {
  if (t.type === 'greek') return GREEK_MAP[t.value] || t.value
  if (t.type === 'function') return t.value === 'sqrt' ? String.raw`\sqrt` : `\\${t.value}`
  return t.value
}

function extractGroup(tokens: Token[], startIndex: number): { inner: Token[]; endIndex: number } {
  let depth = 0
  const inner: Token[] = []
  for (let index = startIndex; index < tokens.length; index++) {
    if (tokens[index].type === 'lparen') {
      if (depth > 0) inner.push(tokens[index])
      depth++
    } else if (tokens[index].type === 'rparen') {
      depth--
      if (depth === 0) return { inner, endIndex: index }
      inner.push(tokens[index])
    } else {
      inner.push(tokens[index])
    }
  }
  return { inner, endIndex: tokens.length - 1 }
}

/**
 * Convert fractions: detect `a/b` patterns and convert to \frac{a}{b}
 */
function convertFractions(tokens: Token[]): Token[] {
  const result: Token[] = []

  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].type === 'operator' && tokens[index].value === '/') {
      // Get numerator (previous token or group)
      const numerator = popNumerator(result)
      // Get denominator (next token or group)
      const { denom, newIndex } = getDenominator(tokens, index + 1)

      // Push a synthetic token representing the fraction
      result.push({
        type: 'variable',
        value: String.raw`\frac{${numerator}}{${denom}}`,
      })
      index = newIndex
    } else {
      result.push(tokens[index])
    }
  }

  return result
}

function popNumerator(tokens: Token[]): string {
  if (tokens.length === 0) return '?'
  const last = tokens.at(-1)!

  if (last.type === 'rparen') {
    // Find matching lparen
    let depth = 0
    let start = tokens.length - 1
    for (let index = tokens.length - 1; index >= 0; index--) {
      if (tokens[index].type === 'rparen') depth++
      if (tokens[index].type === 'lparen') depth--
      if (depth === 0) {
        start = index
        break
      }
    }
    const group = tokens.splice(start)
    return tokensToLatex(group.slice(1, -1)) // Remove parens
  }

  const t = tokens.pop()!
  return tokenToLatex(t)
}

function getDenominator(tokens: Token[], index: number): { denom: string; newIndex: number } {
  if (index >= tokens.length) return { denom: '?', newIndex: index - 1 }

  if (tokens[index].type === 'lparen') {
    const group = extractGroup(tokens, index)
    return { denom: tokensToLatex(group.inner), newIndex: group.endIndex }
  }

  return { denom: tokenToLatex(tokens[index]), newIndex: index }
}

export function parseExpression(input: string): ParseResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { latex: '', error: null }
  }

  // Optional: protect against very large input
  if (trimmed.length > 5000) {
    return { latex: '', error: 'Expression too long' }
  }

  try {
    const tokens = tokenize(trimmed)

    if (tokens.length === 0) {
      return { latex: '', error: 'Empty expression' }
    }

    const parenError = checkParentheses(tokens)
    if (parenError) {
      return { latex: '', error: parenError }
    }

    const fractionTokens = convertFractions([...tokens])
    const latex = tokensToLatex(fractionTokens)

    return { latex, error: null }
  } catch (error) {
    console.error('Expression parsing failed:', error)
    return { latex: '', error: 'Invalid expression' }
  }
}
