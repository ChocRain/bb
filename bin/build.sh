#!/bin/bash

cd `dirname $0`/.. || exit 1


# directories

REPO_DIR=`pwd`
BUILD_DIR=$REPO_DIR/build
NODE_MODULES_DIR=$REPO_DIR/node_modules


# binaries

JSLINT=$NODE_MODULES_DIR/jslint/bin/jslint.js


# clean up

rm -rf $BUILD_DIR || exit 1
mkdir $BUILD_DIR || exit 1


# install required packages

npm install


# check JS files

$JSLINT \
    --vars \
    --nomen \
    --indent=4 \
    --maxlen=120 \
    --predef="define" \
\
    server.js \
    $(find server -name '*.js') \
    $(find client -name '*.js' | grep -v '^client/libs/') \
    $(find shared -name '*.js' | grep -v '^shared/libs/') \
|| exit 1


# copy static content

cp -R package.json Procfile server.js server shared htdocs $BUILD_DIR/ || exit 1
 

# compile js

mkdir -p $BUILD_DIR/htdocs/js || exit 1
r.js -o build-client.js || exit 1

