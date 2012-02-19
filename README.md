# Inline Static Files for express / connect / nodejs

## Why this?

Add compressed inline css and scripts to your html, but write them as seperated files.

You don't have to worry about accessing the template's local variables. And you can even include a `.less` file.

## Usage:

```javascript
var istatic = require('istatic');
va app = express.createServer();

istatic.enable(app, { compress: false });
```

The second parameter is an options object, which is optional. Available options are:

### compress

Whether to compress the css or js. Default: `true`.

### showPath 

Whether to include the file's path in the output. Default: `false`.

### root 

The root of your inline static files. Default: `process.cwd() + '/public/'`.

### ttl

By default, the contents of your static files are cached in memory forever, until the process dies. You can set the `ttl` to a number of seconds, so the cache will be cleared every that much of time.

### charset

The charset of your static files. Default: `utf-8`.

### js

The options object for compressing a js file. It will be passed to [UglifyJS](https://github.com/mishoo/UglifyJS).

Default: `undefined`.

### css

The options object for compressing a css file. It will be passed to [UglifyCSS](https://github.com/fmarcia/UglifyCSS).

Default: `undefined`.

For css and js options, you can define an `js.removals` or `css.removals`, to remove some contents (like `console.log()`) before compressing. This will make the inline css/script even more smaller, but still keep the maitainability of the code.

By default, there's only `removals` for js, and it's an RegExp: ``/_log\(.+?\)/g``.

## Use inside template: 

Now you can include static files in your template like this:

    #{istatic(filename, [options])}

`filename` is the path of your static file. If it begins with a '/', the real path will be `process.cwd() + filename`. Otherwise, the file will be looked up from the root of your inline static files, as you configured before.   

You can set available options above, except for `root` and `ttl`. A `fresh` option is available for you to set this `istatic` call always read from file directly.

**Be careful**, since `jade` can not correctly parse curly braces inside a couple of curly braces, don't write:

    script
      #{istatic('js/my.js', { showPath: (DEBUG ? true : false) })}

Write like this instead:

    - istatic_opt = { showPath: (DEBUG ? true : false) }
    script
      #{istatic('js/my.js', istatic_opt)}

And it's definitely easier to read and maintain, too.

## Get access to templates' local variables:

Just get in touch with them in the form you already very familiar with:
   
    #{data.title}

**Attention:** no matter what templating language you are using, you must always use this syntax in your static files.
And don't put `{}` inside the curly braces. This is for performance consideration.

You can even excecute a local funtion just as what you will do in the template:  

    #{usr.getId('haha...')}

<hr>

## API

**NOTE:** These APIs are not for templates.

### istatic(filename, [options])

Return the inlined string of some file.

When passing `options`, these options will be saved as default options for any other later `istatic` or `istatic.enable` calls.

But when you call `istatic(filename, options)` in a template, the options **will not** be save as default options.

APIs listed below are not suitable for an inside template call.

### istatic.enable(app)

To enable the `istatic` helper for an express `app`.

### istatic.default(options)

Set default options for `istatic.enable` and `istatic.inline`. This can be implictly done by call `istatic(filename, [forceReload, options])` and pass the `options` object.

### istatic.uglify.css(str, [options])

Uglify some css string. Options are passed to UglifyCSS.

### istatic.uglify.js(str, [options])

Uglify some js string. Options are passed to UglifyJS.

## Example 

```javascript
var express = require('express');
var istatic = require('istatic');

var app1 = express.createServer();
var app2 = express.createServer();

istatic.default({ compress: false }).enable(app1).enable(app2);

var compressed_css = istatic.uglify.css('.class1 { font: Arial; }');
var compressed_js = istatic.uglify.js('// some javascript codes..');

var str_pinyin_js = istatic('/utils/pinyin.js');
```

Visit [大声看法](http://library.dakanfa.com) for a live example.
