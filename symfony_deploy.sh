#!/usr/bin/env bash
echo Instead of php, you may have to run php5.5-cli
echo Remember to configure app/config/parameters.yml. Normally, the command below does that automatically.

php composer.phar install --no-dev --optimize-autoloader

echo Clearing cache...
php bin/console cache:clear -e prod
