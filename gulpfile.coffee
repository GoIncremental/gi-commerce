del = require 'del'
gulp = require 'gulp'
gutil = require 'gulp-util'
concat = require 'gulp-concat'
coffeelint = require 'gulp-coffeelint'
coffeeCompiler = require 'gulp-coffee'
templateCache = require 'gulp-angular-templatecache'
merge = require 'merge-stream'

coffee = () ->
  gulp.src(['client/index.coffee', 'client/**/*.coffee'])
  .pipe(coffeelint())
  .pipe(coffeelint.reporter())
  .pipe(coffeeCompiler {bare: true}).on('error', gutil.log)

templates = () ->
  gulp.src('client/views/*.html')
  .pipe(templateCache({module: 'gi.commerce'}))

gulp.task 'clean', (cb) ->
  del('dist')
  cb()

gulp.task 'build', () ->
  merge(coffee(), templates())
  .pipe(concat('gi-commerce.js'))
  .pipe(gulp.dest('dist'))


gulp.task 'default', ['build']

gulp.task 'watch', ['build'], () ->
  gulp.watch(['client/views/*.html'
              'client/**/*.coffee']
             ['default'])
