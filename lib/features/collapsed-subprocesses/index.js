import ExpandBehaviour from './ToggleCollapseBehaviour';
import RemoveDiagramBehavior from './DeleteBehaviour';

export default {
  __depends__: [ ],
  __init__: [
    'removeDiagramBehavior',
    'expandBehaviour'
  ],
  removeDiagramBehavior: ['type', RemoveDiagramBehavior],
  expandBehaviour: ['type', ExpandBehaviour]
};