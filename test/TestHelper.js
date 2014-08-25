var TestHelper = module.exports = require('./helper');

var fs = require('fs');

// insert diagram.css
TestHelper.insertCSS('diagram.css', fs.readFileSync(__dirname + '/../node_modules/diagram-js/assets/diagram.css', 'utf-8'));
