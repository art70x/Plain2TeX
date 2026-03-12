import App from '@/app.tsx'
import '@/main.css'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
)
