import BehaviorModule from './behavior/index.js';
import RulesModule from '../rules/index.js';
import DiOrderingModule from '../di-ordering/index.js';
import OrderingModule from '../ordering/index.js';
import ReplaceModule from '../replace/index.js';
import SpaceToolModule from '../space-tool/index.js';

import CommandModule from 'diagram-js/lib/command';
import LabelSupportModule from 'diagram-js/lib/features/label-support';
import AttachSupportModule from 'diagram-js/lib/features/attach-support';
import SelectionModule from 'diagram-js/lib/features/selection';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';

import BpmnFactory from './BpmnFactory.js';
import BpmnUpdater from './BpmnUpdater.js';
import ElementFactory from './ElementFactory.js';
import Modeling from './Modeling.js';
import BpmnLayouter from './BpmnLayouter.js';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'modeling',
    'bpmnUpdater'
  ],
  __depends__: [
    BehaviorModule,
    RulesModule,
    DiOrderingModule,
    OrderingModule,
    ReplaceModule,
    CommandModule,
    LabelSupportModule,
    AttachSupportModule,
    SelectionModule,
    ChangeSupportModule,
    SpaceToolModule
  ],
  bpmnFactory: [ 'type', BpmnFactory ],
  bpmnUpdater: [ 'type', BpmnUpdater ],
  elementFactory: [ 'type', ElementFactory ],
  modeling: [ 'type', Modeling ],
  layouter: [ 'type', BpmnLayouter ],
  connectionDocking: [ 'type', CroppingConnectionDocking ]
};