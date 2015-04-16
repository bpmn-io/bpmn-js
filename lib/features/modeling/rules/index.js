module.exports = {
  __depends__: [
    require('diagram-js/lib/features/rules')
  ],
  __init__: [ 'bpmnRules' ],
  bpmnRules: [ 'type', require('./BpmnRules') ]
};
