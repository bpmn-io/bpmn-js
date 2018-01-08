'use strict';

var TestHelper = module.exports = require('./helper');

TestHelper.insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

TestHelper.insertCSS('bpmn-embedded.css', require('bpmn-font/dist/css/bpmn-embedded.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-container .test-content-container { height: 90vmin; }'
);


// add suite specific matchers
global.chai.use(require('chai-match'));
global.chai.use(require('./matchers/BoundsMatchers'));
global.chai.use(require('./matchers/ConnectionMatchers'));
global.chai.use(require('./matchers/JSONMatcher'));
