// Service worker Siswaku.
// Strategi: ambil dari internet dulu (supaya selalu versi terbaru), cadangan dari cache kalau offline.
// Data siswa ada di Firebase, jadi permintaan ke Firebase tidak pernah disimpan.
const NAMA_CACHE = 'siswaku-v2';
const FILE_DASAR = ['./', 'index.html', 'KaryaAkhir.js', 'firebase-config.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(NAMA_CACHE).then((c) => c.addAll(FILE_DASAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nama) => Promise.all(nama.filter((n) => n !== NAMA_CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // hanya file milik sendiri; Firebase, Firestore, dan CDN dibiarkan langsung ke internet
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const salinan = res.clone();
        caches.open(NAMA_CACHE).then((c) => c.put(req, salinan));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});