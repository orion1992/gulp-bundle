var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    rename       = require('gulp-rename'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    concat       = require('gulp-concat'),
    fs           = require('fs'),
    data         = require('gulp-data'),
    del          = require('del'),
    browsersync  = require('browser-sync'),
    pug          = require('gulp-pug');

gulp.task('pug', function () {
    return gulp.src('bundle/pages/**/*.pug')
        .pipe(pug({
            pretty:true
        }))
        .pipe(gulp.dest('bundle/pages/'))

})
gulp.task('clean', function () {
    return del.sync('bundle/pages/_merged')
})
gulp.task('sass-compile', function () {
    return gulp.src('bundle/files/common/sass/main.+(scss|sass)')
        .pipe(sass())
        .pipe(rename('common.css'))
        .pipe(sourcemaps.init())
        .pipe(postcss( [ autoprefixer()] ) )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('bundle/pages/_merged/_temp'));
});

gulp.task('common-js', function () {
    var comDepsSource = fs.readFileSync("bundle/files/common/js/order.js", "utf8"),
        comDeps =  comDepsSource.replace(/(\"|\s)+/g,'').split(',');
    var pathsJS = comDeps.map(function (item) {
        return "bundle/files/common/js/" + item + "/"+ item +".js";
    })
    // console.log(pathsJS);
    return gulp.src(pathsJS)
        .pipe(concat('common.js'))
        .pipe(gulp.dest('bundle/pages/_merged/_temp'));
});

gulp.task('libs-compile', function () {
    var libDepsSource = fs.readFileSync("bundle/files/libs/order.js", "utf8"),
        libDeps =  libDepsSource.replace(/(\"|\s)+/g,'').split(',');

    var pathsCSS = libDeps.map(function (item) {
        return "bundle/files/libs/" + item + "/"+ item +".scss";
    })
    var prePathsJS = libDeps.map(function (item) {
        return "bundle/files/libs/" + item + "/"+ item +".js";
    })
    // console.log(pathsCSS);
    var pathsJS = prePathsJS.map(function (item) {
        var path = fs.readFileSync(item, "utf8").split('"')[1];
        return path;
    })
    console.log(pathsJS);
    var js =  gulp.src(pathsJS)
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('bundle/pages/_merged/_temp'))

    return gulp.src(pathsCSS)
        .pipe(concat('merged.scss'))
        .pipe(sass())
        .pipe(rename('libs.css'))
        .pipe(gulp.dest('bundle/pages/_merged/_temp'))

})

gulp.task('libs-concat', ['libs-compile'], function () {
    var cssConcat = gulp.src(['bundle/pages/_merged/_temp/libs.css', 'bundle/pages/_merged/_temp/common.css'])
        .pipe(concat('merged.css'))
        .pipe(gulp.dest('bundle/pages/_merged'))
        .pipe(browsersync.reload({stream: true}))

    var jsConcat = gulp.src(['bundle/pages/_merged/_temp/libs.js', 'bundle/pages/_merged/_temp/common.js'])
        .pipe(concat('merged.js'))
        .pipe(gulp.dest('bundle/pages/_merged'))
})
gulp.task('common-concat-js', ['common-js'], function () {
    return gulp.src(['bundle/pages/_merged/_temp/libs.js', 'bundle/pages/_merged/_temp/common.js'])
        .pipe(concat('merged.js'))
        .pipe(gulp.dest('bundle/pages/_merged'))
})
gulp.task('common-concat-css', ['sass-compile'], function () {
    return gulp.src(['bundle/pages/_merged/_temp/libs.css', 'bundle/pages/_merged/_temp/common.css'])
        .pipe(concat('merged.css'))
        .pipe(gulp.dest('bundle/pages/_merged'))
        .pipe(browsersync.reload({stream: true}))
})


gulp.task('watch', function () {
    gulp.watch('bundle/files/libs/**/*.*', ['libs-concat'] )
    gulp.watch('bundle/files/common/js/**/*.*', ['common-concat-js'] )
    gulp.watch('bundle/files/common/sass/*', ['common-concat-css'])
    gulp.watch('bundle/pages/**/*.pug', ['pug'])
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
gulp.task('start', ['libs-concat', 'common-concat-js', 'common-concat-css', 'watch', 'browsersync'])
