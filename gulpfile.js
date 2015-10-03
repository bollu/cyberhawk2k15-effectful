var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    webserver = require('gulp-webserver'),
    react = require('gulp-react'),
    merge = require('merge-stream'),
    plumber = require('gulp-plumber'),
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
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({
            message: 'SCSS built'
        }));

    var css_styles = gulp.src('src/css/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({
            message: 'CSS built'
        }));

    return merge(sass_styles, css_styles);

});


gulp.task('scripts', function() {
    //bower scripts--
    var react_basic = gulp.src('bower_components/react/react.js')
        .pipe(gulp.dest('dist/js'));

    var react_with_addons = gulp.src('bower_components/react/react-with-addons.js')
        .pipe(gulp.dest('dist/js'));

    var typedjs = gulp.src('bower_components/typed.js/dist/typed.min.js')
        .pipe(gulp.dest('dist/js'));

    var jquery = gulp.src('bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('dist/js'));

    var react_motion = gulp.src("bower_components/react-motion/build/react-motion.js")
        .pipe(gulp.dest('dist/js'));

    var favico = gulp.src("bower_components/favico.js/favico.js")
        .pipe(gulp.dest("dist/js"));

    var require = gulp.src("bower_components/requirejs/require.js")
        .pipe(gulp.dest("dist/js"));

    var material_components = gulp.src("node_modules/material-ui/lib/flat-button.js")
        .pipe(babel())
        .pipe(gulp.dest('dist/js/material-ui'))
        .pipe(notify({
            message: 'Material components built'
        }));

    //my scripts---

    var jsx = gulp.src('src/js/*.jsx')
        .pipe(concat('default-jsx.js'))
        .pipe(plumber())
        .pipe(react())
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message: 'JSX files built'
        }));

    var material_ui = gulp.src('src/js/material-ui')
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message: 'Material UI copied'
        }));
    var app = gulp.src("src/js/app.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));


    return merge(react_basic, react_with_addons, typedjs, jquery,
        react_motion, favico, require, material_ui, material_ui, jsx, app);

});

gulp.task('watch', function() {
    // Create LiveReload server
    livereload.listen();
    gulp.watch("src/**/*.html", ['html']);
    // Watch .scss files
    gulp.watch('src/css/**/*.scss', ['css']);
    // Watch .jsx files
    gulp.watch('src/js/**/*.js*', ['scripts']);
    //Watch font files
    gulp.watch('src/fonts/**/*.*', ['fonts']);
    //Watch bower_components
    gulp.watch('bower_components/', ['scripts']);
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);

});

gulp.task('default', ['html', 'fonts', 'css', 'scripts', 'watch', 'webserver']);


gulp.task('webserver', ['watch'], function() {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});
