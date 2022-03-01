const { src, dest, watch, series, parallel } = require("gulp");
const gulp = require("gulp");
const plugins = require("gulp-load-plugins")();
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const browserSync = require("browser-sync");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
const imagemin = require("gulp-imagemin");


function style() {
  return src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.postcss([autoprefixer(), cssnano()]))
    .pipe(plugins.concat("style.min.css"))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(dest("./dist/css/"))
    .pipe(browserSync.stream());   /*Streams are supported in Browsersync, so you can call reload at specific points during your tasks and all browsers will be informed of the changes. Because Browsersync only cares about your CSS when it's finished compiling - make sure you call .stream() after gulp.dest */
}

function script() {
  return src("src/scripts/*.js")
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(plugins.uglify())
    .pipe(plugins.concat("main.min.js"))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(dest("./dist/js/"));
}

const html = () => src("./src/*.html").pipe(dest("./dist"));
const clean = () => del(["./dist"]);

const image = () =>
  gulp
    .src("./src/images/*")
    .pipe(imagemin([
      pngquant({quality: [0.5, 0.5]}),
      mozjpeg({quality: 50})
    ]))
    .pipe(plugins.webp())
    .pipe(dest("./dist/images"));

function watchFiles() {
  browserSync.init({
    server: "./dist",
  });

  watch("./src/scss/*.scss", style).on("change", browserSync.reload);
  watch("./src/*.html", html).on("change", browserSync.reload);
  watch("./src/scripts/*.js", script).on("change", browserSync.reload);
  watch("./src/image/*", image).on("change", browserSync.reload);
}

const start = series(clean, parallel(html, style, script, image), watchFiles);

exports.style = style;
exports.script = script;
exports.image = image;
exports.html = html;
exports.clean = clean;
exports.start = start;
