import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import '@/index.css'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { registerServiceWorker } from '@/pwa/registerServiceWorker'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

void registerServiceWorker()
