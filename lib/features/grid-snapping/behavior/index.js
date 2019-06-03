import AutoPlaceBehavior from './AutoPlaceBehavior';
import CreateParticipantBehavior from './CreateParticipantBehavior';
import LayoutConnectionBehavior from './LayoutConnectionBehavior';

export default {
  __init__: [
    'gridSnappingAutoPlaceBehavior',
    'gridSnappingCreateParticipantBehavior',
    'gridSnappingLayoutConnectionBehavior',
  ],
  gridSnappingAutoPlaceBehavior: [ 'type', AutoPlaceBehavior ],
  gridSnappingCreateParticipantBehavior: [ 'type', CreateParticipantBehavior ],
  gridSnappingLayoutConnectionBehavior: [ 'type', LayoutConnectionBehavior ]
};