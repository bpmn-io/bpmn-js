module.exports = {
  __init__: [ 'bpmnModeling' ],
  __depends__: [
    require('../../core'),
    require('diagram-js/lib/cmd')
  ],
  bpmnFactory: [ 'type', require('./BpmnFactory') ],
  bpmnModeling: [ 'type', require('./BpmnModeling') ]
};