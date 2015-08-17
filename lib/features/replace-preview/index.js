module.exports = {
  __depends__: [ require('diagram-js/lib/features/move') ],
  __init__: ['bpmnReplacePreview'],
  bpmnReplacePreview: [ 'type', require('./BpmnReplacePreview') ]
};
