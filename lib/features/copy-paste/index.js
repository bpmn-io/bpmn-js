import CopyPasteModule from 'diagram-js/lib/features/copy-paste';

import BpmnCopyPaste from './BpmnCopyPaste';
import ModdleCopy from './ModdleCopy';
import BpmnCrossWindowCopyPaste from './BpmnCrossWindowCopyPaste';

export default {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'bpmnCopyPaste', 'moddleCopy', 'bpmnCrossWindowCopyPaste' ],
  bpmnCopyPaste: [ 'type', BpmnCopyPaste ],
  moddleCopy: [ 'type', ModdleCopy ],
  bpmnCrossWindowCopyPaste: [ 'type', BpmnCrossWindowCopyPaste ]
};
