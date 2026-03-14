import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/animate-ui/components/radix/dialog'
import { Switch } from '@/components/animate-ui/components/radix/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/animate-ui/components/radix/toggle-group'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSettings } from '@/contexts/settings-context'
import { formatShortcut } from '@/hooks/use-hotkeys'
import { Download, Moon, Palette, Settings, Sun, Type } from 'lucide-react'
import { forwardRef } from 'react'

const fontSizes = [
  { value: '1', label: 'S' },
  { value: '1.5', label: 'M' },
  { value: '2', label: 'L' },
  { value: '2.5', label: 'XL' },
  { value: '3', label: '2XL' },
]

const SettingsDialog = forwardRef<HTMLButtonElement>(function SettingsDialog(_, reference) {
  const {
    darkMode,
    setDarkMode,
    exportColors,
    setExportColors,
    fontSize,
    setFontSize,
    implicitMul,
    setImplicitMul,
    canInstall,
    installPwa,
  } = useSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          ref={reference}
          variant="ghost"
          size="sm"
          aria-label="Open settings"
          title={`Settings (${formatShortcut('Shift+S')})`}
        >
          <Settings size={12} />
          <Kbd className="hidden sm:flex">{formatShortcut('Shift+S')}</Kbd>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm border border-border bg-card p-0 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-border px-6 py-4">
          <Settings size={18} className="text-muted-foreground" />
          <DialogTitle className="text-sm font-bold tracking-[0.15em] uppercase">
            Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Adjust appearance, export colors, preview size, and install options.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {/* Dark Mode */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="dark-mode-switch"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                {darkMode ? (
                  <Moon size={16} className="text-muted-foreground" />
                ) : (
                  <Sun size={16} className="text-muted-foreground" />
                )}
                Dark Mode
              </Label>
              <Switch id="dark-mode-switch" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>

          {/* Implicit Multiplication */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="implicit-mul-switch" className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Multiplication Dot</span>
                <span className="text-xs text-muted-foreground">
                  {implicitMul === 'cdot' ? '2x → 2 · x' : '2x → 2x'}
                </span>
              </Label>
              <Switch
                id="implicit-mul-switch"
                checked={implicitMul === 'cdot'}
                onCheckedChange={(checked) => setImplicitMul(checked ? 'cdot' : 'none')}
              />
            </div>
          </div>

          {/* Export Colors */}
          <div className="space-y-3 border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Export Colors</span>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="export-bg"
                className="text-xs tracking-wider text-muted-foreground uppercase"
              >
                Background
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="export-bg"
                  type="color"
                  value={exportColors.background}
                  onChange={(e) => setExportColors({ ...exportColors, background: e.target.value })}
                  className="h-8 w-8 cursor-pointer border border-border bg-transparent"
                />
                <code className="w-16 font-mono text-xs text-muted-foreground">
                  {exportColors.background}
                </code>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="export-text"
                className="text-xs tracking-wider text-muted-foreground uppercase"
              >
                Text
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="export-text"
                  type="color"
                  value={exportColors.text}
                  onChange={(e) => setExportColors({ ...exportColors, text: e.target.value })}
                  className="h-8 w-8 cursor-pointer border border-border bg-transparent"
                />
                <code className="w-16 font-mono text-xs text-muted-foreground">
                  {exportColors.text}
                </code>
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3 border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Preview Size</span>
            </div>
            <ToggleGroup
              value={String(fontSize)}
              type="single"
              variant="outline"
              size="lg"
              onValueChange={(v) => {
                if (v) setFontSize(Number(v))
              }}
            >
              {fontSizes.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} aria-label={`Font size ${s.label}`}>
                  {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Install PWA */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Download size={16} className="text-muted-foreground" />
                Install App
              </Label>
              <Button
                size="sm"
                onClick={installPwa}
                disabled={!canInstall}
                className="text-xs font-semibold tracking-wider uppercase"
              >
                {canInstall ? 'Install' : 'Installed'}
              </Button>
            </div>
            {!canInstall && (
              <p className="mt-2 text-xs text-muted-foreground">
                Already installed or not available in this browser. Try Chrome or Edge.
              </p>
            )}
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

export default SettingsDialog
