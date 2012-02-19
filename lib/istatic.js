var uglify = require('./uglify.js');
var fs = require('fs');
var normalize = require('path').normalize;

// inline static has to be very fast,
// so we just store it in the memory forever.
var cache = {};
var _t;

var reg_val = /#{(.+?)}/g;

function waitStale(ttl) {
  try {
    clearInterval(_t);
  } catch (e) {}
  _t = setInterval(function() { cache = {}; }, ttl * 1000);
}

/**
* Add the istatic helper for express to use.
*/
function bind(app, options) {
  var doCache = true;
  var charset = 'utf-8';
  var processRoot = process.cwd();

  options = options || {};

  var doCompress = 'compress' in options ? options.compress : true;

  if (options.charset) charset = options.charset;

  var ttl = options.ttl;
  if (ttl > 5) {
    waitStale(ttl);
  } else if (ttl === 0) {
    doCache = false;
  }

  var staticRoot = options.root ? normalize(options.root) : (processRoot + '/public/');
  if (staticRoot.slice(-1) != '/') staticRoot += '/';
  var showPath = options.showPath;
  var cssOptions = options.css;
  var jsOptions = options.js;

  // inline static files
  function istatic(filepath, forceReload) {
    var filetype = filepath.split('.').slice(-1)[0];
    var root = filepath[0] == '/' ? processRoot : staticRoot;
    filepath = root + filepath;

    var str = doCache ? cache[filepath] : '';
    if (!str || forceReload) {
      str = fs.readFileSync(filepath, charset);
      switch (filetype) {
      case 'js':
        // if not debug, uglify the js
        if (doCompress) str = uglify.js(str, jsOptions);
        break;
      case 'less':
        less.render(str, function(err, str) {
          if (doCompress) str = uglify.css(str, cssOptions);
          if (!err) cache[filepath] = str;
        });
        // better simple than none
        // once the render is done, we can safely return good css
        break;
      case 'css':
        if (doCompress) str = uglify.css(str, cssOptions);
      default:
        // return the original str
      }
      if (showPath) str = '\n/* == istatic: ' + filepath + ' == */\n' + str;
      if (doCache) cache[filepath] = str;
    }

    return str;
  }

  app.dynamicHelpers({
    // inline static
    istatic: function(req, res) {
      return function() {
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
}

module.exports = {
  enable: bind
};
