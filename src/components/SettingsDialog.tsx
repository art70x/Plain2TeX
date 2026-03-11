import { X, Settings, Moon, Sun, Download, Palette, Type } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const FONT_SIZES = [
  { value: 1, label: 'S' },
  { value: 1.5, label: 'M' },
  { value: 2, label: 'L' },
  { value: 2.5, label: 'XL' },
  { value: 3, label: '2XL' },
];

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { darkMode, setDarkMode, exportColors, setExportColors, fontSize, setFontSize, canInstall, installPwa } = useSettings();

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-sm mx-4 bg-card border border-border shadow-2xl focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-muted-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dark Mode */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon size={16} className="text-muted-foreground" /> : <Sun size={16} className="text-muted-foreground" />}
              <span className="text-sm font-semibold text-foreground">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                darkMode ? 'bg-primary' : 'bg-input'
              }`}
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
            >
              <span
                className={`block w-5 h-5 rounded-full bg-background shadow-lg transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Export Colors */}
        <div className="px-6 py-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Export Colors</span>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="export-bg" className="text-xs text-muted-foreground uppercase tracking-wider">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                id="export-bg"
                type="color"
                value={exportColors.background}
                onChange={(e) => setExportColors({ ...exportColors, background: e.target.value })}
                className="w-8 h-8 border border-border cursor-pointer bg-transparent"
              />
              <code className="text-xs font-mono text-muted-foreground w-16">{exportColors.background}</code>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="export-text" className="text-xs text-muted-foreground uppercase tracking-wider">
              Text
            </label>
            <div className="flex items-center gap-2">
              <input
                id="export-text"
                type="color"
                value={exportColors.text}
                onChange={(e) => setExportColors({ ...exportColors, text: e.target.value })}
                className="w-8 h-8 border border-border cursor-pointer bg-transparent"
              />
              <code className="text-xs font-mono text-muted-foreground w-16">{exportColors.text}</code>
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div className="px-6 py-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Preview Size</span>
          </div>
          <div className="flex items-center gap-2">
            {FONT_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFontSize(s.value)}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  fontSize === s.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Install PWA */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Install App</span>
            </div>
            <button
              onClick={installPwa}
              disabled={!canInstall}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {canInstall ? 'Install' : 'Installed'}
            </button>
          </div>
          {!canInstall && (
            <p className="text-xs text-muted-foreground mt-2">
              Already installed or not available in this browser. Try Chrome or Edge.
            </p>
          )}
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
