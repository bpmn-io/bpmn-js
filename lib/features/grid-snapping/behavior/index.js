import AutoPlaceBehavior from './AutoPlaceBehavior';
import LayoutConnectionBehavior from './LayoutConnectionBehavior';

export default {
  __init__: [
    'gridSnappingLayoutConnectionBehavior',
    'gridSnappingAutoPlaceBehavior'
  ],
  gridSnappingAutoPlaceBehavior: [ 'type', AutoPlaceBehavior ],
  gridSnappingLayoutConnectionBehavior: [ 'type', LayoutConnectionBehavior ]
};