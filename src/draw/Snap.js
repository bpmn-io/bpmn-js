var components = require('../di').defaultModule;

var snapsvg = require('snapsvg');

// require snapsvg extensions
require('./snapsvg-extensions');

// register as a value
components.value('Snap', snapsvg);

module.exports = snapsvg;