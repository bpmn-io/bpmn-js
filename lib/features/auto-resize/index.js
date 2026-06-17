import BpmnAutoResize from './BpmnAutoResize.js';
import BpmnAutoResizeProvider from './BpmnAutoResizeProvider.js';


export default {
  __init__: [
    'bpmnAutoResize',
    'bpmnAutoResizeProvider'
  ],
  bpmnAutoResize: [ 'type', BpmnAutoResize ],
  bpmnAutoResizeProvider: [ 'type', BpmnAutoResizeProvider ]
};
