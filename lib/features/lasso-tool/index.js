'use strict';

module.exports = {
  __depends__: [ require('../tool-manager') ],
  __init__: [ 'lassoTool' ],
  lassoTool: [ 'type', require('./LassoTool') ]
};
