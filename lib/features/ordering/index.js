module.exports = {
  __init__: [ 'bpmnOrderingProvider' ],
  __depends__: [
    require('diagram-js/lib/i18n/translate')
  ],
  bpmnOrderingProvider: [ 'type', require('./BpmnOrderingProvider') ]
};