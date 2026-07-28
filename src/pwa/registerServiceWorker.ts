const SW_URL = '/sw.js'

const notifyWaitingWorker = (registration: ServiceWorkerRegistration) => {
  if (!registration.waiting) return

  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
}

const registerInstallPrompt = () => {
  let deferredPrompt: Event | null = null

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    window.dispatchEvent(new CustomEvent('riagro:pwa-install-ready'))
  })

  window.addEventListener('riagro:pwa-install-trigger', async () => {
    if (!deferredPrompt) return
    const promptEvent = deferredPrompt as Event & { prompt: () => Promise<void> }
    await promptEvent.prompt()
    deferredPrompt = null
  })
}

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register(SW_URL)

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing
      if (!worker) return

      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          notifyWaitingWorker(registration)
        }
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    registerInstallPrompt()
  } catch {
    // Falha de SW nao deve bloquear app.
  }
}
