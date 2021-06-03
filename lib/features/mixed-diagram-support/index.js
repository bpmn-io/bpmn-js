import MixedDiagramSupport from './MixedDiagramSupport';
import MixedDiagramBpmnUpdater from './MixedDiagramBpmnUpdater';

export default {
  __init__: [
    'bpmnUpdater',
    'mixedDiagramSupport'
  ],
  mixedDiagramSupport: [ 'type', MixedDiagramSupport ],
  bpmnUpdater: [ 'type', MixedDiagramBpmnUpdater ]
};
