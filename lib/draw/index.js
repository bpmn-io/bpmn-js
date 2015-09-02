module.exports = {
  __init__: [ 'bpmnRenderer' ],
  bpmnRenderer: [ 'type', require('./BpmnRenderer') ],
  pathMap: [ 'type', require('./PathMap') ]
};
