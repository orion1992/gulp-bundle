var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    rename       = require('gulp-rename'),
    browsersync  = require('browser-sync'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer');


gulp.task('sass-compile', function () {
   return gulp.src('bundle/files/sass/main.+(scss|sass)')
       .pipe(sass())
       .pipe(rename('_merged.css'))
       .pipe(sourcemaps.init())
       .pipe(postcss([ autoprefixer({
           browsers: [
               "Explorer >= 8",
               "Firefox >= 4",
               "Opera >= 12",
               "Chrome >= 15",
               "Safari >= 5",
               "Android 2.3",
               "Android >= 4",
               "iOS >= 6"
           ],
       }) ]))
       .pipe(sourcemaps.write('.'))
       .pipe(gulp.dest('bundle/pages/_merged'))
       .pipe(browsersync.reload({stream: true}))
});

gulp.task('watch', function () {
    gulp.watch('bundle/files/sass/**/*.+(scss|sass)', ['sass-compile'] )
    gulp.watch('bundle/pages/**/*.html', browsersync.reload)
})

gulp.task('browsersync', function () {
    browsersync({
        server: {
            baseDir: './'
        },
        notify: false
    });
})

gulp.task('default', ['watch', 'browsersync'] )

