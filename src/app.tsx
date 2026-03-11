import { SettingsProvider } from '@/contexts/settings-context.tsx'
import Index from '@/pages/index.tsx'
import NotFound from '@/pages/not-found.tsx'
import OgImage from '@/pages/og-image.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const App = () => (
  <SettingsProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/og" element={<OgImage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </SettingsProvider>
)

export default App
