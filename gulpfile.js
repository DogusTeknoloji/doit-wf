var gulp = require('gulp')
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');

gulp.task('copy-templates', function () {
    var copyResult = gulp.src('src/templates/*.hbs')
        .pipe(gulp.dest('lib/templates/'));

    return copyResult;
});

gulp.task('copy-scenarios', function () {
    var copyResult = gulp.src('src/scenarios/*')
        .pipe(gulp.dest('lib/scenarios/'));

    return copyResult;
});

gulp.task('compile', function () {
    var tsProject = ts.createProject('tsconfig.json');

    var tsResult = gulp.src('src/**/*.ts', { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.js
            .pipe(sourcemaps.mapSources(function (sourcePath, file) {
                // source paths are prefixed with '../src/'
                return '../src/' + sourcePath;
            }))
            .pipe(sourcemaps.write('.', { sourceRoot: function (file) { return file.cwd + '/lib'; } }))
            .pipe(gulp.dest('lib')),

        tsResult.dts.pipe(gulp.dest('lib'))
    ]);
});

gulp.task('build', ['copy-templates', 'copy-scenarios']);