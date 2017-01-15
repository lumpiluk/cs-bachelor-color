# Color

This project is online at [color.lukas-stratmann.com](http://color.lukas-stratmann.com).
Alternatively, you can run the debug version on your local machine as follows:

TODO


## Deployment

TODO


## Installation for Development and Testing

### Step-by-Step Guide: Running on a Local Machine

1. Copy or `git clone` the project to a directory of your choice.
2. Make sure PHP is installed. (Tested with PHP 7.0. On Debian-based systems, run `sudo apt install php7.0` to install.)
3. Install the XML extension for PHP (e.g. `sudo apt install php7.0-xml`)
4. Install dependencies for the Symfony framework via `php composer.phar install`.
  You will be prompted to enter the database host.
  If you are installing on a local machine, the default 127.0.0.1 is fine.
  The same goes for the other settings, which can still be changed later by editing the file `app/config/parameters.yml`. 
  Providing the database settings is necessary if you plan to run the experiment again (disabled by default).  
5. For the Javascript and other dependencies we need the Node Package Manager (npm): `sudo apt install npm`.
6. If you also want to build the sources, run `install_dev_dependencies.sh` and refer to the section List of Dependencies for installing all modules that are assumed to be installed globally.
  Otherwise, run `install_production_dependencies_only.sh`.

### List of Dependencies

This project uses bower for managing client-side dependencies, which are listed in bower.json. After cloning this project's repository, simply run `bower install`.
For development dependencies, the project makes use of the Node.js Package Manager. After cloning, run `npm install` for both development tools and client-side tools which are required by some of the former. To install only the latter, run `npm install --production`.

Development dependencies (mostly run automatically in WebStorm's File Watchers):

- *babel* for compiling ECMAScript 6 into ES5 compliant Javascript. Apparently, even modern browsers don't support ES6 modules yet.
- *lessc* for compiling Less CSS into regular CSS. This needs to be installed globally via `sudo npm install -g less`.
- *browserify* for a "require" that works in the browser. Otherwise, individual .js files would quickly become bloated. This needs to be installed globally via `sudo npm install -g browserify`.
- *babelify*: A combination of babel and browserify.
- *browserify-shader* plugin for browserify for including external shader text files in javascript.
- *uglify-js* for minifying Javascript. This needs to be installed globally via `sudo npm install -g uglify-js`.

Command for browserify with babelify and browserify-shader as it is set in the corresponding File Watcher:
`browserify -t [browserify-shader --parameterize=true] -t [babelify --presets es2015] $FileName$ -o $FileNameWithoutExtension$.compiled.js`


## PHP

Dependencies for PHP development are installed to ./vendor via `php composer.phar install`.
The file composer.lock specifies the exact versions of the original installation.

To run a debug server, execute `php bin/console server:run`.

This project uses Symfony and, for templating, Symfony's Twig. knpuniversity's video tutorials are highly recommended!

### Symfony

Useful resources:
- Registration form: http://symfony.com/doc/current/doctrine/registration_form.html
- Login form:
  - http://symfony.com/doc/current/security/form_login_setup.html
  - http://symfony.com/doc/current/cookbook/security/form_login_setup.html
- Load users from DB: http://symfony.com/doc/current/security/entity_provider.html
- Access control, ROLEs: http://symfony.com/doc/current/security.html


## Experiment

### Enable / Disable
TODO!

### Registration

RegistrationController.php will check for the file app/Resources/students.txt.
If it exists, it acts as a whitelist. If it doesn't exist, everyone may register.
