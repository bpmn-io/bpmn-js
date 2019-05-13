import BpmnConnectionPreview from './BpmnConnectionPreview';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';

export default {
  __depends__: [ ConnectionPreviewModule ],
  __init__: [ 'connectionPreview' ],
  connectionPreview: [ 'type', BpmnConnectionPreview ]
};