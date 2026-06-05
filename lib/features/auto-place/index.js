import AutoPlaceModule from 'diagram-js/lib/features/auto-place';

import BpmnAutoPlace from './BpmnAutoPlace.js';

export default {
  __depends__: [ AutoPlaceModule ],
  __init__: [ 'bpmnAutoPlace' ],
  bpmnAutoPlace: [ 'type', BpmnAutoPlace ]
};