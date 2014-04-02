var diagramModule = require('../di').defaultModule;

var snapsvg = require('snapsvg');

// require snapsvg extensions
require('./snapsvg-extensions');

// register as a value
diagramModule.value('snap', snapsvg);

module.exports = snapsvg;