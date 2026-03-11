import { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import { SHORTCUT_DEFINITIONS, formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Help & Keyboard Shortcuts"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md mx-4 bg-card border border-border shadow-2xl focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-muted-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
            aria-label="Close help dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="px-6 py-4 space-y-2">
          {SHORTCUT_DEFINITIONS.map((s) => (
            <div
              key={s.key + s.description}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-foreground">{s.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-muted text-muted-foreground border border-border rounded-sm">
                {formatShortcut(s)}
              </kbd>
            </div>
          ))}
        </div>

        {/* Syntax Reference */}
        <div className="px-6 py-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded-sm font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between">
      <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 border border-border">{left}</code>
      <span className="text-xs text-muted-foreground">{right}</span>
    </div>
  );
}
