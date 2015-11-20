var exec = require('child_process').execSync;
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('jsdoc', function() {
    gutil.log('Building jsdoc');
    exec('jsdoc -r -p src');
});

gulp.task('default', function() {
    gulp.watch('src/**/*.js', ['jsdoc']);
});
