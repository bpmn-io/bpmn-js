import MixedDiagramSupport from './MixedDiagramSupport';
import MixedDiagramBpmnUpdater from './MixedDiagramBpmnUpdater';
import MixedDiagramRules from './MixedDiagramRules';

export default {
  __init__: [
    'bpmnUpdater',
    'mixedDiagramSupport',
    'mixedDiagramRules'
  ],
  mixedDiagramSupport: [ 'type', MixedDiagramSupport ],
  bpmnUpdater: [ 'type', MixedDiagramBpmnUpdater ],
  mixedDiagramRules: [ 'type', MixedDiagramRules ]
};
