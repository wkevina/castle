/*global require: true */

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourceMaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var runSeq = require('run-sequence');
var del = require('del');
var connect = require('gulp-connect');
var bower = require('gulp-bower');
var wiredep = require('wiredep').stream;

var dir = {
	index: './app/index.html',
	sourceDir: './app',
	source: ['./app/**/*.js', '!./app/{lib,lib/**}'],
	main: './app/main.js',
	lib: ['!*.json',
		'./app/lib/**/*.*',
		//'./node_modules/systemjs/dist/system.*',
		//'./node_modules/es6-module-loader/dist/es6-module-loader.*',
        'node_modules/es6-micro-loader/dist/system-polyfill.js'
	],
	libOut: './build/static/lib',
	build: './build',
	targetAppJs: 'app.js',
	img: './app/assets/img/**/*.png',
	imgOut: './build/static/img'
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

gulp.task('compileApp', function() {
	var babelOptions = {
		modules: 'system',
		moduleIds: true
	};


	return gulp.src(dir.source, {
			base: dir.sourceDir
		})
		.pipe(plumber())
		.pipe(sourceMaps.init())
		.pipe(concat('all.js'))
		.pipe(babel(babelOptions))
		.pipe(sourceMaps.write('.', {sourceMappingURLPrefix: '/'}))
        .pipe(gulp.dest(dir.build));
});

gulp.task('watch', function() {
	gulp.watch([dir.source, dir.lib, dir.index, 'gulpfile.js'], ['build-dev']);
});

gulp.task('connect', function() {
	connect.server({
		root: 'build',
		livereload: false,
		host: '0.0.0.0'
	});
});

gulp.task('build-dev', function() {
	runSeq('clean-build', ['copy-static', 'compileApp'], 'bower')
});

gulp.task('default', function() {
	runSeq('build-dev', ['watch', 'connect']);
});

gulp.task('bower', function() {
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
