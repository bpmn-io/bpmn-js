import BpmnGridSnapping from './BpmnGridSnapping';
import GridSnappingModule from 'diagram-js/lib/features/grid-snapping';

export default {
  __depends__: [ GridSnappingModule ],
  __init__: [ 'bpmnGridSnapping' ],
  bpmnGridSnapping: [ 'type', BpmnGridSnapping ]
};