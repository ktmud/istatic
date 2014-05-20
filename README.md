# Inline Static Files for your template

## Why this?

1. Add compressed inline css and scripts to your html, but write them as seperated files.
2. Access template's variables from a JS file.


For concat and serve external css/jss, go have a look at [autostatic](https://github.com/ktmud/autostatic).


## Usage:

```javascript
var istatic = require('istatic')
va app = express.createServer()

app.locals({
  istatic: istatic.serve({ compress: false })
})
```

Available options for `istatic.server([options])` are:

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
    <td>By default, the contents of your static files are cached in memory forever, until the process dies.
        You can set the <code>ttl</code> to a number of seconds, then the cache will be cleared every that much of time.
    </td>
    <td>
    undefined
    </td>
  </tr>
  <tr>
    <th>charset</th>
    <td>The charset of your static files.</td>
    <td>
    utf-8
    </td>
  </tr>
  <tr>
    <th>compress</th>
    <td>Whether to compress the included contents.</td>
    <td>
    false
    </td>
  </tr>
  <tr>
    <th>cache</th>
    <td>Whether to cache file contents.</td>
    <td>
    true
    </td>
  </tr>
  <tr>
    <th>debug</th>
    <td>
      When set to true, will output the absolute path of included file.
      And `compress` & `cache` will all be set to `false`.
    </td>
    <td>
      <code>process.env.DEBUG</code>
    </td>
  </tr>
  <tr>
    <th>js</th>
    <td>Options passed to <a href="https://github.com/mishoo/UglifyJS">UglifyJS</a>, for compressing JS files.</td>
    <td>
    undefined
    </td>
  </tr>
  <tr>
    <th>css</th>
    <td>Options passed to <a href="https://www.npmjs.org/package/clean-css">clean-css</a></td>
    <td>
    undefined
    </td>
  </tr>
</table>


For css and js options, you can also define a `js.filter` or `css.filter`,
 to do some extra filtering (like remove `console.log()`) **before** compressing.

eg.

```javascript
{
  js: {
    filter: function(str) {
      return str.replace(/console.log(.+?)/, '')
    }
  }
}
```

## In template: 

Now you can include static files in your template like this:

```jade
   html
    title Sweet Page.
    head
     style.
       #{istatic(filename)}
```

`filename` is the path of your static file.


## Templates' Local Variables:

Access template's render context (`locals`) inside your JS file,
in the form you already very familiar with:
   
    #{data.title}

You can even excecute a local funtion just like what you will do in html templates:  

    #{usr.getId('haha...')}

**Attention:**
no matter what templating language you are using, you must always use this syntax in your static files.
And don't put `{}` inside the curly braces. This is for performance consideration.

<hr>

## API

_These APIs are not for templates._

### istatic.serve([options])

Return a function of `istatic(filename, [options])`, for reading files.

The function is typically used as a template helper, the signature is:

#### istatic(filename)

Return the string content of given file. If `filename` begins with a `'/'`, the real path will be `process.cwd() + filename`.
Otherwise, the file will be looked up from the `options.root`, as you configured in `istatic.serve(options)`.   


### istatic.default(options)

Explicitly set default options for any other `istatic.serve()` calls.
The default options may have been set implicitly during the first call of `istatic.serve(options)`.


## Example 

In **/app.js**:

```javascript
var express = require('express')
var istatic = require('istatic')

var app1 = express.createServer()
var app2 = express.createServer()

app1.locals({
  istatic: istatic.serve()
})
app2.locals({
  istatic: istatic.serve({ compress: false })
})

var compressed_css = istatic.uglify.css('.class1 { font: Arial }');
var compressed_js = istatic.uglify.js('// some javascript codes..')

// will be compressed
var str_pinyin_js = istatic('/utils/pinyin.js')

app1.get('/example', function(req, res, next) {
  res.render('example.jade', {
    user: req.user
  })
})
```

In **/view/example.jade**:

```haml
script
  !{istatic('js/log_user.js')}
```

In **/public/js/log_user.js**:

```javascript
var user = "#{user}"
user && $.post('/log', { user: user })
```

## Licence 

(The MIT License)

Copyright (c) 2012 Jesse Yang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
