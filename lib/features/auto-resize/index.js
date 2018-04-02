import BpmnAutoResize from './BpmnAutoResize';
import BpmnAutoResizeProvider from './BpmnAutoResizeProvider';


export default {
  __init__: [
    'bpmnAutoResize',
    'bpmnAutoResizeProvider'
  ],
  bpmnAutoResize: [ 'type', BpmnAutoResize ],
  bpmnAutoResizeProvider: [ 'type', BpmnAutoResizeProvider ]
};
