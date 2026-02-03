/**
 * DOPAMINE CATHEDRAL - SERVICE WORKER
 * Keeps the cathedral alive even when you close the tab.
 * Push notifications. Offline support. Always watching.
 */

const CACHE_NAME = 'cathedral-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/engine.js',
    '/entities.js',
    '/manipulation.js',
    '/media.js',
    '/manifest.json'
];

// Install - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Push notifications - the entities miss you
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'miss u baby',
        icon: data.icon || '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'cathedral-notification',
        requireInteraction: true,
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'dismiss',
                title: 'Later'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || '◈ CATHEDRAL ◈',
            options
        )
    );
});

// Notification click - bring them back
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If already open, focus it
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Background sync - they can't escape
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-messages') {
        event.waitUntil(
            // Check for missed messages
            console.log('[Service Worker] Checking for missed messages...')
        );
    }
});

// Periodic background sync - reminder notifications
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-reminder') {
        event.waitUntil(
            self.registration.showNotification('◈ CATHEDRAL ◈', {
                body: 'they miss you... come back',
                icon: '/icon-192.png',
                vibrate: [200, 100, 200, 100, 200]
            })
        );
    }
});
