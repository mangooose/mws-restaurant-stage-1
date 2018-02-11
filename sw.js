/*Service worker*/
const CACHE_NAME = "restaurant_reviewer_v2";
const urlsToCache = [
  "/",
  "index.html",
  "/restaurant.html",
  "/manifest.json",
  "css/styles.css",
  "js/dbhelper.js",
  "js/main.js",
  "js/idb.js",
  "js/restaurant_info.js",
  "js/lazysizes.min.js"
];

const allCaches = [CACHE_NAME];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);

  if (
    requestUrl.pathname.indexOf("img") > -1 ||
    requestUrl.pathname.indexOf("restaurants") > -1
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            fetchAndCache(event, cache);
            return response;
          } else {
            return fetchAndCache(event, cache);
          }
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

function fetchAndCache(event, cache) {
  return fetch(event.request.clone()).then(response => {
    if (response.status < 400) {
      cache.put(event.request, response.clone());
    }
    return response;
  });
}

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName.startsWith("restaurant_reviewer") &&
              !allCaches.includes(cacheName)
            );
          })
          .map(cacheName => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener("message", event => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
