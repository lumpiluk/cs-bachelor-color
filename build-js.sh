#!/usr/bin/env bash

echo "Building... (This will take a while since three.js is going to be included in the output.)"
cd ./web
npm run-script build-debug
npm run-script minify
