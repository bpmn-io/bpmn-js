import AdaptiveLabelPositioningBehavior from './AdaptiveLabelPositioningBehavior';
import AppendBehavior from './AppendBehavior';
import BoundaryEventBehavior from './BoundaryEventBehavior';
import CopyPasteBehavior from './CopyPasteBehavior';
import CreateBoundaryEventBehavior from './CreateBoundaryEventBehavior';
import DataObjectBehavior from './DataObjectBehavior';
import CreateParticipantBehavior from './CreateParticipantBehavior';
import DataInputAssociationBehavior from './DataInputAssociationBehavior';
import DataOutputAssociationBehavior from './DataOutputAssociationBehavior';
import DataStoreBehavior from './DataStoreBehavior';
import DeleteLaneBehavior from './DeleteLaneBehavior';
import DropOnFlowBehavior from './DropOnFlowBehavior';
import ImportDockingFix from './ImportDockingFix';
import LabelBehavior from './LabelBehavior';
import ModelingFeedback from './ModelingFeedback';
import ReplaceConnectionBehavior from './ReplaceConnectionBehavior';
import RemoveParticipantBehavior from './RemoveParticipantBehavior';
import ReplaceElementBehaviour from './ReplaceElementBehaviour';
import ResizeLaneBehavior from './ResizeLaneBehavior';
import RemoveElementBehavior from './RemoveElementBehavior';
import ToggleElementCollapseBehaviour from './ToggleElementCollapseBehaviour';
import UnclaimIdBehavior from './UnclaimIdBehavior';
import UpdateFlowNodeRefsBehavior from './UpdateFlowNodeRefsBehavior';
import UnsetDefaultFlowBehavior from './UnsetDefaultFlowBehavior';

export default {
  __init__: [
    'adaptiveLabelPositioningBehavior',
    'appendBehavior',
    'boundaryEventBehavior',
    'copyPasteBehavior',
    'createBoundaryEventBehavior',
    'dataObjectBehavior',
    'dataStoreBehavior',
    'createParticipantBehavior',
    'dataInputAssociationBehavior',
    'dataOutputAssociationBehavior',
    'deleteLaneBehavior',
    'dropOnFlowBehavior',
    'importDockingFix',
    'labelBehavior',
    'modelingFeedback',
    'removeElementBehavior',
    'removeParticipantBehavior',
    'replaceConnectionBehavior',
    'replaceElementBehaviour',
    'resizeLaneBehavior',
    'toggleElementCollapseBehaviour',
    'unclaimIdBehavior',
    'unsetDefaultFlowBehavior',
    'updateFlowNodeRefsBehavior'
  ],
  adaptiveLabelPositioningBehavior: [ 'type', AdaptiveLabelPositioningBehavior ],
  appendBehavior: [ 'type', AppendBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  copyPasteBehavior: [ 'type', CopyPasteBehavior ],
  createBoundaryEventBehavior: [ 'type', CreateBoundaryEventBehavior ],
  dataObjectBehavior: [ 'type', DataObjectBehavior ],
  createParticipantBehavior: [ 'type', CreateParticipantBehavior ],
  dataInputAssociationBehavior: [ 'type', DataInputAssociationBehavior ],
  dataOutputAssociationBehavior: [ 'type', DataOutputAssociationBehavior ],
  dataStoreBehavior: [ 'type', DataStoreBehavior ],
  deleteLaneBehavior: [ 'type', DeleteLaneBehavior ],
  dropOnFlowBehavior: [ 'type', DropOnFlowBehavior ],
  importDockingFix: [ 'type', ImportDockingFix ],
  labelBehavior: [ 'type', LabelBehavior ],
  modelingFeedback: [ 'type', ModelingFeedback ],
  replaceConnectionBehavior: [ 'type', ReplaceConnectionBehavior ],
  removeParticipantBehavior: [ 'type', RemoveParticipantBehavior ],
  replaceElementBehaviour: [ 'type', ReplaceElementBehaviour ],
  resizeLaneBehavior: [ 'type', ResizeLaneBehavior ],
  removeElementBehavior: [ 'type', RemoveElementBehavior ],
  toggleElementCollapseBehaviour : [ 'type', ToggleElementCollapseBehaviour ],
  unclaimIdBehavior: [ 'type', UnclaimIdBehavior ],
  updateFlowNodeRefsBehavior: [ 'type', UpdateFlowNodeRefsBehavior ],
  unsetDefaultFlowBehavior: [ 'type', UnsetDefaultFlowBehavior ]
};
