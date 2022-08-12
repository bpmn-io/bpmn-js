import GridSnappingAutoPlaceBehavior from './GridSnappingAutoPlaceBehavior';
import GridSnappingParticipantBehavior from './GridSnappingParticipantBehavior';
import GridSnappingLayoutConnectionBehavior from './GridSnappingLayoutConnectionBehavior';

export default {
  __init__: [
    'gridSnappingAutoPlaceBehavior',
    'gridSnappingParticipantBehavior',
    'gridSnappingLayoutConnectionBehavior',
  ],
  gridSnappingAutoPlaceBehavior: [ 'type', GridSnappingAutoPlaceBehavior ],
  gridSnappingParticipantBehavior: [ 'type', GridSnappingParticipantBehavior ],
  gridSnappingLayoutConnectionBehavior: [ 'type', GridSnappingLayoutConnectionBehavior ]
};