#!/bin/bash

###
# Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU). Use if you do not want to rely on npm link.
###

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/bpmn-js.git
git clone git@github.com:bpmn-io/bpmn-moddle.git


echo done.

echo setup diagram-js

cd $base/diagram-js
npm install


echo setup bpmn-moddle

cd $base/bpmn-moddle
npm install


echo setup bpmn-js

cd $base/bpmn-js
mkdir node_modules
ln -s $base/bpmn-moddle node_modules/bpmn-moddle
ln -s $base/diagram-js node_modules/diagram-js
npm install


cd $base

echo all done.
