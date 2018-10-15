const babelify = require('babelify');
const bro = require('gulp-bro');
const concat = require('gulp-concat');
const gulp = require('gulp');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const uglifycss = require('gulp-uglifycss');

gulp.task('browserify', ['jquery-plugins'], () => gulp.src('js/index.js')
  .pipe(bro({
    transform: [
      babelify.configure({ presets: ['env'] }),
      ['uglifyify', { global: true }],
    ],
  }))
  .pipe(rename('bundle.min.js'))
  .pipe(gulp.dest('public/js')));

gulp.task('concat-css', () => gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css', 'css/style.css'])
  .pipe(concat('bundle.min.css'))
  .pipe(uglifycss({
    uglyComments: true,
  }))
  .pipe(gulp.dest('public/css')));

gulp.task('copy-fonts', () => gulp.src('node_modules/bootstrap/dist/fonts/**/*')
  .pipe(gulp.dest('public/fonts/')));

gulp.task('copy-images', () => gulp.src('img/**/*')
  .pipe(gulp.dest('public/img/')));

gulp.task('copy-index', () => gulp.src('index.html')
  .pipe(gulp.dest('public')));

gulp.task('jquery-plugins', () => gulp.src(['js/vendor/detectmobilebrowser.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'])
  .pipe(concat('jqueryplugins.js'))
  .pipe(insert.prepend('import jQuery from \'jquery\';'))
  .pipe(gulp.dest('js/')));

gulp.task('build', ['browserify', 'concat-css', 'copy-fonts', 'copy-images', 'copy-index']);
