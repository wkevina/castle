/*global require: true */

var gulp       = require('gulp');
var traceur    = require('gulp-traceur');
var sourceMaps = require('gulp-sourcemaps');
var concat     = require('gulp-concat');
var runSeq     = require('run-sequence');
var del        = require('del');
var connect    = require('gulp-connect');
var bower      = require('gulp-bower');
var wiredep = require('wiredep').stream;

var dir = {
  index      : './app/index.html',
  sourceDir  : './app',
  source     : ['./app/**/*.js', '!./app/{lib,lib/**}'],
  main       : './app/main.js',
  lib        : ['!app/lib/threejs/examples/**',
                '!*.json',
                './app/lib/**/*.*',
                './node_modules/systemjs/dist/system.*',
                './node_modules/es6-module-loader/dist/es6-module-loader.*'],
  libOut     : './build/static/lib',
  build      : './build',
  targetAppJs: 'app.js',
  img        : './app/assets/img/**/*.png',
  imgOut     : './build/static/img'
};

var staticCopyTasks = [];
var copyTask = require('./copyTask')(staticCopyTasks, dir, dir.build);

copyTask('index');
copyTask('img');
copyTask('lib');

gulp.task('clean-build', function(cb) {
  del(dir.build, cb);
});

gulp.task('copy-static', staticCopyTasks);

gulp.task('traceur-runtimes', function() {
  gulp.src([traceur.RUNTIME_PATH])
      .pipe(gulp.dest(dir.libOut));
});

gulp.task('compileApp', function() {
  var traceurOptions = {
    experimental          : true,
    annotations           : true,
    exponentiation        : true,
    asyncFunctions        : true,
    generatorComprehension: true,
    arrayComprehension    : true,
    memberVariables       : true,
    symbols               : true,
    types                 : true,
    modules               : 'instantiate'
  };

  return gulp.src(dir.source, {base:dir.sourceDir})
    .pipe(sourceMaps.init())
    .pipe(traceur(traceurOptions))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest(dir.build));
});

gulp.task('watch', function() {
  gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: false
  });
})

gulp.task('build-dev', function() {
  runSeq('clean-build', ['traceur-runtimes', 'copy-static', 'compileApp'], 'bower')
})

gulp.task('default', function() {
  runSeq('build-dev', ['watch', 'connect']);
});

gulp.task('bower', function () {
  gulp.src(dir.build + '/index.html')
    .pipe(wiredep({
      cwd: '.',
      ignorePath: /\.\.\/app\//,
      fileTypes: {
        html: {
          replace: {
            js: '<script src="static/{{filePath}}"></script>'
          }
        }
      }
    }))
    .pipe(gulp.dest(dir.build));
});
