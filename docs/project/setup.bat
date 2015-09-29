@echo off

rem ###
rem # Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU)
rem ##

set BASE=%CD%

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/bpmn-js.git
git clone git@github.com:bpmn-io/bpmn-moddle.git

echo done.


echo setup diagram-js

cd %BASE%\diagram-js
npm install


echo setup bpmn-moddle

cd %BASE%\bpmn-moddle
npm install


echo prepare setup bpmn-js

mkdir %BASE%\bpmn-js\node_modules

rem link bpmn-js
mklink /D %BASE%\bpmn-js\node_modules\bpmn-moddle %BASE%\bpmn-moddle
mklink /D %BASE%\bpmn-js\node_modules\diagram-js %BASE%\diagram-js


echo setup bpmn-js

cd %BASE%\bpmn-js
npm install


cd %BASE%
