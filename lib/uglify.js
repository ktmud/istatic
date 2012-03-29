var uglifycss = require('uglifycss');
var uglifyjs = require('uglify-js');
var jsp = uglifyjs.parser;
var pro = uglifyjs.uglify;

module.exports = {
  js: function uglify(str, opt) {
    if (opt && opt.filter) {
      str = opt.filter(str);
    }
    var ast = jsp.parse(str);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    return pro.gen_code(ast, opt);
  },
  css: function uglifycss(str, opt) {
    if (opt && opt.filter) {
      str = opt.filter(str);
    }
    return uglifycss.processString(str, opt);
  }
};
