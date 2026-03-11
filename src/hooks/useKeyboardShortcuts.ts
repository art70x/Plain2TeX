import { useEffect, useCallback } from 'react';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  /** If true, shortcut won't fire when a textarea/input is focused */
  skipInInput?: boolean;
}

export const SHORTCUT_DEFINITIONS = [
  { key: 'c', ctrl: true, shift: true, description: 'Copy LaTeX' },
  { key: 'p', ctrl: true, shift: true, description: 'Export PNG' },
  { key: 's', ctrl: true, shift: true, description: 'Export SVG' },
  { key: 'k', ctrl: true, description: 'Focus input' },
  { key: '/', ctrl: true, description: 'Toggle help' },
  { key: 'Escape', description: 'Close help' },
] as const;

export function formatShortcut(s: Pick<Shortcut, 'key' | 'ctrl' | 'shift' | 'alt'>): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const parts: string[] = [];
  if (s.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (s.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (s.alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(s.key === 'Escape' ? 'Esc' : s.key.toUpperCase());
  return parts.join(isMac ? '' : '+');
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = s.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (s.skipInInput) {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'TEXTAREA' || tag === 'INPUT') continue;
          }
          e.preventDefault();
          s.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
