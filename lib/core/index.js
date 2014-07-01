module.exports = {
  __init__: [ 'bpmnRegistry' ],
  bpmnRegistry: [ 'type', require('./BpmnRegistry') ],
  bpmnImporter: [ 'type', require('./BpmnImporter') ]
};