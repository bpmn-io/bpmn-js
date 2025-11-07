import Outline from 'diagram-js/lib/features/outline';
import OutlineProvider from './OutlineProvider';

export default {
  __depends__: [
    Outline
  ],
  __init__: [ 'outlineProvider' ],
  outlineProvider: [ 'type', OutlineProvider ]
};
