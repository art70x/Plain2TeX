import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface ExportColors {
  background: string;
  text: string;
}

interface Settings {
  darkMode: boolean;
  exportColors: ExportColors;
  fontSize: number;
}

interface SettingsContextValue extends Settings {
  setDarkMode: (v: boolean) => void;
  setExportColors: (c: ExportColors) => void;
  setFontSize: (v: number) => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  canInstall: boolean;
  installPwa: () => Promise<void>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'eq-settings';

const defaults: Settings = {
  darkMode: false,
  exportColors: { background: '#F8F8F8', text: '#1A1A1A' },
  fontSize: 2,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPwa = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const setDarkMode = (v: boolean) => setSettings((s) => ({ ...s, darkMode: v }));
  const setExportColors = (c: ExportColors) => setSettings((s) => ({ ...s, exportColors: c }));
  const setFontSize = (v: number) => setSettings((s) => ({ ...s, fontSize: v }));

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setDarkMode,
        setExportColors,
        setFontSize,
        deferredPrompt,
        canInstall,
        installPwa,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
