var fs = require('fs');
var normalize = require('path').normalize;
var uglify = require('./uglify.js');
var less = require('less');
var stylus = require('stylus');
var log = require('debug')('istatic');

function waitStale(ttl, _t) {
  try {
    clearInterval(_t);
  } catch (e) {}
  _t = setInterval(function() { cache = {}; }, ttl * 1000);
}

var processRoot = process.cwd();

var global_cache = {};

function _uglify(type, str, opt, doCompress) {
  if (opt && opt.filter) {
    str = opt.filter(str) || '';
  }
  if (!doCompress) return str;
  return uglify[type](str, opt);
}


module.exports = function theRead(options) {
  // inline static has to be very fast,
  // so we just store it in the memory forever.
  var cache = {};
  var _t;

  var doCache = true;

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
    var debug = 'debug' in opt ? opt.debug : process.env.DEBUG;
    var doCompress = 'compress' in opt ? opt.compress : true;
    var _doCache = opt.fresh ? false : doCache;

    var str = _doCache ? (cache[filepath] || global_cache[filepath]) : '';

    if (str && _doCache) return str;

    try {
      str = fs.readFileSync(filepath, charset);
    } catch (e) {
      log('Reading %s failed: %s', filepath, e);
    }

    switch (filetype) {
    case 'styl':
      filetype = 'css';
      stylus.render(str, function(err, str) {
        if (err) log('Compiling %s failed: %s', filepath, err);
        else cache[filepath] = _uglify('css', str, opt.css, doCompress);
      });
    case 'less':
      filetype = 'css';
      less.render(str, function(err, str) {
        if (err) log('Compiling %s failed: %s', filepath, err);
        else cache[filepath] = _uglify('css', str, opt.css, doCompress);
      });
      // better simple than none
      // once the render is done, we can safely return good css
    //case 'js':
    //case 'css':
    default:
      if (filetype == 'css' || filetype == 'js') {
        str = _uglify(filetype, str, opt[filetype], doCompress);
      }
    }
    if (debug) str = '\n/* == istatic: ' + filepath + ' == */\n' + str;

    var ret = new String(str);
    // cache as a string object
    if (_doCache) cache[filepath] = global_cache[filepath] = ret;
    return ret;
  };
};

