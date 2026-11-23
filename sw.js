/**
 * Service Worker - سجل الدرجات الذكي (PWA Offline Cache - v9.4)
 */

const CACHE_NAME = 'grades-v9.4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './license-guard.js',
  './icon.png',
  './icon.ico',
  './manifest.json',
  './xlsx.full.min.js'
];

// 1. التثبيت والتخزين المسبق للملفات المحلية
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. التفعيل وإزالة النسخ القديمة من الكاش فوراً وتنفيذ clients.claim()
self.addEventListener('activate', (event) => {
  self.skipWaiting();
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

// استقبال رسائل التحديث الفوري
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. إدارة الطلبات: استراتيجية Network First للملفات الرئيسية لضمان التحديث التلقائي
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // استثناء خادم الواتساب السحابي ومكتبات cdnjs تماماً ليمروا للشبكة مباشرة (NetworkOnly)
  if (url.hostname.includes('onrender.com') || url.hostname.includes('cdnjs.cloudflare.com')) {
    return; // تمرير مباشر للشبكة دون اعتراض من الكاش
  }

  // استراتيجية Network First للملفات الرئيسية (HTML و Manifest و التنقل) للتحديث التلقائي الفوري
  const isMainAsset = req.mode === 'navigate' ||
                      url.pathname.endsWith('/index.html') ||
                      url.pathname.endsWith('/') ||
                      url.pathname.endsWith('/manifest.json');

  if (isMainAsset) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || (req.headers.get('accept') && req.headers.get('accept').includes('text/html') ? caches.match('./index.html') : null);
          });
        })
    );
    return;
  }

  // بقية الملفات الثابتة (أيقونات، مكتبات محلية): Cache First مع التخزين في الخلفية
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
