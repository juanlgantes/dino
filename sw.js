const CACHE_NAME = 'dino-adventure-v18.3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './css/styles.css',
    './js/main.js',
    './js/games/RoboticsGame.js',
    './js/games/SimonGame.js',
    './js/games/ConnectDotsGame.js',
    './js/games/MusicGame.js',
    './js/games/CheckersGame.js',
    './js/games/SequenceGame.js',
    './js/games/SoccerGame.js',
    './js/games/DaysWeekGame.js',
    './js/games/SnakeGame.js',
    './js/games/PainterGame.js',
    './js/games/ClockGame.js',
    './js/games/MovementGame.js',
    './js/games/SurfGame.js',
    './js/games/MazeGame.js',
    './js/games/ParchisGame.js',
    './js/games/ArkanoidGame.js',
    './js/games/MemoryGame.js',
    './js/games/RecycleGame.js',
    './js/games/KartGame.js',
    './js/games/GooseGame.js',
    './js/games/FighterGame.js',
    './js/games/QuizGame.js',
    './js/games/ChessGame.js',
    './js/games/ConnectFourGame.js',
    './js/games/WhackGame.js',
    './js/core/activities.js',
    './js/core/constants.js',
    './js/core/ParentalGate.js',
    './js/core/Navigation.js',
    './js/core/AudioEngine.js',
    './js/core/App.js'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Caching assets');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Google Fonts) for now to be safe,
    // or try to cache them if possible. Let's stick to local first.
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request).then(
                    (networkResponse) => {
                        // Check if we received a valid response
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone response to cache it
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                );
            })
    );
});
