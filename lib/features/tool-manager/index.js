'use strict';

module.exports = {
  __depends__: [ require('../dragging') ],
  __init__: [ 'toolManager' ],
  toolManager: [ 'type', require('./ToolManager') ]
};
