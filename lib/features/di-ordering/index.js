import BpmnDiOrdering from '../di-ordering/BpmnDiOrdering.js';

export default {
  __init__: [
    'bpmnDiOrdering'
  ],
  bpmnDiOrdering: [ 'type', BpmnDiOrdering ]
};