export * from './helper';

import fileDrop from 'file-drops';

import {
  insertCSS,
  getBpmnJS
} from './helper';

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-js.css', require('../assets/bpmn-js.css'));

insertCSS('bpmn-embedded.css', require('bpmn-font/dist/css/bpmn-embedded.css'));

insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-content-container { height: 90vh; }'
);


import ChaiMatch from 'chai-match';
import BoundsMatchers from './matchers/BoundsMatchers';
import ConnectionMatchers from './matchers/ConnectionMatchers';
import JSONMatcher from './matchers/JSONMatcher';

/* global chai */

// add suite specific matchers
chai.use(ChaiMatch);
chai.use(BoundsMatchers);
chai.use(ConnectionMatchers);
chai.use(JSONMatcher);

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