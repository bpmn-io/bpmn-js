var TestHelper = module.exports = require('./helper');

var fs = require('fs');

TestHelper.insertCSS('diagram-js.css', fs.readFileSync(__dirname + '/../node_modules/diagram-js/assets/diagram-js.css', 'utf-8'));
TestHelper.insertCSS('bpmn-embedded.css', fs.readFileSync(__dirname + '/../assets/bpmn-font/css/bpmn-embedded.css', 'utf-8'));
