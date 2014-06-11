module.exports = {
  __depends__: [
    require('../../core'),
    require('diagram-js-direct-editing')
  ],
  __init__: [ 'labelEditingProvider' ],
  labelEditingProvider: [ 'type', require('./LabelEditingProvider') ]
};