var fs = require('fs')
var BasicCache = require('basiccache')
var normalize = require('path').normalize
var join = require('path').join
var uglify = require('./uglify')
var log = require('debug')('istatic')

var processRoot = process.cwd()
var ONE_HOUR = 3600 * 1000

function _uglify(type, content, opt, compress) {
  // apply filters
  if (opt && opt.filter) {
    content = opt.filter(content) || ''
  }
  if (!compress) return content
  return uglify[type](content, opt)
}

function getContent(filepath, opts) {
  var filetype = filepath.split('.').slice(-1)[0]
  try {
    content = fs.readFileSync(filepath, opts.charset)
  } catch (e) {
    log('Reading %s failed: %s', filepath, e)
    if (opts.debug) throw e
    return '/* == istatic: read file failed: ' + filepath + ' == */'
  }
  if (filetype == 'css' || filetype == 'js') {
    content = _uglify(filetype, content, opts[filetype], opts.compress)
  }
  // add a deug line
  if (opts.debug) {
    content = '\n/* == istatic: ' + filepath + ' == */\n' + content
  }
  return content
}


module.exports = function theRead(options) {

  options = options || {}

  var cache = new BasicCache({
    expires: options.ttl ? options.ttl * 1000 : null,
    purgeInterval: ONE_HOUR
  })
  var debug = options.debug = 'debug' in options ? options.debug : process.env.DEBUG
  var staticRoot = options.root ? normalize(options.root) : (processRoot + '/public/')

  if (debug) {
    options.cache = options.compress = false
  } else {
    if (!('cache' in options)) options.cache = true
    if (!('compress' in options)) options.compress = true
  }

  // root always ends with a slash
  if (staticRoot.slice(-1) != '/') staticRoot += '/'

  return function theRead(filepath, fresh) {
    var content
    var useCache = options.cache

    if (fresh) {
      useCache = false
    }

    filepath = (filepath[0] == '/' ? processRoot : staticRoot) + filepath

    if (useCache) {
      content = cache.get(filepath)
      if (content === undefined) {
        content = getContent(filepath, options)
      }
      cache.set(filepath, content)
    } else {
      content = getContent(filepath, options)
    }
    return content
  }
}

