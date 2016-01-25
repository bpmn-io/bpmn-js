'use strict';

module.exports = {
  __depends__: [ require('../tool-manager') ],
  __init__: [ 'handTool' ],
  handTool: [ 'type', require('./HandTool') ]
};
