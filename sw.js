const CACHE_NAME = 'bikego-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/index.tsx',
  // React and libraries from CDN
  'https://esm.sh/react@^18.2.0',
  'https://esm.sh/react-dom@^18.2.0/client',
  'https://esm.sh/@react-google-maps/api@2.19.3',
  'https://esm.sh/react@^18.2.0/',
  'https://esm.sh/react-dom@^18.2.0/',
  // App component files
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/utils.ts',
  '/components/Login.tsx',
  '/components/Header.tsx',
  '/components/Map.tsx',
  '/components/BikeCard.tsx',
  '/components/QrScanner.tsx',
  '/components/RideStatus.tsx',
  '/components/RideSummary.tsx',
  '/components/LocationPanel.tsx',
  '/components/SideMenu.tsx',
  '/components/ProfileMenu.tsx',
  '/components/Modal.tsx',
  '/components/icons.tsx',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://rsms.me/inter/inter.css'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new service worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const promises = URLS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.url.includes('maps.googleapis.com')) {
    return; // Always go to network for Google Maps API
  }

  // Cache-first strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        return self.clients.claim(); // Take control of open clients
      });
    })
  );
});