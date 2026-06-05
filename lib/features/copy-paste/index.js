import CopyPasteModule from 'diagram-js/lib/features/copy-paste';

import BpmnCopyPaste from './BpmnCopyPaste.js';
import ModdleCopy from './ModdleCopy.js';

export default {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'bpmnCopyPaste', 'moddleCopy' ],
  bpmnCopyPaste: [ 'type', BpmnCopyPaste ],
  moddleCopy: [ 'type', ModdleCopy ]
};
