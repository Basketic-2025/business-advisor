const APP_CACHE = "aihustler-shell-v39";
const DATA_CACHE = "aihustler-data-v39";
const APP_SHELL = [
  "/",
  "/web/index.html",
  "/web/styles.css",
  "/web/main.js",
  "/web/modules/tabs.js",
  "/web/i18n/en.js",
  "/web/modules/advisor.js",
  "/web/modules/plan.js",
  "/web/modules/financeTips.js",
  "/web/modules/cashflow.js",
  "/public/manifest.webmanifest",
  "/public/icons/icon-192.png",
  "/public/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![APP_CACHE, DATA_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (
      url.pathname.startsWith("/api/advice") ||
      url.pathname.startsWith("/api/plan")
    ) {
      event.respondWith(networkFirst(request, false, true));
    } else {
      event.respondWith(networkFirst(request, true));
    }
    return;
  }

  if (APP_SHELL.includes(url.pathname) || request.destination === "document") {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "cashflow-sync") {
    event.waitUntil(
      self.clients
        .matchAll({ includeUncontrolled: true, type: "window" })
        .then((clients) => {
          clients.forEach((client) =>
            client.postMessage({ type: "cashflow-sync" }),
          );
        }),
    );
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, shouldCache = false, isAI = false) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (shouldCache) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    if (isAI) {
      return new Response(
        JSON.stringify({ error: "Offline: AI advisor unavailable." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    throw error;
  }
}
