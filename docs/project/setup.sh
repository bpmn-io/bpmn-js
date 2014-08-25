#!/bin/bash

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git > /dev/null
git clone git@github.com:bpmn-io/diagram-js-direct-editing.git > /dev/null
git clone git@github.com:bpmn-io/moddle.git > /dev/null
git clone git@github.com:bpmn-io/moddle-xml.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-js.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-js-cli.git > /dev/null
git clone git@github.com:bpmn-io/bpmn-moddle.git > /dev/null
git clone git@github.com:bpmn-io/ids.git > /dev/null

echo done.

echo setup diagram-js

cd $base/diagram-js
npm install
npm link


echo setup moddle

cd $base/moddle
npm install > /dev/null
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

cd $base

echo all done.
