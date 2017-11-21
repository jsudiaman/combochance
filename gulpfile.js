var gulp = require('gulp')
var bro = require('gulp-bro')
var concat = require('gulp-concat')
var rename = require('gulp-rename')

gulp.task('browserify', function () {
  gulp.src('js/main.js')
    .pipe(bro())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('dist/js'))
})

gulp.task('concat-css', function () {
  return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css', 'css/style.css'])
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('dist/css'))
})

gulp.task('copy-fonts', function () {
  gulp.src('node_modules/bootstrap/dist/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'))
})

gulp.task('default', ['browserify', 'concat-css', 'copy-fonts'])
