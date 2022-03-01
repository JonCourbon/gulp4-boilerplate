const { src, dest, watch, series, parallel } = require("gulp");
const gulp = require("gulp");
const plugins = require("gulp-load-plugins")();
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const browserSync = require("browser-sync");
var autoprefixer = require("autoprefixer");
const purgecss = require('@fullhuman/postcss-purgecss');
var cssnano = require("cssnano");
const imagemin = require("gulp-imagemin");
var imageResize = require('gulp-image-resize');
const svgo = require('gulp-svgo');
const cache = require('gulp-cache');



function style() {
  return src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.postcss(
      [
        purgecss({
          content: ['./src/**/*.html'],
          safelist: []
        }),
        autoprefixer(),
        cssnano({ safe: true })
    ]))
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
// Copies all fonts files
const fonts =() =>
    src("src/fonts/*")
    .pipe(plugins.plumber())
    .pipe(gulp.dest("./dist/fonts/"));
    
const cleanAll = () => del(["./dist", "./node_modules"]);

const image = () =>
  gulp
    .src("./src/images/**/*.{jpg,jpeg,png}")
    .pipe(svgo())
    .pipe(imageResize({ width: 1000,upscale : false }))
    .pipe(imagemin())
    .pipe(plugins.webp())
    .pipe(dest("./dist/images"));
    
const imageSVG = () =>
  gulp
    .src("./src/images/**/*.{svg}")
    .pipe(svgo())
    .pipe(dest("./dist/images"));

function clearCache(done) {
  return cache.clearAll(done);
}


function watchFiles() {
  browserSync.init({
    server: "./dist",
  });

  watch("./src/scss/*.scss", style).on("change",clearCache, browserSync.reload);
  watch("./src/*.html", html).on("change", clearCache,browserSync.reload);
  watch("./src/scripts/*.js", script).on("change", clearCache,browserSync.reload);
  watch("./src/image/*", image).on("change", clearCache,browserSync.reload);
}

const start = series(clean, parallel(html, fonts, style, script, image,imageSVG), watchFiles);
const build = series(clean, parallel(html, fonts, style, script, image,imageSVG));
const images= series(image,imageSVG);

exports.style = style;
exports.script = script;
exports.images = images;
exports.html = html;
exports.fonts = fonts;
exports.clean = clean;
exports.start = start;
exports.cleanAll= cleanAll;
exports.build = build;
