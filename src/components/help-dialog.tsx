import { HelpCircle, Keyboard } from 'lucide-react'
import { forwardRef } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/animate-ui/components/radix/dialog'
import { Kbd } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatShortcut, shortcutDefinitions } from '@/hooks/use-hotkeys'

const HelpDialog = forwardRef<HTMLButtonElement>(function HelpDialog(_, reference) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          ref={reference}
          variant="ghost"
          size="sm"
          aria-label="Open help and keyboard shortcuts"
          title={`Help (${formatShortcut('Mod+/')})`}
        >
          <HelpCircle size={12} />
          <Kbd className="hidden sm:flex">{formatShortcut('Mod+/')}</Kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border border-border bg-card p-0 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-border px-6 py-4">
          <Keyboard size={18} className="text-muted-foreground" />
          <DialogTitle className="text-sm font-bold tracking-[0.15em] uppercase">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="sr-only">
            A list of keyboard shortcuts and syntax reference for the equation formatter.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {/* Shortcuts */}
          <div className="space-y-2 px-6 py-4">
            {shortcutDefinitions.map((s) => (
              <div key={s.hotkey} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{s.description}</span>
                <kbd className="rounded-sm border border-border bg-muted px-2 py-1 font-mono text-xs font-semibold text-muted-foreground">
                  {formatShortcut(s.hotkey)}
                </kbd>
              </div>
            ))}
          </div>

          {/* Syntax Reference */}
          <div className="space-y-5 border-t border-border px-6 py-4">
            <h3 className="text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase">
              Syntax Reference
            </h3>

            <Section title="Structure">
              <Row left="a/b" right="Fraction → \frac{a}{b}" />
              <Row left="a*b/c" right="Full numerator → \frac{a·b}{c}" />
              <Row left="x^2" right="Superscript" />
              <Row left="x_1" right="Subscript" />
              <Row left="x_1^2" right="Subscript + superscript" />
              <Row left="sqrt(x)" right="Square root" />
            </Section>

            <Section title="Operators">
              <Row left="+" right="Add" />
              <Row left="-" right="Subtract / unary negate" />
              <Row left="*" right="Multiply → ×" />
              <Row left="2x  2(x+1)" right="Implicit multiply → ·" />
              <Row left="+-" right="Plus-minus → ±" />
              <Row left="=" right="Equals" />
              <Row left="<  >" right="Inequalities" />
              <Row left="<=  >=" right="≤  ≥" />
              <Row left="!=" right="Not equal → ≠" />
            </Section>

            <Section title="Functions">
              <Row left="sin cos tan" right="Basic trig" />
              <Row left="cot sec csc" right="Reciprocal trig" />
              <Row left="arcsin arccos arctan" right="Inverse trig" />
              <Row left="log  ln" right="Logarithms" />
              <Row left="exp" right="Exponential" />
              <Row left="lim  sum  prod" right="Limit, sum, product" />
              <Row left="int" right="Integral" />
            </Section>

            <Section title="Constants">
              <Row left="pi" right="π" />
              <Row left="e" right="Euler's number" />
              <Row left="inf  infinity" right="∞" />
            </Section>

            <Section title="Greek Letters">
              <Row left="alpha  beta  gamma" right="α  β  γ" />
              <Row left="delta  epsilon  zeta" right="δ  ε  ζ" />
              <Row left="eta  theta  iota" right="η  θ  ι" />
              <Row left="kappa  lambda  mu" right="κ  λ  μ" />
              <Row left="nu  xi  rho" right="ν  ξ  ρ" />
              <Row left="sigma  tau  upsilon" right="σ  τ  υ" />
              <Row left="phi  chi  psi  omega" right="φ  χ  ψ  ω" />
              <Row left="Uppercase (e.g. Sigma)" right="Capitalise the word" />
            </Section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Press <Kbd>Esc</Kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  )
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <code className="border border-border bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-foreground">
        {left}
      </code>
      <span className="text-right text-xs text-muted-foreground">{right}</span>
    </div>
  )
}

export default HelpDialog
