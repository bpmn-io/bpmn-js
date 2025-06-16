import SelectionModule from 'diagram-js/lib/features/selection';
import LabelLink from './LabelLink';

export default {
  __depends__: [
    SelectionModule
  ],
  __init__: [
    'labelLink'
  ],
  labelLink: [ 'type', LabelLink ]
};
