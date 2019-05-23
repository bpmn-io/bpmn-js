import BpmnConnectSnapping from './BpmnConnectSnapping';
import BpmnCreateMoveSnapping from './BpmnCreateMoveSnapping';
import SnappingModule from 'diagram-js/lib/features/snapping';

export default {
  __depends__: [ SnappingModule ],
  __init__: [
    'connectSnapping',
    'createMoveSnapping'
  ],
  connectSnapping: [ 'type', BpmnConnectSnapping ],
  createMoveSnapping: [ 'type', BpmnCreateMoveSnapping ]
};