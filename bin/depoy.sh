#!/bin/bash

cd `dirname $0`/.. || exit 1

# config

DEVELOPMENT_REPO=`pwd`
DEPLOYMENT_REPO=/tmp/ponyverse_deployment


# check we're clean
if [ ! -z "$(git status --porcelain)" ]; then
    echo "Cannot deploy. There are uncomitted changes!"
    exit 1;
fi

# do the build
./bin/build.sh || exit 1

# clean up old deployment stuff
rm -rf $DEPLOYMENT_REPO || exit 1
mkdir -p $DEPLOYMENT_REPO || exit 1

# prepare the repository
cd $DEPLOYMENT_REPO || exit 1
git init || exit 1

# reuse git config from development repo
cp $DEVELOPMENT_REPO/.git/config .git/config || exit 1

# copy files for deployment
cp -R $DEVELOPMENT_REPO/build/* . || exit 1

# commit for deployment
git add -A . || exit 1
git commit -m "DEPLOYMENT" || exit 1

# deploy

git push heroku master --force || exit 1

