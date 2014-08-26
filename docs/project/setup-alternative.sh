#!/bin/bash

###
# Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU). Use if you do not want to rely on npm link.
###

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/diagram-js-direct-editing.git
git clone git@github.com:bpmn-io/moddle.git
git clone git@github.com:bpmn-io/moddle-xml.git
git clone git@github.com:bpmn-io/bpmn-js.git
git clone git@github.com:bpmn-io/bpmn-js-cli.git
git clone git@github.com:bpmn-io/bpmn-moddle.git
git clone git@github.com:bpmn-io/ids.git


echo done.

echo setup diagram-js

cd $base/diagram-js
npm install


echo setup moddle

cd $base/moddle
npm install


echo setup moddle-xml

cd $base/moddle-xml
mkdir node_modules
ln -s $base/moddle node_modules/moddle
npm install


echo setup bpmn-moddle

cd $base/bpmn-moddle
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/moddle-xml node_modules/moddle-xml
npm install


echo setup diagram-js-direct-editing

cd $base/diagram-js-direct-editing
mkdir node_modules
ln -s $base/diagram-js node_modules/diagram-js
npm install


echo setup ids

cd $base/ids
npm install


echo setup bpmn-js

cd $base/bpmn-js
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/bpmn-js-cli node_modules/bpmn-js-cli
ln -s $base/bpmn-moddle node_modules/bpmn-moddle
ln -s $base/diagram-js node_modules/diagram-js
ln -s $base/diagram-js-direct-editing node_modules/diagram-js-direct-editing
ln -s $base/ids node_modules/ids
npm install


echo setup bpmn-js-cli

cd $base/bpmn-js-cli
mkdir node_modules
ln -s $base/bpmn-js node_modules/bpmn-js
npm install


cd $base

echo all done.