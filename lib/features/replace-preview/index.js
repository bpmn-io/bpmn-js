import PreviewSupportModule from 'diagram-js/lib/features/preview-support';

import BpmnReplacePreview from './BpmnReplacePreview';

export default {
  __depends__: [
    PreviewSupportModule
  ],
  __init__: [ 'bpmnReplacePreview' ],
  bpmnReplacePreview: [ 'type', BpmnReplacePreview ]
};
