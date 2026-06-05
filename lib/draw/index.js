import BpmnRenderer from './BpmnRenderer.js';
import TextRenderer from './TextRenderer.js';

import PathMap from './PathMap.js';

export default {
  __init__: [ 'bpmnRenderer' ],
  bpmnRenderer: [ 'type', BpmnRenderer ],
  textRenderer: [ 'type', TextRenderer ],
  pathMap: [ 'type', PathMap ]
};
