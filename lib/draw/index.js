import BpmnRenderer from './BpmnRenderer';
import TextRenderer from './TextRenderer';

import PathMap from './PathMap';

export default {
  __init__: [ 'bpmnRenderer' ],
  bpmnRenderer: [ 'type', BpmnRenderer ],
  textRenderer: [ 'type', TextRenderer ],
  pathMap: [ 'type', PathMap ]
};
