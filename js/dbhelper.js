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

/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static fetchFromURL(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = _ => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(xhr.status);
        }
      };
      xhr.onerror = e => {
        console.log(e);
        reject(e);
      };
      xhr.send();
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    if (!navigator.onLine) {
      return dbPromise
        .then(db => {
          return db
            .transaction("restaurants")
            .objectStore("restaurants")
            .getAll();
        })
        .then(allRestaurants => callback(null, allRestaurants));
    }
    DBHelper.fetchFromURL(DBHelper.DATABASE_URL)
      .then(restaurants => {
        dbPromise
          .then(db => {
            const tx = db.transaction("restaurants", "readwrite");
            const restaurantsStore = tx.objectStore("restaurants");

            for (const restaurant of restaurants) {
              console.log(restaurant);
              restaurantsStore.put(restaurant);
            }
            return tx.complete;
          })
          .then(_ => {
            callback(null, restaurants);
            console.log("restaurants added");
          });
      })
      .catch(e => {
        callback(e, null);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    if (!navigator.onLine) {
      return dbPromise
        .then(db => {
          return db
            .transaction("restaurants")
            .objectStore("restaurants")
            .get(parseInt(id));
        })
        .then(restaurant => callback(null, restaurant));
    }
    // fetch all restaurants with proper error handling.
    DBHelper.fetchFromURL(`${DBHelper.DATABASE_URL}/${id}`)
      .then(restaurant => {
        callback(null, restaurant);
      })
      .catch(error => {
        callback(error, null);
      });
  }

  static fetchReviewsByRestoId(id) {
    if (!navigator.onLine) {
      return dbPromise
        .then(db => {
          return db
            .transaction("reviews")
            .objectStore("reviews")
            .getAll();
        })
        .then(
          reviews =>
            reviews.filter(
              review => review.restaurant_id == id
            ) /* callback(null, restaurant) */
        );
    }
    return DBHelper.fetchFromURL(
      `http://localhost:${1337}/reviews/?restaurant_id=${id}`
    )
      .then(reviews => {
        return dbPromise.then(db => {
          const tx = db.transaction(["reviews"], "readwrite");
          const reviewsStore = tx.objectStore("reviews");

          for (const review of reviews) {
            reviewsStore.put(review);
          }
          return reviews;
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  /**
   * TODO
   * awal 7aja nloadiw l reviews mel indexeddb when offline
   * ba3d e submit ken online ab3ath ken offline wela request timeout sajal felindexeddb w kif t7ell lcnx thabat fel reviews w zeyed ab3thou
   */
  static createNewReview(review) {
    //return new Promise((resolve, reject) => {
    console.log(review);
    return dbPromise
      .then(db => {
        const tx = db.transaction("reviews", "readwrite");
        const reviewsStore = tx.objectStore("reviews");
        reviewsStore.put(review);
        return dbPromise;
      })
      .then(db => {
        const tx = db.transaction("createdReviews", "readwrite");
        const reviewsStore = tx.objectStore("createdReviews");
        reviewsStore.put(review);
        return navigator.serviceWorker.ready;
      })
      .then(swRegistration => {
        console.log("registered");
        localStorage.setItem("lastname", "Smith");
        return swRegistration.sync.register("createReview");
      })
      .finally(_ => {
        return review;
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
    // });
  }

  static postAjax(url, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
      xhr.onload = _ => {
        if (xhr.status == 200 || xhr.status == 201) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.status);
        }
      };
      xhr.onerror = _ => {
        reject(xhr.status);
      };
      xhr.send(JSON.stringify(data));
    });
  }

  static setFavorite(id, isFavorite) {
    //idb idb idb
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "PUT",
        `http://localhost:1337/restaurants/${id}/?is_favorite=${isFavorite}`
      );
      xhr.onreadystatechange = function() {
        if (xhr.readyState > 3 && xhr.status == 200) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.status);
        }
      };
      xhr.send();
    });
  }
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        console.log(restaurants);
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph) return `/img/${restaurant.photograph}.jpg`;
    return `/img/default.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
