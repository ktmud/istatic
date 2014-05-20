var CleanCSS = require('clean-css')
var uglifyjs = require('uglify-js')

module.exports = {
  js: function(code, opt) {
    opt = opt || {}
    opt.fromString = true
    return uglifyjs.minify(code, opt).code
  },
  css: function(code, opt) {
    return new CleanCSS(opt).minify(code)
  }
}
