# Color

## Installation

This project uses bower for managing client-side dependencies, which are listed in bower.json. After cloning this project's repository, simply run `bower install`.
For development dependencies, the project makes use of the Node.js Package Manager. After cloning, run `npm install` for both development tools and client-side tools which are required by some of the former. To install only the latter, run `npm install --production`.

Development dependencies (mostly run automatically in WebStorm's File Watchers):

    - *babel* for compiling ECMAScript 6 into ES5 compliant Javascript. Apparently, even modern browsers don't support ES6 modules yet.
    - *lessc* for compiling Less CSS into regular CSS.
    - *browserify* for a "require" that works in the browser. Otherwise, individual .js files would quickly become bloated.
    - *babelify*: A combination of babel and browserify.
    - *browserify-shader* plugin for browserify for including external shader text files in javascript.
    - yuicompressor for minifying Javascript.

Command for browserify with babelify and browserify-shader as it is set in the corresponding File Watcher:
`browserify -t [browserify-shader --parameterize=true] -t [babelify --presets es2015] $FileName$ -o $FileNameWithoutExtension$.compiled.js`
