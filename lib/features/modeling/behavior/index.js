import AdaptiveLabelPositioningBehavior from './AdaptiveLabelPositioningBehavior.js';
import AppendBehavior from './AppendBehavior.js';
import ArtifactBehavior from './ArtifactBehavior.js';
import AssociationBehavior from './AssociationBehavior.js';
import AttachEventBehavior from './AttachEventBehavior.js';
import BoundaryEventBehavior from './BoundaryEventBehavior.js';
import CompensateBoundaryEventBehavior from './CompensateBoundaryEventBehavior.js';
import CreateBehavior from './CreateBehavior.js';
import CreateDataObjectBehavior from './CreateDataObjectBehavior.js';
import CreateParticipantBehavior from './CreateParticipantBehavior.js';
import DataInputAssociationBehavior from './DataInputAssociationBehavior.js';
import DataStoreBehavior from './DataStoreBehavior.js';
import DeleteLaneBehavior from './DeleteLaneBehavior.js';
import DetachEventBehavior from './DetachEventBehavior.js';
import DropOnFlowBehavior from './DropOnFlowBehavior.js';
import EventBasedGatewayBehavior from './EventBasedGatewayBehavior.js';
import FixHoverBehavior from './FixHoverBehavior.js';
import GroupBehavior from './GroupBehavior.js';
import ImportDockingFix from './ImportDockingFix.js';
import IsHorizontalFix from './IsHorizontalFix.js';
import LabelBehavior from './LabelBehavior.js';
import LayoutConnectionBehavior from './LayoutConnectionBehavior.js';
import MessageFlowBehavior from './MessageFlowBehavior.js';
import NonInterruptingBehavior from './NonInterruptingBehavior.js';
import RemoveEmbeddedLabelBoundsBehavior from './RemoveEmbeddedLabelBoundsBehavior.js';
import RemoveElementBehavior from './RemoveElementBehavior.js';
import RemoveParticipantBehavior from './RemoveParticipantBehavior.js';
import ReplaceConnectionBehavior from './ReplaceConnectionBehavior.js';
import ReplaceElementBehaviour from './ReplaceElementBehaviour.js';
import ResizeBehavior from './ResizeBehavior.js';
import ResizeLaneBehavior from './ResizeLaneBehavior.js';
import RootElementReferenceBehavior from './RootElementReferenceBehavior.js';
import SpaceToolBehavior from './SpaceToolBehavior.js';
import SubProcessPlaneBehavior from './SubProcessPlaneBehavior.js';
import SubProcessStartEventBehavior from './SubProcessStartEventBehavior.js';
import TextAnnotationBehavior from './TextAnnotationBehavior.js';
import ToggleCollapseConnectionBehaviour from './ToggleCollapseConnectionBehaviour.js';
import ToggleElementCollapseBehaviour from './ToggleElementCollapseBehaviour.js';
import UnclaimIdBehavior from './UnclaimIdBehavior.js';
import UnsetDefaultFlowBehavior from './UnsetDefaultFlowBehavior.js';
import UpdateFlowNodeRefsBehavior from './UpdateFlowNodeRefsBehavior.js';
import SetCompensationActivityAfterPasteBehavior from './SetCompensationActivityAfterPasteBehavior.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'adaptiveLabelPositioningBehavior',
    'appendBehavior',
    'artifactBehavior',
    'associationBehavior',
    'attachEventBehavior',
    'boundaryEventBehavior',
    'compensateBoundaryEventBehaviour',
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
    'nonInterruptingBehavior',
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
    'textAnnotationBehavior',
    'toggleCollapseConnectionBehaviour',
    'toggleElementCollapseBehaviour',
    'unclaimIdBehavior',
    'updateFlowNodeRefsBehavior',
    'unsetDefaultFlowBehavior',
    'setCompensationActivityAfterPasteBehavior'
  ],
  adaptiveLabelPositioningBehavior: [ 'type', AdaptiveLabelPositioningBehavior ],
  appendBehavior: [ 'type', AppendBehavior ],
  associationBehavior: [ 'type', AssociationBehavior ],
  attachEventBehavior: [ 'type', AttachEventBehavior ],
  artifactBehavior: [ 'type', ArtifactBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  compensateBoundaryEventBehaviour: [ 'type', CompensateBoundaryEventBehavior ],
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
  nonInterruptingBehavior: [ 'type', NonInterruptingBehavior ],
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
  textAnnotationBehavior: [ 'type', TextAnnotationBehavior ],
  toggleCollapseConnectionBehaviour: [ 'type', ToggleCollapseConnectionBehaviour ],
  toggleElementCollapseBehaviour : [ 'type', ToggleElementCollapseBehaviour ],
  unclaimIdBehavior: [ 'type', UnclaimIdBehavior ],
  unsetDefaultFlowBehavior: [ 'type', UnsetDefaultFlowBehavior ],
  updateFlowNodeRefsBehavior: [ 'type', UpdateFlowNodeRefsBehavior ],
  setCompensationActivityAfterPasteBehavior: [ 'type', SetCompensationActivityAfterPasteBehavior ]
};
