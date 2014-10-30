module.exports = {
  __depends__: [
    require('diagram-js/lib/command'),
    require('diagram-js/lib/features/change-support'),
    require('diagram-js-direct-editing')
  ],
  __init__: [ 'labelEditingProvider' ],
  labelEditingProvider: [ 'type', require('./LabelEditingProvider') ]
};