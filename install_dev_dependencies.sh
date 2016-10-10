#!/usr/bin/env bash

# This script assumes that npm (i.e. nodejs), bower, and php are already installed.

npm install  # --production
bower install
php composer.phar install
