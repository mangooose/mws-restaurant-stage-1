/*Service worker*/
// TODO notification
self.importScripts("./js/idb.js");

const dbPromise = idb.open("restaurants-db", 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      var restaurantsStore = upgradeDb.createObjectStore("restaurants", {
        keyPath: "id",
        autoIncrement: true
      });
      var ReviewsStore = upgradeDb.createObjectStore("reviews", {
        keyPath: "id",
        autoIncrement: true
      });
      var createdReviews = upgradeDb.createObjectStore("createdReviews", {
        keyPath: "id",
        autoIncrement: true
      });
  }
});

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

self.addEventListener("sync", event => {
  if (event.tag === "createReview") {
    dbPromise
      .then(db => {
        return db
          .transaction("createdReviews")
          .objectStore("createdReviews")
          .getAll();
      })
      .then(reviews => {
        const reviewPromises = [];
        for (const review of reviews) {
          const { rating, name, comments, restaurant_id, createdAt } = review;
          reviewPromises.push(
            createReview({ rating, name, comments, restaurant_id, createdAt })
          );
        }
        return Promise.all(reviewPromises);
      })
      .then(reviews => {
        return dbPromise.then(db => {
          const tx = db.transaction("createdReviews", "readwrite");
          tx.objectStore("createdReviews").clear();
          return tx.complete;
        });
      })
      .catch(e => {
        console.log(e);
      });
    //event.waitUntil(createReview(review));
  }
  console.log("sync event fired", event);
});

self.addEventListener("message", event => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

/*       DBHelper.postAjax(`http://localhost:${1337}/reviews/`, review)
        .then(data => {
          resolve(JSON.parse(data));
          console.log("data", data);
        })
        .catch(e => {
          console.log(e);
          reject(e);
        }); */

function createReview(review) {
  return fetch(`http://localhost:${1337}/reviews/`, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(review)
  })
    .then(res => res.json())
    .then(res => console.log(res));
}
