module.exports = {
  __depends__: [
    require('diagram-js/lib/features/keyboard'),
    require('../global-connect')
  ],
  __init__: [ 'bpmnKeyBindings' ],
  bpmnKeyBindings: [ 'type', require('./BpmnKeyBindings') ]
};