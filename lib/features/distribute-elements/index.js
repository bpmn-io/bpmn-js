module.exports = {
  __depends__: [
    require('diagram-js/lib/features/distribute-elements')
  ],
  __init__: [ 'bpmnDistributeElements' ],
  bpmnDistributeElements: [ 'type', require('./BpmnDistributeElements') ]
};
