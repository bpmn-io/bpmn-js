import DistributeElementsModule from 'diagram-js/lib/features/distribute-elements';
import PopupMenuModule from 'diagram-js/lib/features/popup-menu';

import BpmnDistributeElements from './BpmnDistributeElements';
import DistributeElementsMenuProvider from './DistributeElementsMenuProvider';


export default {
  __depends__: [
    PopupMenuModule,
    DistributeElementsModule
  ],
  __init__: [
    'bpmnDistributeElements',
    'distributeElementsMenuProvider'
  ],
  bpmnDistributeElements: [ 'type', BpmnDistributeElements ],
  distributeElementsMenuProvider: [ 'type', DistributeElementsMenuProvider ]
};
