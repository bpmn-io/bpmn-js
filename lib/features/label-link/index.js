import SelectionModule from 'diagram-js/lib/features/selection';
import OutlineModule from 'diagram-js/lib/features/outline';

import LabelLink from './LabelLink';

export default {
  __depends__: [
    SelectionModule,
    OutlineModule
  ],
  __init__: [
    'labelLink'
  ],
  labelLink: [ 'type', LabelLink ]
};
