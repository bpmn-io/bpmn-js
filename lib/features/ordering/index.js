module.exports = {
  __init__: [ 'bpmnOrderingProvider' ],
  __depends__: [
    require('../translate')
  ],
  bpmnOrderingProvider: [ 'type', require('./BpmnOrderingProvider') ]
};