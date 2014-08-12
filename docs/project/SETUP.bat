SET BASE=%CD%

mklink /D %BASE%\bpmn-js\node_modules\diagram-js-direct-editing %BASE%\diagram-js-direct-editing
mklink /D %BASE%\bpmn-js\node_modules\bpmn-js-cli %BASE%\bpmn-js-cli
mklink /D %BASE%\bpmn-js\node_modules\diagram-js %BASE%\diagram-js
mklink /D %BASE%\bpmn-js\node_modules\bpmn-moddle %BASE%\bpmn-moddle
mklink /D %BASE%\bpmn-js\node_modules\ids %BASE%\ids


mklink /D %BASE%\bpmn-moddle\node_modules\moddle-xml %BASE%\moddle-xml
mklink /D %BASE%\bpmn-moddle\node_modules\moddle %BASE%\moddle


mklink /D %BASE%\moddle-xml\node_modules\moddle %BASE%\moddle


mklink /D %BASE%\bpmn-js-cli\node_modules\bpmn-js %BASE%\bpmn-js
mklink /D %BASE%\bpmn-js-cli\node_modules\diagram-js %BASE%\diagram-js


mklink /D %BASE%\diagram-js-direct-editing\node_modules\diagram-js %BASE%\diagram-js


cd %BASE%\diagram-js
npm install

cd %BASE%\diagram-js-direct-editing
npm install

cd %BASE%\moddle
npm install

cd %BASE%\moddle-xml
npm install

cd %BASE%\bpmn-moddle
npm install

cd %BASE%\bpmn-js
npm install

cd %BASE%\bpmn-js-cli
npm install

cd %BASE%\ids
npm install

cd %BASE%