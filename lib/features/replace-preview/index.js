module.exports = {
  __depends__: [ require('diagram-js/lib/features/preview-support') ],
  __init__: [ 'bpmnReplacePreview' ],
  bpmnReplacePreview: [ 'type', require('./BpmnReplacePreview') ]
};
