/*Service worker*/

var CACHE_NAME = "restaurant_reviewer_v1";
var urlsToCache = [
  "/",
  "index.html",
  "/restaurant.html",
  "css/styles.css",
  "js/dbhelper.js",
  "js/main.js",
  "js/restaurant_info.js",
];

var allCaches = [CACHE_NAME];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener("fetch", function(event) {
  const requestUrl = new URL(event.request.url);

  if (
    requestUrl.pathname.indexOf("img") > -1 ||
    requestUrl.pathname.indexOf("data") > -1
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
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
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});

function fetchAndCache(event, cache) {
  return fetch(event.request.clone()).then(function(response) {
    if (response.status < 400) {
      cache.put(event.request, response.clone());
    }
    return response;
  });
}

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return (
              cacheName.startsWith("restaurant_reviewer") &&
              !allCaches.includes(cacheName)
            );
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener("message", function(event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
