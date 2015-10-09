var TestHelper = module.exports = require('./helper');

var fs = require('fs');

TestHelper.insertCSS('diagram-js.css', fs.readFileSync(__dirname + '/../assets/diagram-js.css', 'utf8'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: 500px; }' + '.test-container > div'
);


// add suite specific matchers
global.chai.use(require('./matchers/BoundsMatchers'));
global.chai.use(require('./matchers/ConnectionMatchers'));