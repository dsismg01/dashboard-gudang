// Service worker dashboard gudang: tampilan (index.html, ikon) disimpan supaya aplikasi bisa di-install
// dan tetap terbuka walau sinyal putus. Data stok TIDAK disimpan di sini: selalu diambil baru dari Google dengan PIN.
const CACHE = 'gudang-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;  // data Google: langsung ke jaringan
  // jaringan dulu (selalu versi terbaru), cadangan dari cache bila offline
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok) { const salin = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, salin)); }
    return res;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
});
