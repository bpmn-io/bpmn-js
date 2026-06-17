import PreviewSupportModule from 'diagram-js/lib/features/preview-support';

import BpmnReplacePreview from './BpmnReplacePreview.js';

export default {
  __depends__: [
    PreviewSupportModule
  ],
  __init__: [ 'bpmnReplacePreview' ],
  bpmnReplacePreview: [ 'type', BpmnReplacePreview ]
};
