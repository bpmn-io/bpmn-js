module.exports = {
  __depends__: [
    require('../interaction-events'),
    require('../overlays')
  ],
  contextPad: [ 'type', require('./ContextPad') ]
};