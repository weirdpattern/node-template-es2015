/**
 * @module test
 */

require('babel-core/register');
require('babel-polyfill');

const test = require('tape');
const glob = require('glob');
const path = require('path');

/*
 * @private
 * @function
 *
 * Wraps the tape functionality (no more .end() at the end =))
 *
 * @param {string} title - the title of the test.
 * @param {Function} callback - the actual test code.
 */
function executor (title, callback) {
  test(title, (assert) => {
    if (callback(assert) === void 0) {
      assert.end();
    }
  });
}

// get all spec files and parse them
glob('spec/**/*.js', { 'realpath': true, 'ignore': 'spec/index.js' }, function (err, files) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var suite;
  var method;
  var library;

  files && files.forEach(function (filename) {
    suite = require(filename);

    if (suite && 'default' in suite) {
      suite = suite['default'];

      [ library, method ] = path.basename(filename, '.js').split('#');
      library = path.relative(
        __dirname,                 // current directory
        path.join('lib',           // lib directory
          path.relative(           // path to library from lib or spec folder
            __dirname,
            path.dirname(filename)
          ),
          library                  // library (js file)
        )
      );

      if (method != null) {
        suite(executor, require(library)[method]);
      } else {
        suite(executor, require(library));
      }
    }
  });
});
