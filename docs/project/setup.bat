@echo off

rem ###
rem # Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU)
rem ##

set BASE=%CD%

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

cd %BASE%\diagram-js
npm install


echo setup moddle

cd %BASE%\moddle
npm install


echo setup moddle-xml

cd %BASE%\moddle-xml
mkdir node_modules
mklink /D %BASE%\moddle-xml\node_modules\moddle %BASE%\moddle
npm install


echo setup bpmn-moddle

cd %BASE%\bpmn-moddle
mkdir node_modules
mklink /D %BASE%\bpmn-moddle\node_modules\moddle-xml %BASE%\moddle-xml
mklink /D %BASE%\bpmn-moddle\node_modules\moddle %BASE%\moddle
npm install


echo setup diagram-js-direct-editing

cd %BASE%\diagram-js-direct-editing
mkdir node_modules
mklink /D %BASE%\diagram-js-direct-editing\node_modules\diagram-js %BASE%\diagram-js
npm install


echo setup ids

cd %BASE%\ids
npm install


echo prepare setup bpmn-js

rem link bpmn-js <> bpmn-js-cli (circular dev dependency)

mkdir %BASE%\bpmn-js\node_modules
mkdir %BASE%\bpmn-js-cli\node_modules

rem link bpmn-js
mklink /D %BASE%\bpmn-js\node_modules\bpmn-moddle %BASE%\bpmn-moddle
mklink /D %BASE%\bpmn-js\node_modules\diagram-js %BASE%\diagram-js
mklink /D %BASE%\bpmn-js\node_modules\diagram-js-direct-editing %BASE%\diagram-js-direct-editing
mklink /D %BASE%\bpmn-js\node_modules\bpmn-js-cli %BASE%\bpmn-js-cli
mklink /D %BASE%\bpmn-js\node_modules\ids %BASE%\ids

rem link bpmn-js-cli
mklink /D %BASE%\bpmn-js-cli\node_modules\bpmn-js %BASE%\bpmn-js


echo setup bpmn-js

cd %BASE%\bpmn-js
npm install


echo setup bpmn-js-cli

cd %BASE%\bpmn-js-cli
npm install


cd %BASE%