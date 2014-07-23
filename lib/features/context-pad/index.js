module.exports = {
  __depends__: [
    require('diagram-js-direct-editing'),
    require('diagram-js/lib/features/context-pad'),
    require('diagram-js/lib/features/selection'),
    require('../modeling')
  ],
  __init__: [ 'contextPadProvider' ],
  contextPadProvider: [ 'type', require('./ContextPadProvider') ]
};