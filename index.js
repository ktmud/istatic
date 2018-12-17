var uglify = require('./lib/uglify')
var theRead = require('./lib/read')
var BasicCache = require('basiccache')

var reg_val = /#{(.+?)}/g

var defaultOptions = {
  charset: 'utf-8',
  ttl: 60 * 60,
}
var defaultRead


var exports = function(path, options) {
  if (!defaultRead) {
    exports.default(options)
    defaultRead = theRead(defaultOptions)
  }
  return defaultRead(path, options)
}

exports.uglify = uglify

exports.default = function(options) {
  defaultOptions = options = {
    ...defaultOptions,
    ...options
  }
  defaultRead = theRead(options)
}

// inline static files
exports.serve = function(options) {
  // the local read method
  var read, compiled_fns

  if ('string' === typeof options) {
    options = { root: options }
  }
  if ('undefined' == typeof options) {
    options = defaultOptions
  }
  if (!defaultRead) {
    read = defaultRead = theRead(options)
  } else {
    read = options ? theRead(options) : defaultRead
  }
  // compiled functions cache
  compiled_fns = new BasicCache({ expires: options.ttl ? options.ttl * 1000 : null })

  return function(path, fresh) {
    var fn = compiled_fns.get(path)
    // this is the express templates' locals
    if (fn) return fn(this)

    var content = read(path, fresh) || ''

    // replace inlined argument based on locals
    if (content.indexOf('#{') > -1) {
      fn = function(locals) {
        return content.replace(reg_val, function(m0, m1) {
          var fn = new Function('locals', 'with (locals) { return ' + m1 + ' }')
          return fn(locals)
        })
      }
      return fn(this)
    }

    return content
  }
}

module.exports = exports
