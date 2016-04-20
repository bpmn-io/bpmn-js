module.exports = {
  __depends__: [
    require('diagram-js/lib/features/copy-paste')
  ],
  __init__: [ 'bpmnCopyPaste' ],
  bpmnCopyPaste: [ 'type', require('./BpmnCopyPaste') ]
};
