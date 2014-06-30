module.exports = {
  __depends__: [ require('../core') ],
  renderer: [ 'type', require('./BpmnRenderer') ],
  pathMap: [ 'type', require('./PathMap') ]
};