import { Button } from '@/components/animate-ui/components/buttons/button'
import { CopyButton } from '@/components/animate-ui/components/buttons/copy'
import HelpDialog from '@/components/help-dialog'
import SettingsDialog from '@/components/settings-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/contexts/settings-context'
import { formatShortcut, useHotkeys } from '@/hooks/use-hotkeys'
import { parseExpression } from '@/lib/math-parser'
import { toPng, toSvg } from 'html-to-image'
import katex from 'katex'
import 'katex/dist/katex-swap.min.css'
import { Check, ChevronDown, Copy, FileCode, Image } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function EquationFormatter() {
  const [input, setInput] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [exportDpi, setExportDpi] = useState(2)
  const helpTriggerReference = useRef<HTMLButtonElement>(null)
  const settingsTriggerReference = useRef<HTMLButtonElement>(null)
  const { exportColors, fontSize } = useSettings()
  const previewReference = useRef<HTMLDivElement>(null)
  const inputReference = useRef<HTMLTextAreaElement>(null)

  const [debouncedInput] = useDebounce(input, 120)

  const { latex, error } = useMemo(() => parseExpression(debouncedInput), [debouncedInput])

  const renderedHtml = useMemo(() => {
    if (!latex) return ''
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true, output: 'html' })
    } catch {
      return ''
    }
  }, [latex])

  const handleCopyLatex = useCallback(async () => {
    if (!latex) return
    try {
      await navigator.clipboard.writeText(latex)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1500)
    } catch (error_) {
      console.error('Clipboard copy failed:', error_)
    }
  }, [latex])

  const applyExportColor = useCallback(
    (element: HTMLElement) => {
      element.style.color = exportColors.text
      for (const child of element.querySelectorAll<HTMLElement>('.katex, .katex *'))
        child.style.color = exportColors.text
    },
    [exportColors.text],
  )

  const clearExportColor = useCallback((element: HTMLElement) => {
    element.style.color = ''
    for (const child of element.querySelectorAll<HTMLElement>('.katex, .katex *'))
      child.style.color = ''
  }, [])

  const handleExportPng = useCallback(async () => {
    if (!previewReference.current || !latex) return
    try {
      applyExportColor(previewReference.current)
      const dataUrl = await toPng(previewReference.current, {
        pixelRatio: exportDpi,
        backgroundColor: exportColors.background,
        skipFonts: true,
      })
      clearExportColor(previewReference.current)
      const link = Object.assign(document.createElement('a'), {
        download: 'equation.png',
        href: dataUrl,
      })
      link.click()
    } catch (error_) {
      clearExportColor(previewReference.current!)
      console.error('PNG export failed:', error_)
    }
  }, [latex, exportDpi, exportColors, applyExportColor, clearExportColor])

  const handleExportSvg = useCallback(async () => {
    if (!previewReference.current || !latex) return
    try {
      applyExportColor(previewReference.current)
      const dataUrl = await toSvg(previewReference.current, {
        backgroundColor: exportColors.background,
        skipFonts: true,
      })
      clearExportColor(previewReference.current)
      const link = document.createElement('a')
      link.download = 'equation.svg'
      link.href = dataUrl
      link.click()
    } catch (error_) {
      clearExportColor(previewReference.current!)
      console.error('SVG export failed:', error_)
    }
  }, [latex, exportColors, applyExportColor, clearExportColor])

  // Register keyboard shortcuts
  useHotkeys([
    { hotkey: 'Mod+Shift+C', description: 'Copy LaTeX', action: handleCopyLatex },
    { hotkey: 'Mod+Shift+P', description: 'Export PNG', action: handleExportPng },
    { hotkey: 'Mod+Shift+S', description: 'Export SVG', action: handleExportSvg },
    { hotkey: 'Mod+K', description: 'Focus input', action: () => inputReference.current?.focus() },
    {
      hotkey: 'Shift+S',
      description: 'Open Settings',
      action: () => settingsTriggerReference.current?.click(),
    },
    {
      hotkey: 'Mod+/',
      description: 'Open Help',
      action: () => helpTriggerReference.current?.click(),
    },
  ])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background select-none md:flex-row">
      {/* Skip to content link for a11y */}
      <a
        href="#math-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to input
      </a>

      {/* Input Panel */}
      <section
        className="flex flex-1 flex-col border-border p-6 md:border-r md:p-10"
        aria-label="Expression input"
      >
        <div className="mb-3 flex items-center justify-between">
          <Label htmlFor="math-input">Expression</Label>
          <div className="flex items-center gap-1">
            <SettingsDialog ref={settingsTriggerReference} />
            <HelpDialog ref={helpTriggerReference} />
          </div>
        </div>
        <textarea
          ref={inputReference}
          id="math-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g. 2/(4*4) or sin(theta)^2 + cos(theta)^2"
          className="w-full flex-1 resize-none border border-input bg-card p-4 font-mono text-base text-foreground transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none md:text-lg"
          spellCheck={false}
          autoComplete="off"
          aria-describedby="parse-error"
          aria-invalid={!!error}
        />
        <div id="parse-error" className="mt-2 h-5" aria-live="polite" role="alert">
          {error && <span className="text-sm font-medium text-destructive">{error}</span>}
        </div>
      </section>

      {/* Preview Panel */}
      <section className="flex flex-1 flex-col p-6 md:p-10" aria-label="Equation preview">
        {/* Centered preview */}
        <div
          ref={previewReference}
          className="flex flex-1 items-center justify-center px-4"
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
            <span className="text-lg text-muted-foreground italic">
              {input ? 'Parsing…' : 'Your equation will appear here'}
            </span>
          )}
        </div>

        {/* Actions — single row */}
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          role="toolbar"
          aria-label="Export actions"
        >
          {/* Primary: Copy LaTeX */}
          <Button
            onClick={handleCopyLatex}
            disabled={!latex}
            title={`Copy LaTeX (${formatShortcut('Mod+Shift+C')})`}
          >
            {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copyState === 'copied' ? 'Copied!' : 'Copy LaTeX'}</span>
          </Button>

          {/* PNG + DPI inline group */}
          <div className="flex items-center" role="group" aria-label="PNG export with resolution">
            <Button
              onClick={handleExportPng}
              disabled={!latex}
              title={`Export PNG (${formatShortcut('Mod+Shift+P')})`}
              className="rounded-r-none border-r-0"
            >
              <Image size={14} />
              <span>PNG</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!latex}
                  className="rounded-l-none px-2.5"
                  aria-label={`Resolution: ${exportDpi}x DPI`}
                >
                  {exportDpi}x
                  <ChevronDown size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[1, 2, 3, 4].map((dpi) => (
                  <DropdownMenuItem
                    key={dpi}
                    onClick={() => setExportDpi(dpi)}
                    className={dpi === exportDpi ? 'font-bold text-primary' : ''}
                  >
                    {dpi}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* SVG */}
          <Button
            variant="outline"
            onClick={handleExportSvg}
            disabled={!latex}
            title={`Export SVG (${formatShortcut('Mod+Shift+S')})`}
          >
            <FileCode size={14} />
            <span>SVG</span>
          </Button>
        </div>

        {/* LaTeX output */}
        {latex && (
          <div className="mt-4 w-full">
            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              LaTeX Output
            </p>
            <div className="relative">
              <code className="block border border-border bg-card p-3 font-mono text-sm break-all text-foreground select-text">
                {latex}
              </code>
              <CopyButton
                content={latex}
                variant="outline"
                className="absolute top-1/2 right-2 -translate-y-1/2"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
