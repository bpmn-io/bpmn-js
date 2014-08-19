#!/bin/bash

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git > /dev/null
git clone git@github.com:bpmn-io/diagram-js-direct-editing.git > /dev/null
git clone git@github.com:bpmn-io/moddle.git > /dev/null
git clone git@github.com:bpmn-io/moddle-xml.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-js.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-moddle.git > /dev/null
git clone git@github.com:bpmn-io/ids.git > /dev/null

echo done.

echo setup diagram-js

cd $base/diagram-js
npm install > /dev/null


echo setup moddle

cd $base/moddle
npm install > /dev/null


echo setup moddle-xml

cd $base/moddle-xml
mkdir node_modules
ln -s $base/moddle node_modules/moddle
npm install > /dev/null


echo setup bpmn-moddle

cd $base/bpmn-moddle
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/moddle-xml node_modules/moddle-xml
npm install > /dev/null

echo setup diagram-js-direct-editing

cd $base/diagram-js-direct-editing
mkdir node_modules
ln -s $base/diagram-js node_modules/diagram-js
npm install > /dev/null

echo setup ids

cd $base/ids
npm install > /dev/null

echo setup bpmn-js

cd $base/bpmn-js
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/bpmn-moddle node_modules/bpmn-moddle
ln -s $base/diagram-js node_modules/diagram-js
ln -s $base/diagram-js-direct-editing node_modules/diagram-js-direct-editing
ln -s $base/ids node_modules/ids
npm install > /dev/null

echo all done.
