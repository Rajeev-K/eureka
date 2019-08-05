var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var paths = {
    scss: './ClientApp/style/',
    css: './wwwroot/'
};

gulp.task('sass', function () {
    return gulp.src(paths.scss + 'app.scss')
        .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(rename(paths.css + 'app.css'))
        .pipe(gulp.dest('./'))
});

gulp.task('sass:watch', function () {
    gulp.watch([paths.scss + '*.scss'],
               gulp.series('sass', function (done) {
        done();
    }));
});

gulp.task('tsc', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('.'));
});

gulp.task('default', gulp.series('tsc', 'sass', function (done) {
    done();
}));
