import BpmnDiOrdering from '../di-ordering/BpmnDiOrdering';

export default {
  __init__: [
    'bpmnDiOrdering'
  ],
  bpmnDiOrdering: [ 'type', BpmnDiOrdering ]
};