#!/bin/bash

###
# Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU)
###

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/diagram-js-direct-editing.git
git clone git@github.com:bpmn-io/moddle.git
git clone git@github.com:bpmn-io/moddle-xml.git
git clone git@github.com:bpmn-io/bpmn-js.git
git clone git@github.com:bpmn-io/bpmn-js-integration.git
git clone git@github.com:bpmn-io/bpmn-js-cli.git
git clone git@github.com:bpmn-io/bpmn-moddle.git
git clone git@github.com:bpmn-io/ids.git

echo done.


echo setup diagram-js

cd $base/diagram-js
npm install
npm link


echo setup moddle

cd $base/moddle
npm install
npm link


echo setup moddle-xml

cd $base/moddle-xml
npm link moddle
npm install
npm link


echo setup bpmn-moddle

cd $base/bpmn-moddle
npm link moddle-xml
npm link moddle
npm install
npm link


echo setup diagram-js-direct-editing

cd $base/diagram-js-direct-editing
npm link diagram-js
npm install
npm link


echo setup ids

cd $base/ids
npm install
npm link


echo setup bpmn-js

cd $base/bpmn-js
npm install
npm link diagram-js
npm link diagram-js-direct-editing
npm link ids
npm link bpmn-moddle
npm link


echo setup bpmn-js-cli

cd $base/bpmn-js-cli
npm install
npm link bpmn-js
npm link

# deferred link cli (circular dev dependency)
cd $base/bpmn-js
npm link bpmn-js-cli


echo setup bpmn-js-integration

cd $base/bpmn-js-integration
npm install
npm link bpmn-js
npm link bpmn-js-cli
npm link bpmn-moddle

cd $base

echo all done.
