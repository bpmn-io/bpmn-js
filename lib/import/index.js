module.exports = {
  __depends__: [
    require('../features/translate')
  ],
  bpmnImporter: [ 'type', require('./BpmnImporter') ]
};