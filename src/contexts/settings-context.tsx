import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import type { ParseOptions } from '@/lib/math-parser'

export interface ExportColors {
  background: string
  text: string
}

interface Settings {
  darkMode: boolean
  exportColors: ExportColors
  fontSize: number
  implicitMul: ParseOptions['implicitMul']
}

interface SettingsContextValue extends Settings {
  setDarkMode: (v: boolean) => void
  setExportColors: (c: ExportColors) => void
  setFontSize: (v: number) => void
  setImplicitMul: (v: ParseOptions['implicitMul']) => void
  // Install
  canInstall: boolean
  installPwa: () => Promise<void>
  // SW update lifecycle
  needRefresh: boolean
  offlineReady: boolean
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'eq-settings'

const defaults: Settings = {
  darkMode: false,
  exportColors: { background: '#f4f4f5', text: '#18181b' },
  fontSize: 2,
  implicitMul: 'cdot',
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return defaults
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  const deferredPromptReference = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url, registration) {
      console.info('SW registered:', url, registration)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      deferredPromptReference.current = event as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    const installedHandler = () => setCanInstall(false)
    globalThis.addEventListener('beforeinstallprompt', handler)
    globalThis.addEventListener('appinstalled', installedHandler)
    return () => {
      globalThis.removeEventListener('beforeinstallprompt', handler)
      globalThis.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const installPwa = useCallback(async () => {
    const prompt = deferredPromptReference.current
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      deferredPromptReference.current = null
      setCanInstall(false)
    }
  }, [])

  const setDarkMode = useCallback((v: boolean) => setSettings((s) => ({ ...s, darkMode: v })), [])
  const setExportColors = useCallback(
    (c: ExportColors) => setSettings((s) => ({ ...s, exportColors: c })),
    [],
  )
  const setFontSize = useCallback((v: number) => setSettings((s) => ({ ...s, fontSize: v })), [])
  const setImplicitMul = useCallback(
    (v: ParseOptions['implicitMul']) => setSettings((s) => ({ ...s, implicitMul: v })),
    [],
  )

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setDarkMode,
        setExportColors,
        setFontSize,
        setImplicitMul,
        canInstall,
        installPwa,
        needRefresh,
        offlineReady,
        updateServiceWorker,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be inside SettingsProvider')
  return context
}
