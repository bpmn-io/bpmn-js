import NavigationBehaviour from './NavigationBehaviour';
import ExpandBehaviour from './ToggleCollapseBehaviour';

import RemoveDiagramBehavior from './DeleteBehaviour';

// import DiagramUtil from './diagramUtil';


// import UndoBehaviour from './UndoBehaviour';

export default {
  __depends__: [ ],
  __init__: [ 'navigationBehaviour',

    // 'diagramUtil',
    'removeDiagramBehavior',

    //   // 'undoBehaviour',
    'expandBehaviour'
  ],
  navigationBehaviour: [ 'type', NavigationBehaviour ],

  // diagramUtil: [ 'type', DiagramUtil ],
  removeDiagramBehavior: ['type', RemoveDiagramBehavior],

  // // undoBehaviour: ['type', UndoBehaviour],
  expandBehaviour: ['type', ExpandBehaviour]
};