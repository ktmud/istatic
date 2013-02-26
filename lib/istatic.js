var uglify = require('./uglify.js');
var theRead = require('./read.js');

var reg_val = /#{(.+?)}/g;

var defaultOptions;
var defaultRead;


var exports = function(path, options) {
  if (!defaultRead) {
    if (options) defaultOptions = options;
    defaultRead = theRead(defaultOptions);
  }
  return defaultRead(path, options);
};
exports.uglify = uglify;

exports.default = function(options) {
  defaultOptions = options;
  defaultRead = theRead(options);
  return this;
};

// inline static files
exports.serve = function(options) {
  // the local read method
  var read;

  if (!defaultRead) {
    defaultRead = theRead(options || defaultOptions);
    read = defaultRead;
  } else {
    read = options ? theRead(options) : defaultRead;
  }

  // compiled functions cache
  var compiled_fns = {};

  return function(path, opts) {
    // this is the express templates' locals
    if (path in compiled_fns) return compiled_fns[path](this);

    var str = read(path, opts) || '';

    // replace inlined arguments
    if (str.indexOf('#{') > -1) {
      compiled_fns[path] = function(locals) {
        return str.replace(reg_val, function(m0, m1) {
          var fn = new Function('locals', 'with (locals) { return ' + m1 + '; }');
          return fn(locals);
        });
        if (options.ttl) setTimeout(function() {
          delete compiled_fns[path];
        }, options.ttl);
      };
      return compiled_fns[path](this);
    }

    return str;
  };
};

module.exports = exports;
