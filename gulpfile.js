var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    //livereload = require('gulp-livereload'),
    webserver = require('gulp-webserver'),
    merge = require('merge-stream'),
    babel = require('gulp-babel'),
    ts = require('gulp-typescript');


gulp.task('html', function() {
    return gulp.src("src/**/*.html")
        .pipe(gulp.dest("dist"))
        .pipe(notify({
            message: "HTML copied"
        }));
});

gulp.task('fonts', function() {
    return gulp.src("src/css/fonts/*.*")
        .pipe(gulp.dest("dist/css/fonts"))
        .pipe(notify({
            message: "Fonts copied"
        }));
})

gulp.task('css', function() {
    var sass_styles = sass('src/css/**/*.scss', {
            style: 'expanded'
        })
        .pipe(gulp.dest('dist/css'))
        .pipe(minifycss())
        .pipe(notify({
            message: 'SCSS built'
        }));

    var css_styles = gulp.src('src/css/**/*.css')
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({
            message: 'CSS built'
        }));


    var images = gulp.src("./*.png").pipe(gulp.dest("dist/"));

    return merge(sass_styles, css_styles, images);

});


gulp.task('js', function() {

    var js = gulp.src('src/js/**/*.js')
        //.pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message: 'JS files built'
        }));

    var ts_project = ts.createProject('tsconfig.json');

    var ts_result = ts_project.src()
        .pipe(ts(ts_project));

    var ts_code = ts_result.js.pipe(uglify())
        .pipe(gulp.dest("")) //because the tsproject file knows how to handle it
        .pipe(notify({
            message: "TS files built"
        }));


    return merge(js, ts_code);

});

gulp.task('bower', function() {
    return gulp.src("bower_components/**/*.*")
        .pipe(gulp.dest("dist/bower_components"));
})
gulp.task('watch', function() {
    gulp.watch("src/**/*.html", ['html']);
    // Watch .scss files
    gulp.watch('src/css/**/*.scss', ['css']);
    // Watch .js files
    gulp.watch('src/js/**/*.js', ['js']);
    //Watch .ts files
    gulp.watch('src/js/**/*.ts', ['js']);
    //Watch font files
    gulp.watch('src/fonts/**/*.*', ['fonts']);
    //Watch bower_components
    gulp.watch('bower_components/', ['bower']);

});

gulp.task('default', ['html', 'fonts', 'css', 'js', 'bower', 'webserver']);


gulp.task('webserver', ['watch'], function() {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});
