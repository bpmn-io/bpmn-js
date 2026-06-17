export * from 'bpmn-js/test/helper';

import fileDrop from 'file-drops';

import {
  insertCSS,
  getBpmnJS
} from 'bpmn-js/test/helper';

import diagramJsCSS from 'diagram-js/assets/diagram-js.css';
import bpmnJsCSS from '../assets/bpmn-js.css';
import bpmnEmbeddedCSS from 'bpmn-font/dist/css/bpmn-embedded.css';


// add core styles
insertCSS('diagram-js.css', diagramJsCSS);
insertCSS('bpmn-js.css', bpmnJsCSS);
insertCSS('bpmn-embedded.css', bpmnEmbeddedCSS);
insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-content-container { height: 90vh; }'
);

// be able to load files into running bpmn-js test cases
document.documentElement.addEventListener('dragover', fileDrop('Drop a BPMN diagram to open it in the currently active test.', function(files) {
  const bpmnJS = getBpmnJS();

  if (bpmnJS && files.length === 1) {
    bpmnJS.importXML(files[0].contents);
  }
}));

insertCSS('file-drops.css', `
  .drop-overlay .box {
    background: orange;
    border-radius: 3px;
    display: inline-block;
    font-family: sans-serif;
    padding: 4px 10px;
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
  }
`);