# Inline Static Files for express / connect / nodejs

## Why this?

Add compressed inline css and scripts to your html, but write them as seperated files.

You don't have to worry about accessing the template's local variables. And you can even include a `.less` file.

You may also like to have a loot at [autostatic](https://github.com/ktmud/autostatic).

## Usage:

```javascript
var istatic = require('express-istatic');
va app = express.createServer();

app.locals({
  istatic: istatic.serve({ compress: false })
});
```
The parameter passed to `istatic.serve` is an options object, which is optional.

Available options are:

<table>
  <tr>
  	<th>name</th>
  	<th>description</th>
  	<th>default</th>
  </tr>
  <tr>
    <th>root</th>
    <td>The root of your inline static files.</td>
    <td>
    process.cwd() + '/public/'
     </td>
  </tr>
  <tr>
    <th>ttl</th>
    <td>By default, the contents of your static files are cached in memory forever, until the process dies. You can set the <code>ttl</code> to a number of seconds, so the cache will be cleared every that much of time.
    </td>
    <td>
    undefined
    </td>
  </tr>
  <tr>
    <th>charset </th>
    <td>The charset of your static files.</td>
    <td>
    utf-8
    </td>
  </tr>
  <tr>
    <th>compress </th>
    <td>Whether to compress the included contents.</td>
    <td>
    true
    </td>
  </tr>
  <tr>
    <th>debug</th>
    <td>When set to true, will output the absolute path of included file.</td>
    <td>
    false || <code>process.env.DEBUG</code>
    </td>
  </tr>
  <tr>
    <th>js</th>
    <td>The options object for compressing a js file. It will be passed to <a href="https://github.com/mishoo/UglifyJS">UglifyJS</a>. </td>
    <td>
    undefined
    </td>
  </tr>
  <tr>
    <th>css</th>
    <td>The options object for compressing a css file. It will be passed to <a href="https://github.com/fmarcia/UglifyCSS">UglifyCSS</a></td>
    <td>
    undefined
    </td>
  </tr>
</table>

For css and js options, you can define an `js.filter` or `css.filter`, to do some filtering(like remove `console.log()`) before compressing.

eg.

```javascript
{
  js: {
    filter: function(str) {
      return str.replace(/console.log(.+?)/, '');
    }
  }
}
```

## In template: 

Now you can include static files in your template like this:

    #{istatic(filename, [options])}

`filename` is the path of your static file.

If it begins with a `'/'`, the real path will be `process.cwd() + filename`. Otherwise, the file will be looked up from the root of your inline static files, as you configured before.   

You can set available options above, except for `root` and `ttl`. A `fresh` option is available for you to set this `istatic` call always read from file directly.

**Be careful**, since `jade` can not correctly parse curly braces inside a couple of curly braces, don't write:

    script
      #{istatic('js/my.js', { showPath: (DEBUG ? true : false) })}

Write like this instead:

    istatic_opt = { showPath: (DEBUG ? true : false) }
    script
      #{istatic('js/my.js', istatic_opt)}

And it's definitely easier to read and maintain, too.

## Templates' Local Variables:

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

Everytime you call `istatic` directly, it the `options` is given, these options will be saved as default options for any other later `istatic` or `istatic.serve` calls.

But when you call `istatic(filename, options)` from a template, the options **will not** be saved as default options.

APIs listed below are not suitable for an inside template call.

### istatic.serve([options])

To return a function of `istatic(filename, [options])`, to read the file.  This is typically used as an express helper.

### istatic.default(options)

Specificly set default options for `istatic('filepath')`, which will be set implicitly at the first call of `istatic('filename', options)` or `istatic.serve(options)`.

### istatic.uglify.css(str, [options])

Uglify some css string. Options are passed to UglifyCSS.

### istatic.uglify.js(str, [options])

Uglify some js string. Options are passed to UglifyJS.

## Example 

In **/app.js**:

```javascript
var express = require('express');
var istatic = require('express-istatic');

var app1 = express.createServer();
var app2 = express.createServer();

app1.locals({
  istatic: istatic.serve()
});
app2.locals({
  istatic: istatic.serve({ compress: false })
});

var compressed_css = istatic.uglify.css('.class1 { font: Arial; }');
var compressed_js = istatic.uglify.js('// some javascript codes..');

// will be compressed
var str_pinyin_js = istatic('/utils/pinyin.js');

app1.get('/example', function(req, res, next) {
  res.render('example.jade', {
    user: req.user
  });
});
```

In **/view/example.jade**:

```haml
script
  !{istatic('js/log_user.js')}
```

In **/public/js/log_user.js**:

```javascript
var user = "#{user}"
user && $.post('/log', { user: user });
```

## Licence 

(The MIT License)

Copyright (c) 2012 Jesse Yang &lt;jyyjcc@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
