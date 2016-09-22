# Color

## Installation

Keep in mind that this git repository makes use of submodules!

Additional requirements:
- For WebStorm file watchers:
  - *babel* for compiling ECMAScript 6 into ES5 compliant Javascript. Apparently, even modern browsers don't support ES6 modules yet. (sudo npm install -g --save-dev babel-cli. The necessary preset has already been installed via npm install --save-dev babel-preset-es2015)
  - *lessc* for compiling Less CSS into regular CSS. (sudo npm install -g less)
  - yuicompressor for minifying Javascript. (sudo npm install -g yuicompressor)
