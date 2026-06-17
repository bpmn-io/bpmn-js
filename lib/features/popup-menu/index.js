import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import ReplaceModule from '../replace/index.js';

import ReplaceMenuProvider from './ReplaceMenuProvider.js';
import AutoPlaceModule from '../auto-place/index.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    PopupMenuModule,
    ReplaceModule,
    AutoPlaceModule
  ],
  __init__: [
    'replaceMenuProvider'
  ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ]
};