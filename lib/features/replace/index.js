import CopyPasteModule from '../copy-paste/index.js';
import ReplaceModule from 'diagram-js/lib/features/replace';
import SelectionModule from 'diagram-js/lib/features/selection';

import BpmnReplace from './BpmnReplace.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    CopyPasteModule,
    ReplaceModule,
    SelectionModule
  ],
  bpmnReplace: [ 'type', BpmnReplace ]
};
