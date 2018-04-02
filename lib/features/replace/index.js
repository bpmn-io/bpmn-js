import SelectionModule from 'diagram-js/lib/features/selection';
import ReplaceModule from 'diagram-js/lib/features/replace';

import BpmnReplace from './BpmnReplace';

export default {
  __depends__: [
    SelectionModule,
    ReplaceModule
  ],
  bpmnReplace: [ 'type', BpmnReplace ]
};
