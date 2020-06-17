export * from './helper';

import {
  insertCSS
} from './helper';

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-embedded.css', require('bpmn-font/dist/css/bpmn-embedded.css'));
insertCSS('app-embedded.css', require('./app-embedded.css'));
insertCSS('snippets.css', require('./snippets.css'));

insertCSS('diagram-js-testing.css', `
* {
  margin: 0;
}

html, body, .container {
  height: 100%;
}
`);


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
