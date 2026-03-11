import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { HelpCircle, Copy, Check, Image, FileCode, ChevronDown, Settings } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { parseExpression } from '@/lib/mathParser';
import { useKeyboardShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import HelpDialog from '@/components/HelpDialog';
import SettingsDialog from '@/components/SettingsDialog';
import { useSettings } from '@/contexts/SettingsContext';

const DEBOUNCE_MS = 80;

export default function EquationFormatter() {
  const [input, setInput] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [exportDpi, setExportDpi] = useState(2);
  const [showDpiMenu, setShowDpiMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { exportColors, fontSize } = useSettings();
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dpiMenuRef = useRef<HTMLDivElement>(null);

  const [debouncedInput, setDebouncedInput] = useState('');

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedInput(input), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  useEffect(() => {
    if (!showDpiMenu) return;
    const handler = (e: MouseEvent) => {
      if (dpiMenuRef.current && !dpiMenuRef.current.contains(e.target as Node)) {
        setShowDpiMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDpiMenu]);

  const { latex, error } = useMemo(() => parseExpression(debouncedInput), [debouncedInput]);

  const renderedHtml = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
      });
    } catch {
      return '';
    }
  }, [latex]);

  const handleCopyLatex = useCallback(async () => {
    if (!latex) return;
    try {
      await navigator.clipboard.writeText(latex);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = latex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 1500);
  }, [latex]);

  const applyExportColor = useCallback((el: HTMLElement) => {
    el.style.color = exportColors.text;
    el.querySelectorAll<HTMLElement>('.katex, .katex *').forEach((child) => {
      child.style.color = exportColors.text;
    });
  }, [exportColors.text]);

  const clearExportColor = useCallback((el: HTMLElement) => {
    el.style.color = '';
    el.querySelectorAll<HTMLElement>('.katex, .katex *').forEach((child) => {
      child.style.color = '';
    });
  }, []);

  const handleExportPng = useCallback(async () => {
    if (!previewRef.current || !latex) return;
    try {
      applyExportColor(previewRef.current);
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: exportDpi,
        backgroundColor: exportColors.background,
        skipFonts: true,
      });
      clearExportColor(previewRef.current);
      const link = document.createElement('a');
      link.download = 'equation.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      clearExportColor(previewRef.current!);
      console.error('PNG export failed:', err);
    }
  }, [latex, exportDpi, exportColors, applyExportColor, clearExportColor]);

  const handleExportSvg = useCallback(async () => {
    if (!previewRef.current || !latex) return;
    try {
      applyExportColor(previewRef.current);
      const dataUrl = await toSvg(previewRef.current, {
        backgroundColor: exportColors.background,
        skipFonts: true,
      });
      clearExportColor(previewRef.current);
      const link = document.createElement('a');
      link.download = 'equation.svg';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      clearExportColor(previewRef.current!);
      console.error('SVG export failed:', err);
    }
  }, [latex, exportColors, applyExportColor, clearExportColor]);

  useKeyboardShortcuts(
    useMemo(
      () => [
        { key: 'c', ctrl: true, shift: true, description: 'Copy LaTeX', action: handleCopyLatex },
        { key: 'p', ctrl: true, shift: true, description: 'Export PNG', action: handleExportPng },
        { key: 's', ctrl: true, shift: true, description: 'Export SVG', action: handleExportSvg },
        { key: 'k', ctrl: true, description: 'Focus input', action: () => inputRef.current?.focus() },
        { key: '/', ctrl: true, description: 'Toggle help', action: () => setShowHelp((v) => !v) },
        { key: 'Escape', description: 'Close help', action: () => setShowHelp(false) },
      ],
      [handleCopyLatex, handleExportPng, handleExportSvg]
    )
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-background overflow-hidden select-none">
      {/* Skip to content link for a11y */}
      <a
        href="#math-input"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold"
      >
        Skip to input
      </a>

      {/* Input Panel */}
      <section className="flex-1 flex flex-col p-6 md:p-10 md:border-r border-border" aria-label="Expression input">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="math-input"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold"
          >
            Expression
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings size={13} />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open help and keyboard shortcuts"
              title={`Help (${formatShortcut({ key: '/', ctrl: true })})`}
            >
              <HelpCircle size={13} />
              <kbd className="hidden sm:inline font-mono px-1 py-0.5 bg-muted border border-border rounded-sm">
                {formatShortcut({ key: '/', ctrl: true })}
              </kbd>
            </button>
          </div>
        </div>
        <textarea
          ref={inputRef}
          id="math-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 2/(4*4) or sin(theta)^2 + cos(theta)^2"
          className="w-full flex-1 bg-card text-foreground border border-input p-4 text-base md:text-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-mono placeholder:text-muted-foreground transition-shadow"
          spellCheck={false}
          autoComplete="off"
          aria-describedby="parse-error"
          aria-invalid={!!error}
        />
        <div id="parse-error" className="h-5 mt-2" aria-live="polite" role="alert">
          {error && (
            <span className="text-destructive text-sm font-medium">{error}</span>
          )}
        </div>
      </section>

      {/* Preview Panel */}
      <section className="flex-1 flex flex-col p-6 md:p-10" aria-label="Equation preview">
        {/* Centered preview */}
        <div
          ref={previewRef}
          className="flex-1 flex items-center justify-center px-4"
          aria-live="polite"
          aria-label="Rendered equation"
          role="img"
        >
          {renderedHtml ? (
            <div
              className="text-foreground"
              style={{ fontSize: `${fontSize}rem` }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <span className="text-muted-foreground text-lg italic">
              {input ? 'Parsing…' : 'Your equation will appear here'}
            </span>
          )}
        </div>

        {/* Actions — single row */}
        <div className="flex flex-wrap gap-2 items-center mt-4" role="toolbar" aria-label="Export actions">
          {/* Primary: Copy LaTeX */}
          <button
            onClick={handleCopyLatex}
            disabled={!latex}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Copy LaTeX (${formatShortcut({ key: 'C', ctrl: true, shift: true })})`}
          >
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copyState === 'copied' ? 'Copied!' : 'Copy LaTeX'}</span>
          </button>

          {/* PNG + DPI inline group */}
          <div className="flex items-center" role="group" aria-label="PNG export with resolution">
            <button
              onClick={handleExportPng}
              disabled={!latex}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider border border-border bg-card text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r-0"
              title={`Export PNG (${formatShortcut({ key: 'P', ctrl: true, shift: true })})`}
            >
              <Image size={14} />
              <span>PNG</span>
            </button>
            <div className="relative" ref={dpiMenuRef}>
              <button
                onClick={() => setShowDpiMenu(!showDpiMenu)}
                className="flex items-center gap-1 px-2.5 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground border border-border bg-card hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                aria-haspopup="listbox"
                aria-expanded={showDpiMenu}
                aria-label={`Resolution: ${exportDpi}x DPI`}
              >
                {exportDpi}x
                <ChevronDown size={12} className={`transition-transform ${showDpiMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDpiMenu && (
                <div
                  className="absolute bottom-full mb-1 right-0 bg-card border border-border shadow-lg z-10"
                  role="listbox"
                  aria-label="Select DPI"
                >
                  {[1, 2, 3, 4].map((dpi) => (
                    <button
                      key={dpi}
                      role="option"
                      aria-selected={dpi === exportDpi}
                      onClick={() => { setExportDpi(dpi); setShowDpiMenu(false); }}
                      className={`block w-full px-4 py-2 text-xs text-left hover:bg-muted transition-colors ${
                        dpi === exportDpi ? 'text-primary font-bold' : 'text-foreground'
                      }`}
                    >
                      {dpi}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SVG */}
          <button
            onClick={handleExportSvg}
            disabled={!latex}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider border border-border bg-card text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Export SVG (${formatShortcut({ key: 'S', ctrl: true, shift: true })})`}
          >
            <FileCode size={14} />
            <span>SVG</span>
          </button>
        </div>

        {/* LaTeX output */}
        {latex && (
          <div className="mt-4 w-full">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              LaTeX Output
            </p>
            <code className="block p-3 bg-card border border-border text-sm text-foreground break-all font-mono select-text">
              {latex}
            </code>
          </div>
        )}
      </section>

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} />
      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
