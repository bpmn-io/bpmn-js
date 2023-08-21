import AdaptiveLabelPositioningBehavior from './AdaptiveLabelPositioningBehavior';
import AppendBehavior from './AppendBehavior';
import AssociationBehavior from './AssociationBehavior';
import AttachEventBehavior from './AttachEventBehavior';
import BoundaryEventBehavior from './BoundaryEventBehavior';
import CreateBehavior from './CreateBehavior';
import CreateDataObjectBehavior from './CreateDataObjectBehavior';
import CreateParticipantBehavior from './CreateParticipantBehavior';
import DataInputAssociationBehavior from './DataInputAssociationBehavior';
import DataStoreBehavior from './DataStoreBehavior';
import DeleteLaneBehavior from './DeleteLaneBehavior';
import DetachEventBehavior from './DetachEventBehavior';
import DropOnFlowBehavior from './DropOnFlowBehavior';
import EventBasedGatewayBehavior from './EventBasedGatewayBehavior';
import FixHoverBehavior from './FixHoverBehavior';
import GroupBehavior from './GroupBehavior';
import ImportDockingFix from './ImportDockingFix';
import IsHorizontalFix from './IsHorizontalFix';
import LabelBehavior from './LabelBehavior';
import LayoutConnectionBehavior from './LayoutConnectionBehavior';
import MessageFlowBehavior from './MessageFlowBehavior';
import RemoveEmbeddedLabelBoundsBehavior from './RemoveEmbeddedLabelBoundsBehavior';
import RemoveElementBehavior from './RemoveElementBehavior';
import RemoveParticipantBehavior from './RemoveParticipantBehavior';
import ReplaceConnectionBehavior from './ReplaceConnectionBehavior';
import ReplaceElementBehaviour from './ReplaceElementBehaviour';
import ResizeBehavior from './ResizeBehavior';
import ResizeLaneBehavior from './ResizeLaneBehavior';
import RootElementReferenceBehavior from './RootElementReferenceBehavior';
import SpaceToolBehavior from './SpaceToolBehavior';
import SubProcessPlaneBehavior from './SubProcessPlaneBehavior';
import SubProcessStartEventBehavior from './SubProcessStartEventBehavior';
import ToggleCollapseConnectionBehaviour from './ToggleCollapseConnectionBehaviour';
import ToggleElementCollapseBehaviour from './ToggleElementCollapseBehaviour';
import UnclaimIdBehavior from './UnclaimIdBehavior';
import UnsetDefaultFlowBehavior from './UnsetDefaultFlowBehavior';
import UpdateFlowNodeRefsBehavior from './UpdateFlowNodeRefsBehavior';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'adaptiveLabelPositioningBehavior',
    'appendBehavior',
    'associationBehavior',
    'attachEventBehavior',
    'boundaryEventBehavior',
    'createBehavior',
    'createDataObjectBehavior',
    'createParticipantBehavior',
    'dataInputAssociationBehavior',
    'dataStoreBehavior',
    'deleteLaneBehavior',
    'detachEventBehavior',
    'dropOnFlowBehavior',
    'eventBasedGatewayBehavior',
    'fixHoverBehavior',
    'groupBehavior',
    'importDockingFix',
    'isHorizontalFix',
    'labelBehavior',
    'layoutConnectionBehavior',
    'messageFlowBehavior',
    'removeElementBehavior',
    'removeEmbeddedLabelBoundsBehavior',
    'removeParticipantBehavior',
    'replaceConnectionBehavior',
    'replaceElementBehaviour',
    'resizeBehavior',
    'resizeLaneBehavior',
    'rootElementReferenceBehavior',
    'spaceToolBehavior',
    'subProcessPlaneBehavior',
    'subProcessStartEventBehavior',
    'toggleCollapseConnectionBehaviour',
    'toggleElementCollapseBehaviour',
    'unclaimIdBehavior',
    'updateFlowNodeRefsBehavior',
    'unsetDefaultFlowBehavior'
  ],
  adaptiveLabelPositioningBehavior: [ 'type', AdaptiveLabelPositioningBehavior ],
  appendBehavior: [ 'type', AppendBehavior ],
  associationBehavior: [ 'type', AssociationBehavior ],
  attachEventBehavior: [ 'type', AttachEventBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  createBehavior: [ 'type', CreateBehavior ],
  createDataObjectBehavior: [ 'type', CreateDataObjectBehavior ],
  createParticipantBehavior: [ 'type', CreateParticipantBehavior ],
  dataInputAssociationBehavior: [ 'type', DataInputAssociationBehavior ],
  dataStoreBehavior: [ 'type', DataStoreBehavior ],
  deleteLaneBehavior: [ 'type', DeleteLaneBehavior ],
  detachEventBehavior: [ 'type', DetachEventBehavior ],
  dropOnFlowBehavior: [ 'type', DropOnFlowBehavior ],
  eventBasedGatewayBehavior: [ 'type', EventBasedGatewayBehavior ],
  fixHoverBehavior: [ 'type', FixHoverBehavior ],
  groupBehavior: [ 'type', GroupBehavior ],
  importDockingFix: [ 'type', ImportDockingFix ],
  isHorizontalFix: [ 'type', IsHorizontalFix ],
  labelBehavior: [ 'type', LabelBehavior ],
  layoutConnectionBehavior: [ 'type', LayoutConnectionBehavior ],
  messageFlowBehavior: [ 'type', MessageFlowBehavior ],
  removeElementBehavior: [ 'type', RemoveElementBehavior ],
  removeEmbeddedLabelBoundsBehavior: [ 'type', RemoveEmbeddedLabelBoundsBehavior ],
  removeParticipantBehavior: [ 'type', RemoveParticipantBehavior ],
  replaceConnectionBehavior: [ 'type', ReplaceConnectionBehavior ],
  replaceElementBehaviour: [ 'type', ReplaceElementBehaviour ],
  resizeBehavior: [ 'type', ResizeBehavior ],
  resizeLaneBehavior: [ 'type', ResizeLaneBehavior ],
  rootElementReferenceBehavior: [ 'type', RootElementReferenceBehavior ],
  spaceToolBehavior: [ 'type', SpaceToolBehavior ],
  subProcessPlaneBehavior: [ 'type', SubProcessPlaneBehavior ],
  subProcessStartEventBehavior: [ 'type', SubProcessStartEventBehavior ],
  toggleCollapseConnectionBehaviour: [ 'type', ToggleCollapseConnectionBehaviour ],
  toggleElementCollapseBehaviour : [ 'type', ToggleElementCollapseBehaviour ],
  unclaimIdBehavior: [ 'type', UnclaimIdBehavior ],
  unsetDefaultFlowBehavior: [ 'type', UnsetDefaultFlowBehavior ],
  updateFlowNodeRefsBehavior: [ 'type', UpdateFlowNodeRefsBehavior ]
};
