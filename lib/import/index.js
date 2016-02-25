module.exports = {
  __depends__: [
    require('../features/i18n')
  ],
  bpmnImporter: [ 'type', require('./BpmnImporter') ]
};