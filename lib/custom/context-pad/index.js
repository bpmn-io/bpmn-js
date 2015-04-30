module.exports = {
  __init__: [ 'customContextPadProvider' ],
  __depends__: [
    require('diagram-js/lib/features/context-pad')
  ],
  customContextPadProvider: [ 'type', require('./CustomContextPadProvider') ]
};