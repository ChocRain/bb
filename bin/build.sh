#!/bin/bash

cd `dirname $0`/..


# paths

BUILD_DIR=`pwd`/build


# clean up

rm -rf $BUILD_DIR
mkdir $BUILD_DIR


# copy static content

cp -R package.json Procfile server.js server htdocs $BUILD_DIR/
 

# compile js

mkdir -p $BUILD_DIR/htdocs/js
r.js -o build-client.js

