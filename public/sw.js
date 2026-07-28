const CACHE_PREFIX = 'riagro-crm-v3'
const CACHE_VERSION = 'rc1'
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', OFFLINE_URL, '/manifest.webmanifest', '/favicon.svg'])
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached

        if (request.mode === 'navigate') {
          const offline = await caches.match(OFFLINE_URL)
          if (offline) return offline
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' })
      })
  )
})
