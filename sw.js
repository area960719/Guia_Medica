// Service worker de la Guía de salud: guarda la página para abrirla sin internet.
// Los datos de la guía los guarda index.html en el teléfono (localStorage).
const CACHE = "guia-medica-v2";
const ARCHIVOS = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado (rápido, sirve sin internet); en segundo plano se actualiza.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(guardado => {
      const red = fetch(req).then(r => {
        if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return r;
      }).catch(() => guardado);
      return guardado || red;
    })
  );
});
