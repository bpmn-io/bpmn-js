module.exports = {
  __depends__: [
    require('../../core'),
    require('diagram-js/lib/cmd'),
    require('diagram-js/lib/features/change-support'),
    require('diagram-js-direct-editing')
  ],
  __init__: [ 'labelEditingProvider' ],
  labelEditingProvider: [ 'type', require('./LabelEditingProvider') ]
};