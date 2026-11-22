/**
 * Service Worker - سجل الدرجات الذكي (PWA Offline Cache)
 */

const CACHE_NAME = 'aldragat-pwa-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './license-guard.js',
  './icon.png',
  './icon.ico',
  './manifest.json'
];

// 1. التثبيت والتخزين المسبق للملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. التفعيل وإزالة النسخ القديمة من الكاش
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. استراتيجية Cache First للعمل الأوفلاين الكامل
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // تجاهل الطلبات غير القابلة للتخزين (مثل دوال غير GET)
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // إذا لم يكن في الكاش، اطلبه من الشبكة ثم خزنه للمستقبل (خطوط، أيقونات... إلخ)
      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          // في حال الموارد عبر النطاقات (CORS opaque كالخطوط)، نخزنها أيضاً
          if (networkResponse && (networkResponse.type === 'opaque' || networkResponse.status === 200)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // إذا كان الجهاز غير متصل وفشل الطلب وكان التنقل لصفحة HTML، أعد الصفحة الرئيسية
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
