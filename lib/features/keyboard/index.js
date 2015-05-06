module.exports = {
  __depends__: [
    require('diagram-js/lib/features/keyboard')
  ],
  __init__: [ 'bpmnKeyBindings' ],
  bpmnKeyBindings: [ 'type', require('./BpmnKeyBindings') ]
};