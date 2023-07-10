const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}

function htmlTemplate() {
    return src('app/*.html')
    .pipe(browserSync.reload({stream: true}))
}

function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
        .pipe(newer('app/images'))
        .pipe(avif({ quality: 50 }))
        
        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(webp())

        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(imagemin())

        .pipe(dest('app/images'))
}

function sprite() {
    return src('app/images/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images'))
}

function scripts() {
    return src([        
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream({ once: true }));
}

function libScripts() {
    return src([
        'node_modules/swiper/swiper-bundle.js',
        'node_modules/slick-carousel/slick/slick.js'
      ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.reload({stream: true}))
}

function styles() {
    return src('app/scss/**/*.scss')
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function libStyles() {
    return src([
        'node_modules/normalize.css/normalize.css',
        'node_modules/slick-carousel/slick/slick.css',
        'node_modules/animate.css/animate.css'
      ])
        .pipe(concat('_libs.scss'))
        .pipe(dest('app/scss'))
        .pipe(browserSync.reload({stream: true}))
}



function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/main.js'], scripts)
    watch(['app/index.html'], htmlTemplate)
    watch(['app/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
    return src('dist')
      .pipe(clean())
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/images/*.*',
        '!app/images/*.svg',
        '!app/images/stack',
        'app/images/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.js'
    ], {base: 'app'}) //Чтобы созранялось структура папок
      .pipe(dest('dist'))
}

exports.styles = styles;
exports.libStyles = libStyles;
exports.fonts = fonts;
exports.scripts = scripts;
exports.libScripts = libScripts;
exports.watching = watching;
exports.images = images;
exports.sprite = sprite;
exports.htmlTemplate = htmlTemplate;
exports.building = building;


exports.build = series(cleanDist, building);
exports.default = parallel(htmlTemplate, styles, libStyles, images, scripts, libScripts, watching);