import BpmnGridSnapping from './BpmnGridSnapping.js';
import GridSnappingModule from 'diagram-js/lib/features/grid-snapping';

import GridSnappingBehaviorModule from './behavior/index.js';

export default {
  __depends__: [
    GridSnappingModule,
    GridSnappingBehaviorModule
  ],
  __init__: [ 'bpmnGridSnapping' ],
  bpmnGridSnapping: [ 'type', BpmnGridSnapping ]
};