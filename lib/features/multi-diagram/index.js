import DiagramSwitch from './DiagramSwitch';
import DiagramUtil from './utils';

export default {
  __init__: [
    'diagramSwitch'
  ],
  __depends__: [
    DiagramUtil
  ],
  diagramSwitch: [ 'type', DiagramSwitch ]
};
