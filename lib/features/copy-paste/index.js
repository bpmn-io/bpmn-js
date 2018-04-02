import CopyPasteModule from 'diagram-js/lib/features/copy-paste';

import BpmnCopyPaste from './BpmnCopyPaste';

export default {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'bpmnCopyPaste' ],
  bpmnCopyPaste: [ 'type', BpmnCopyPaste ]
};
