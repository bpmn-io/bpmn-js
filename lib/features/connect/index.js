import BpmnConnectPreview from './BpmnConnectPreview';
import ConnectModule from 'diagram-js/lib/features/connect';

export default {
  __depends__: [ ConnectModule ],
  __init__: [ 'connectPreview' ],
  connectPreview: [ 'type', BpmnConnectPreview ]
};