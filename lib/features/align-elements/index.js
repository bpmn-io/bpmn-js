import AlignElementsModule from 'diagram-js/lib/features/align-elements';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import PopupMenuModule from 'diagram-js/lib/features/popup-menu';

import AlignElementsContextPadProvider from './AlignElementsContextPadProvider';
import AlignElementsMenuProvider from './AlignElementsMenuProvider';
import BpmnAlignElements from './BpmnAlignElements';

export default {
  __depends__: [
    AlignElementsModule,
    ContextPadModule,
    PopupMenuModule
  ],
  __init__: [
    'alignElementsContextPadProvider',
    'alignElementsMenuProvider',
    'bpmnAlignElements'
  ],
  alignElementsContextPadProvider: [ 'type', AlignElementsContextPadProvider ],
  alignElementsMenuProvider: [ 'type', AlignElementsMenuProvider ],
  bpmnAlignElements: [ 'type', BpmnAlignElements ]
};
