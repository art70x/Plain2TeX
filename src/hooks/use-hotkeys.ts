import type { HotkeyOptions } from '@tanstack/react-hotkeys'
import { useHotkey, type RegisterableHotkey } from '@tanstack/react-hotkeys'

export interface Shortcut {
  /** TanStack Hotkeys string — e.g. 'Mod+Shift+C', 'Escape', 'Mod+/' */
  hotkey: RegisterableHotkey
  description: string
  action: () => void
  enabled?: boolean
}

/**
 * Shortcut definitions for the help dialog.
 * `Mod` maps to ⌘ on macOS and Ctrl on Windows/Linux automatically.
 */
export const shortcutDefinitions = [
  { hotkey: 'Mod+Shift+C', description: 'Copy LaTeX' },
  { hotkey: 'Mod+Shift+P', description: 'Export as PNG' },
  { hotkey: 'Mod+Shift+S', description: 'Export as SVG' },
  { hotkey: 'Mod+K', description: 'Focus input' },
  { hotkey: 'Mod+/', description: 'Open help' },
  { hotkey: 'Shift+S', description: 'Open settings' },
] as const

/**
 * Formats a hotkey string for UI display.
 * 'Mod+Shift+C' → 'Ctrl+Shift+C' (Windows) | '⌘⇧C' (Mac)
 */

/**
 * Registers an array of keyboard shortcuts via useHotkey.
 */
export function useHotkeys(shortcuts: Shortcut[]) {
  for (const s of shortcuts) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkey(s.hotkey, s.action, {
      enabled: s.enabled ?? true,
      // Smart ignoreInputs default: Mod+ combos and Escape fire inside inputs,
      // bare single-key shortcuts are suppressed — no override needed here.
    } satisfies HotkeyOptions)
  }
}

export { formatForDisplay as formatShortcut } from '@tanstack/react-hotkeys'
