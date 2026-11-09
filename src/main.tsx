import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runEngineChecks } from './sim/verify'

if (import.meta.env.DEV) {
  try {
    const result = runEngineChecks()
    console.info('[motor] comprobaciones superadas', result)
  } catch (error) {
    console.error('[motor] comprobaciones fallidas', error)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
