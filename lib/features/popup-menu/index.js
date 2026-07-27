import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import ReplaceModule from '../replace';

import ReplaceMenuProvider from './ReplaceMenuProvider';
import AutoPlaceModule from '../auto-place';

export { PopupEntries } from './PopupEntries';

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