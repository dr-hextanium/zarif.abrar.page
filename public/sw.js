// caches the site in the visitor's browser. files under /_astro/ have a content hash in their
// name and never change, so they come from the cache with no request. everything else goes to
// the network first, so a deploy shows up at once, and falls back to the cache when offline.
// looking.json and other sites' apis are left alone.
const CACHE = "site";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname === "/looking.json") return;

  const save = (res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  };

  if (url.pathname.startsWith("/_astro/")) {
    e.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then(save)));
  } else {
    e.respondWith(fetch(req).then(save, () => caches.match(req).then((hit) => hit ?? Response.error())));
  }
});
