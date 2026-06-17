import GridSnappingAutoPlaceBehavior from './GridSnappingAutoPlaceBehavior.js';
import GridSnappingParticipantBehavior from './GridSnappingParticipantBehavior.js';
import GridSnappingLayoutConnectionBehavior from './GridSnappingLayoutConnectionBehavior.js';

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