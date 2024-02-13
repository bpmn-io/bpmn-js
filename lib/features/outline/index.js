import Ouline from 'diagram-js/lib/features/outline';
import OulineProvider from './OutlineProvider';

export default {
  __depends__: [
    Ouline
  ],
  __init__: [ 'outlineProvider' ],
  outlineProvider: [ 'type', OulineProvider ]
};
