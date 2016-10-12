'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

//var browserSync = require('browser-sync');

var protractor = require('gulp-protractor');
var ts = require('gulp-typescript');

// Downloads the selenium webdriver
gulp.task('webdriver-update', protractor.webdriver_update);

var tsProject = ts.createProject('./tsconfig.json');

gulp.task('compile', function() {
    tsProject.src([conf.paths.typings, path.join(conf.paths.e2e, '/**/*.ts')])
        .pipe(ts({
            out: 'output.js'
        }))
        .pipe(gulp.dest(conf.paths.e2eOutput));
})

gulp.task('webdriver-standalone', protractor.webdriver_standalone);

function runProtractor(done) {
    var params = process.argv;
    var args = params.length > 3 ? [params[3], params[4]] : [];

    gulp.src([conf.paths.typings, path.join(conf.paths.e2e, '/**/*.ts')])
        .pipe(ts({
            out: 'output.js'
        }))
        .pipe(gulp.dest(conf.paths.e2eOutput)) //protractor needs files on disk, cannot get them from stream
        .pipe(protractor.protractor({
            configFile: 'protractor.conf.js',
            //debug: true,
            args: args
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        })
        .on('end', function () {
            // Close browser sync server
            //browserSync.exit();
            done();
        });
}

gulp.task('protractor', ['protractor:src']);
gulp.task('protractor:src', ['webdriver-update'], runProtractor);
gulp.task('protractor:dist', ['webdriver-update'], runProtractor);
