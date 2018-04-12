let restaurant;
const reviews = [];
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

initReviews = _ => {
  const id = getParameterByName('id');
  DBHelper.fetchReviewsByRestoId(id)
  .then( reviews => {
    console.log(reviews)
      self.reviews = reviews;
      if (!reviews) {
        console.error(reviews);
        return;
      }  
        // fill reviews
      fillReviewsHTML();
    }
  );
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.tabIndex = 0;
  const favorite = restaurant.is_favorite === "true"? '&starf;': '&star;';

  name.innerHTML = `${restaurant.name} <span class="star" data-is-favorite="${restaurant.is_favorite}" onclick="toggleFavorite()" >${favorite}</span>`;
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.tabIndex = 0;

  const picture = document.getElementById('restaurant-img');
  const img = document.createElement('img'); 
  const source = document.createElement('source');

  source.srcset = `${DBHelper.imageUrlForRestaurant(restaurant).replace('.jpg','_small.webp')} 375w, ${DBHelper.imageUrlForRestaurant(restaurant).replace('.jpg','_medium.webp')} 480w, ${DBHelper.imageUrlForRestaurant(restaurant).replace('.jpg','_large.webp')} 800w  `;
  source.alt = `${restaurant.name} restaurant`;
  img.alt = `${restaurant.name} restaurant`;
  picture.tabIndex = 0;
  img.src = DBHelper.imageUrlForRestaurant(restaurant);
  picture.appendChild(source);
  picture.appendChild(img);


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.tabIndex = 0;
  cuisine.innerHTML = `${restaurant.cuisine_type}`;
  cuisine.setAttribute('aria-label', `cuisine type ${restaurant.cuisine_type}`);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  initReviews();
  // create rewview form html
  createReviewFormHTML();

}

toggleFavorite = _ => {
  const favorite = document.getElementsByClassName('star')[0];
  const isFav = favorite.dataset.isFavorite === "true";
  const id = getParameterByName('id');

  favorite.dataset.isFavorite = !isFav
  
  if(!isFav){
    favorite.innerHTML = '&starf;'
  } else {
    favorite.innerHTML = '&star;'
  }
  DBHelper.setFavorite(id, !isFav)
  .then(data=> console.log(data))
  .catch(e=>{console.log(e)});
  
}

createFormGroup = (name, type) => {
     const formGroup = document.createElement('div');
     formGroup.className = 'form-group';

     const label = document.createElement('label');
     label.innerText = name;
     label.setAttribute('for', name);
     formGroup.appendChild(label);

     let input = document.createElement('input');
   
     if(type === 'textarea') {
        input = document.createElement('textarea');
     }

     input.type= type;
     input.id = name;
     input.required = true;
     formGroup.appendChild(input);
     return formGroup;
}

submitReviewForm = _ => {
  const rating = document.getElementById('Rating').value;
  const name = document.getElementById('Name').value;
  const comments = document.getElementById('Comment').value;
  const review = {rating,name,comments};
  const noReviews = document.getElementById('noReviews');
  const ul = document.getElementById('reviews-list');
  
  review.restaurant_id = parseInt(getParameterByName('id'));
  if(noReviews){
      noReviews.parentNode.removeChild(noReviews);
    }  
  return DBHelper.createNewReview(review)
  .then(newReview=> {
    ul.appendChild(createReviewHTML(newReview));
    return false
  })  
  .catch(e => {
    const newReview = review;
    newReview.createdAt = new Date();
    ul.appendChild(createReviewHTML(newReview));
  })
}

createReviewFormHTML = _ => {
  const container = document.getElementById('reviews-container');
  const form = document.createElement('form');
  form.onsubmit = evt => {
      evt.preventDefault();
      submitReviewForm();
     return false;
  }
  form.className = 'review-form';

  const title = document.createElement('h3');
  title.tabIndex = 0;
  title.innerHTML = 'Add your Review';
  container.appendChild(title);
  
  const ratingForm = createFormGroup('Rating', 'number');
  ratingForm.childNodes[1].max = 5;
  ratingForm.childNodes[1].min = 1;
  form.appendChild(ratingForm);
  form.appendChild(createFormGroup('Name', 'text'));
  form.appendChild(createFormGroup('Comment', 'textarea'));
  form.appendChild(createFormGroup('Submit', 'submit'));

  container.appendChild(form);  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.tabIndex = 0;

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.id = 'noReviews';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  //container.appendChild(ul);
  const title = document.getElementById('reviews-title');
  title.parentNode.insertBefore(ul, title.nextSibling);
}

formatDate = (date) => {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const title = document.createElement('div');
  title.tabIndex = 0;
  const body = document.createElement('div');

  title.className = 'reviews-item-title';
  body.className = 'reviews-item-body';

  const name = document.createElement('p');
  name.innerHTML = review.name;
  title.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = formatDate(review.createdAt);
  title.appendChild(date);
  li.appendChild(title);

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = 0;
  rating.setAttribute('aria-label', `Rating: ${review.rating}`);

  body.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = 0;
  body.appendChild(comments);
  li.appendChild(body);
  
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current','page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
