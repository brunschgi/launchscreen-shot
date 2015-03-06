var gulp = require('gulp'),
    less = require('gulp-less'),
    minify = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	webshot =require('webshot'),
	merge = require('merge'),
	cfg = require('./app/config')(__dirname);

gulp.task('compile-css', function() {
    gulp.src(
        [
            './assets/css/variables.less',
            './assets/css/mixins.less',
			'./assets/css/reset.css',
			'./assets/css/grid.less',
			'./assets/css/fonts.less',
            './components/**/*.less'
        ]
    )
        .pipe(plumber())
		.pipe(concat('app.css'))
        .pipe(less())
        .pipe(minify())
        .pipe(gulp.dest('./public/latest/'));
});

gulp.task('compile-js', function() {
    gulp.src('./components/**/*.js').pipe(jshint()).pipe(jshint.reporter('jshint-stylish'));
    gulp.src(
        [
            './assets/vendor/jquery/dist/jquery.min.js',
            './assets/vendor/terrificjs/dist/terrific.min.js',
            './assets/js/**/*.js',
            './components/**/*.js'
        ]
    )
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/latest'));
});

gulp.task('image-minify', function() {
    gulp.src('./assets/img/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.desct('./public/latest/img'));
});

gulp.task('clean', function() {
	gulp.src('shots')
		.pipe(clean({force: true}));
});

gulp.task('webshot', function() {
	var shots = cfg.shots;

	for(var i = 0, len = shots.length; i < len; i++) {
		var shot = shots[i];
		var files = shot.files;

		for(var j = 0, lenj = files.length; j < lenj; j++) {
			var file = files[j];

			// portrait mode
			var portrait = {
				screenSize: {
					width: file.width,
					height: file.height
				},
				shotSize: {
					width: file.width,
					height: file.height
				}
			};

			var options = merge(portrait, shot.options);

			for(var id in shot.url) {
				if(shot.url.hasOwnProperty(id)) {
					webshot(shot.url[id], './shots/' + file.name + '.png', options, function(err) {
						if(err) {
							console.error(err);
						}
						// screenshot now saved
					});
				}
			}

			// landscape mode
			var landscape = {
				screenSize: {
					width: file.height,
					height: file.width
				},
				shotSize: {
					width: file.height,
					height: file.width
				}
			};

			var options = merge(landscape, shot.options);

			for(var id in shot.url) {
				if(shot.url.hasOwnProperty(id)) {
					webshot(shot.url[id], './shots/' + file.name + '-landscape.png', options, function(err) {
						if(err) {
							console.error(err);
						}
						// screenshot now saved
					});
				}
			}
		}
	}
});

gulp.task('crush', function() {
	gulp
		.src('./shots/*.*')
		.pipe(plumber())
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(gulp.dest('./shots'));
});


gulp.task('watch', ['compile-css', 'compile-js'], function() {
    watch(
        ['./assets/**/*.css', './assets/**/*.less', './components/**/*.css', './components/**/*.less'],
        function(files, cb) {
            gulp.start('compile-css', cb);
        }
    );

    watch(
        ['./assets/**/*.js', './components/**/*.js'],
        function(files, cb) {
            gulp.start('compile-js', cb);
        }
    );
});


gulp.task('shot', ['clean', 'webshot']);
gulp.task('default', ['compile-css', 'compile-js']);
