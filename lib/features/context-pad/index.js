module.exports = {
  __depends__: [
    require('diagram-js/lib/features/context-pad'),
    require('diagram-js-direct-editing'),
    require('../bpmn-modeling')
  ],
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', require('./ContextPadProvider') ]
};