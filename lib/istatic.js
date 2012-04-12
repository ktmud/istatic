var uglify = require('./uglify.js');
var theRead = require('./read.js');

var reg_val = /#{(.+?)}/g;

var defaultOptions;
var defaultRead;

// Add the `istatic` helper for express to use.
function bind(app, options) {
  // inline static files
  var read = theRead(options || defaultOptions);

  if (!defaultRead) defaultRead = read;

  app.dynamicHelpers({
    // inline static
    istatic: function(req, res) {
      return function() {
        var locals = this;
        var str = read.apply(this, arguments) || '';
        // replace inlined arguments
        if (str.indexOf('#{') > -1) {
          str = str.replace(reg_val, function(m0, m1) {
            var fn = new Function('locals', 'with (locals) { return ' + m1 + '; }');
            return fn(locals);
          });
        }
        return str;
      };
    }
  });

  return exports;
}

var exports = function(path, options) {
  if (!defaultRead) {
    if (options) defaultOptions = options;
    defaultRead = theRead(defaultOptions);
  }
  return defaultRead(path, options);
};

exports.default = function(options) {
  defaultOptions = options;
  defaultRead = theRead(options);
  return this;
};

exports.enable = bind;
exports.uglify = uglify;

module.exports = exports;
