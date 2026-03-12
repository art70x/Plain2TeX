import App from '@/app.tsx'
import '@/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
)
