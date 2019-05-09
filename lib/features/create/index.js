import BpmnCreateConnectPreview from './BpmnCreateConnectPreview';
import CreateModule from 'diagram-js/lib/features/create';

export default {
  __depends__: [ CreateModule ],
  __init__: [ 'createConnectPreview' ],
  createConnectPreview: [ 'type', BpmnCreateConnectPreview ]
};