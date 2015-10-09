'use strict';

var TestHelper = module.exports = require('./helper');

TestHelper.insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

TestHelper.insertCSS('bpmn-embedded.css', require('../assets/bpmn-font/css/bpmn-embedded.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: 500px; }' + '.test-container > div'
);


// add suite specific matchers
global.chai.use(require('./matchers/BoundsMatchers'));
global.chai.use(require('./matchers/ConnectionMatchers'));