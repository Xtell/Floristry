const gulp = require('gulp');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sync = require('browser-sync');
const del = require('del');
const newer = require('gulp-newer');
const libsJs = ['node_modules/picturefill/dist/picturefill.min.js'];

/* HTML */

const html = () => {
  return gulp
    .src('./src/index.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      }),
    )
    .pipe(gulp.dest('build'))
    .pipe(sync.stream())
};
exports.html = html;

/* Browser-sync */

const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: 'build'
    }
  });
};
exports.server = server;

/* Styles */

const styles = () => {
  return gulp
    .src('./src/styles/index.css')
    .pipe(
      postcss([
        require('postcss-import'),
        require('postcss-media-minmax'),
        require('autoprefixer'),
        require('postcss-csso')
      ]),
    )
    .pipe(rename('index.min.css'))
    .pipe(gulp.dest('build/styles'))
    .pipe(sync.stream())
};
exports.styles = styles;

/* Scripts */

const jsLibs = () => {
  return gulp.src(libsJs).pipe(concat('libs.js')).pipe(gulp.dest('./tmp'));
};
const jsBabel = () => {
  return gulp
    .src('./src/scripts/index.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      }),
    )
    .pipe(gulp.dest('./tmp'));
};
const jsConcat = () => {
  return gulp
    .src(['./tmp/libs.js', './tmp/index.js'])
    .pipe(concat('index.js'))
    .pipe(terser())
    .pipe(rename('index.min.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(sync.stream())
};
exports.jsConcat = jsConcat;

const scripts = gulp.series(gulp.parallel(jsLibs, jsBabel), jsConcat);
exports.scripts = scripts;

/* Images */

const images = () => {
  return gulp.src('./src/images/*.*')
  .pipe(gulp.dest('build/images'))
}
exports.images = images;

/* Watch */

const watch = () => {
  gulp.watch('src/*.html', gulp.series(html));
  gulp.watch('src/styles/**/*.css', gulp.series(styles));
  gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
  gulp.watch('src/fonts/**/*.{woff,woff2}', gulp.series(copy));
  gulp.watch('src/images/**/*', gulp.series(images))
}

const clear = () => {
  return del('build');
}
exports.clear = clear;

const copy = () => {
  return gulp.src('./src/fonts/**/*.{woff,woff2}')
    .pipe(newer('build/fonts'))
    .pipe(gulp.dest('build/fonts'))
}
exports.copy = copy;

exports.default = gulp.series(clear, gulp.parallel(styles, scripts, html, copy, images), gulp.parallel(watch, server));

