import TooltipsModule from 'diagram-js/lib/features/tooltips';

import ModelingFeedback from './ModelingFeedback';

export default {
  __depends__: [
    TooltipsModule
  ],
  __init__: [
    'modelingFeedback'
  ],
  modelingFeedback: [ 'type', ModelingFeedback ]
};