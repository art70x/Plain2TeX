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
import { HelpCircle, Keyboard } from 'lucide-react'
import { forwardRef } from 'react'

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
          {/* Satisfies Radix's DialogDescription requirement without visible text */}
          <DialogDescription className="sr-only">
            A list of keyboard shortcuts and syntax reference for the equation formatter.
          </DialogDescription>
        </DialogHeader>

        {/* Shortcuts List */}
        <ScrollArea className="max-h-[60vh]">
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
          <div className="border-t border-border px-6 py-4">
            <h3 className="mb-3 text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase">
              Syntax Reference
            </h3>
            <div className="space-y-1.5 text-sm">
              <Row left="a/b" right="Fraction" />
              <Row left="x^2" right="Exponent" />
              <Row left="sqrt(x)" right="Square root" />
              <Row left="sin cos log ln" right="Functions" />
              <Row left="pi theta alpha" right="Greek letters" />
              <Row left="x_1" right="Subscript" />
              <Row left="2x" right="Implicit multiply" />
            </div>
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

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between">
      <code className="border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
        {left}
      </code>
      <span className="text-xs text-muted-foreground">{right}</span>
    </div>
  )
}

export default HelpDialog
