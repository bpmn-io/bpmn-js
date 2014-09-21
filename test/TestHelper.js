var TestHelper = module.exports = require('./helper');

var fs = require('fs');

// insert diagram.css
TestHelper.insertCSS('diagram.css', fs.readFileSync(__dirname + '/../assets/diagram.css', 'utf-8'));
