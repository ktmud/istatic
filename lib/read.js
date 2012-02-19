var fs = require('fs');
var normalize = require('path').normalize;
var uglify = require('./uglify.js');

function waitStale(ttl, _t) {
  try {
    clearInterval(_t);
  } catch (e) {}
  _t = setInterval(function() { cache = {}; }, ttl * 1000);
}

var global_cache = {};

module.exports = function theRead(options) {
  // inline static has to be very fast,
  // so we just store it in the memory forever.
  var cache = {};
  var _t;

  var doCache = true;
  var processRoot = process.cwd();

  options = options || {};

  var ttl = options.ttl;
  if (ttl > 5) {
    waitStale(ttl, _t);
  } else {
    // if the ttl is less than 5 seconds,
    // we don't even cache it.
    doCache = false;
  }

  var staticRoot = options.root ? normalize(options.root) : (processRoot + '/public/');
  if (staticRoot.slice(-1) != '/') staticRoot += '/';

  return function theRead(filepath, opt) {
    var filetype = filepath.split('.').slice(-1)[0];
    var root = filepath[0] == '/' ? processRoot : staticRoot;
    filepath = root + filepath;

    opt = opt || {};

    for (var key in options) {
      if (key in opt) {
      } else {
        opt[key] = options[key];
      }
    }

    var charset = opt.charset || 'utf-8';
    var doCompress = 'compress' in opt ? opt.compress : true;
    var doCache = opt.fresh ? false : doCache;

    var str = doCache ? (cache[filepath] || global_cache[filepath]) : '';

    if (str && doCache) return str;

    str = fs.readFileSync(filepath, charset);

    switch (filetype) {
    case 'js':
      // if not debug, uglify the js
      if (doCompress) str = uglify.js(str, opt.js);
      break;
    case 'less':
      less.render(str, function(err, str) {
        if (doCompress) str = uglify.css(str, opt.css);
        if (!err) cache[filepath] = str;
      });
      // better simple than none
      // once the render is done, we can safely return good css
      break;
    case 'css':
      if (doCompress) str = uglify.css(str, opt.css);
    default:
      // return the original str
    }
    if (opt.showPath) str = '\n/* == istatic: ' + filepath + ' == */\n' + str;
    if (doCache) cache[filepath] = global_cache[filepath] = str;
    return str;
  };
};

