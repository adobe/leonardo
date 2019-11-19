const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const nodeModuleImport = require('@node-sass/node-module-importer');

exports.css = function css() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass({
      importer: [nodeModuleImport],
    }).on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
};

exports.copy = function copy() {
  return gulp.src([
    'src/**',
    '!src/scss/**'
  ])
    .pipe(gulp.dest('dist/'));
};

const path = require('path');
exports.copyDeps = function copyDeps() {
  let package = require('./package.json');

  let deps = Object.keys(package.dependencies)
    .map(dep => {
      if (dep === '@adobe/spectrum-css-workflow-icons') {
        return path.join(require.resolve(dep), '..') + '/**';
      }

      return `${require.resolve(dep)}`;
    });

  return gulp.src(deps)
    .pipe(gulp.dest('dist/lib/'));
};

exports.dev = function dev() {
  gulp.watch('src/sass/**/*.scss', ['sass']);
};

exports.build = gulp.parallel(
  exports.copyDeps,
  exports.copy,
  exports.css
);

exports.default = exports.build;

