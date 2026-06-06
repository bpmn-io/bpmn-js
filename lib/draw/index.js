import BpmnRenderer from './BpmnRenderer';
import DarkModeRenderer from './DarkModeRenderer';
import TextRenderer from './TextRenderer';

import PathMap from './PathMap';

export default {
  __init__: [ 'darkModeRenderer' ],
  darkModeRenderer: [ 'type', DarkModeRenderer ],
  bpmnRenderer: [ 'type', BpmnRenderer ],
  textRenderer: [ 'type', TextRenderer ],
  pathMap: [ 'type', PathMap ]
};
