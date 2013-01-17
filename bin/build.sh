#!/bin/bash

cd `dirname $0`/.. || exit 1


# paths

BUILD_DIR=`pwd`/build


# clean up

rm -rf $BUILD_DIR || exit 1
mkdir $BUILD_DIR || exit 1


# copy static content

cp -R package.json Procfile server.js server htdocs $BUILD_DIR/ || exit 1
 

# compile js

mkdir -p $BUILD_DIR/htdocs/js || exit 1
r.js -o build-client.js || exit 1

