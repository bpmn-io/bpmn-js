var TestHelper = module.exports = require('./helper');

var fs = require('fs');

// insert diagram.css
TestHelper.insertCSS('diagram-js.css', fs.readFileSync(__dirname + '/../assets/diagram-js.css', 'utf-8'));
