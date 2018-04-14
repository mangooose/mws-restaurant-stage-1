const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');


gulp.task('images', function () {
  return gulp.src('img/*.{jpg,png}')
    .pipe($.responsive({
      '*.jpg': [{
        width: 375,
        rename: { suffix: '_small', extname: '.webp', },
      }, {
        width: 480,
        rename: { suffix: '_medium', extname: '.webp', },
      }, {
        width: 800,
        rename: { suffix: '_large', extname: '.webp', },
      }, {
        rename: { suffix: '_original', extname: '.webp',},
      }]
    }, {
      quality: 70,

      progressive: true,

      withMetadata: false,
    }))
    .pipe(gulp.dest('img'));
});

gulp.task('minify-css', () => {
  return gulp.src('css/styles.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'));
});