var uglify = require('./uglify.js');
var fs = require('fs');

// inline static has to be very fast,
// so we just store it in the memory forever.
var cache = {};

var reg_val = /#{(.+?)}/g;

/**
* The middleware for express to use.
*/
module.exports = function(opt) {
  var doCompress = false;
  var defaultCharset = 'utf-8';

  // inline static files
  function istatic(filepath, charSet, forceReload) {
    charSet = charSet || defaultCharset;
    if (typeof charSet == 'boolean') {
      forceReload = charSet;
      charSet = defaultCharset;
    }

    var filetype = filepath.split('.').slice(-1)[0];
    var root = central.cwd + (filepath[0] == '/' ? '' : '/public/');
    filepath = root + filepath;

    var str = cache[filepath];
    if (!str || forceReload) {
      str = fs.readFileSync(filepath, charSet);
      switch (filetype) {
      case 'js':
        // if not debug, uglify the js
        if (doCompress) str = uglify.js(str);
        break;
      case 'less':
        less.render(str, function(err, str) {
          if (doCompress) str = uglify.css(str);
          if (!err) cache[filepath] = str;
        });
        // better simple than none
        // once the render is done, we can safely return good css
        break;
      case 'css':
        if (doCompress) str = uglify.css(str);
      default:
        // return the original str
      }
      cache[filepath] = str;
    }

    return str;
  }

  opt = opt || {};
  if (opt.compress) doCompress = true;
  if (opt.charSet) defaultCharset = charSet;
  // at least 5 seconds
  if (opt.ttl && opt.ttl > 5)
    setInterval(function() { cache = {}; }, opt.ttl * 1000);
  var app = this;
  var showFilename = opt.showFilename;
  /**
  * So in your html template, use this code to inline static files:
  *
  *     #{istatic(abc, 'utf-8')}
  *
  * You can get access to template's local variables in the static file,
  * using #{variable_name}.
  *
  * It is strongly recommended to use this middleware after you added
  * all the other helpers.
  *
  */
  return function() {
    app.dynamicHelpers({
      // inline static
      istatic: function(req, res) {
        return function istatic() {
          var locals = this;
          var str = istatic.apply(this, arguments) || '';
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
  };
};
