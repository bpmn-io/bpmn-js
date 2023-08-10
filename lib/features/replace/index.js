import CopyPasteModule from '../copy-paste';
import ReplaceModule from 'diagram-js/lib/features/replace';

import BpmnReplace from './BpmnReplace';

export default {
  __depends__: [
    CopyPasteModule,
    ReplaceModule
  ],
  bpmnReplace: [ 'type', BpmnReplace ]
};
