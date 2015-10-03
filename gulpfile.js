var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    //livereload = require('gulp-livereload'),
    webserver = require('gulp-webserver'),
    merge = require('merge-stream'),
    babel = require('gulp-babel');


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

    return merge(sass_styles, css_styles);

});


gulp.task('scripts', function() {

    var js = gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message: 'JSX files built'
        }));

    var es6 = gulp.src("src/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));


    return merge(react_basic, react_with_addons, typedjs, jquery,
        react_motion, favico, require, material_ui, material_ui, jsx, app);

});

gulp.task('bower', function() {
    return gulp.src("bower_components")
        .pipe(gulp.dest("dist"));
})
gulp.task('watch', function() {
    // Create LiveReload server
    //livereload.listen();
    gulp.watch("src/**/*.html", ['html']);
    // Watch .scss files
    gulp.watch('src/css/**/*.scss', ['css']);
    // Watch .jsx files
    gulp.watch('src/js/**/*.js*', ['scripts']);
    //Watch font files
    gulp.watch('src/fonts/**/*.*', ['fonts']);
    //Watch bower_components
    gulp.watch('bower_components/', ['bower']);
    // Watch any files in dist/, reload on change
    //gulp.watch(['dist/**']).on('change', livereload.changed);

});

gulp.task('default', ['html', 'fonts', 'css', 'scripts', 'webserver']);


gulp.task('webserver', ['watch'], function() {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});
