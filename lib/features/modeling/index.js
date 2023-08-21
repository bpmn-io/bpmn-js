import BehaviorModule from './behavior';
import RulesModule from '../rules';
import DiOrderingModule from '../di-ordering';
import OrderingModule from '../ordering';
import ReplaceModule from '../replace';
import SpaceToolModule from '../space-tool';

import CommandModule from 'diagram-js/lib/command';
import LabelSupportModule from 'diagram-js/lib/features/label-support';
import AttachSupportModule from 'diagram-js/lib/features/attach-support';
import SelectionModule from 'diagram-js/lib/features/selection';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';

import BpmnFactory from './BpmnFactory';
import BpmnUpdater from './BpmnUpdater';
import ElementFactory from './ElementFactory';
import Modeling from './Modeling';
import BpmnLayouter from './BpmnLayouter';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';


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