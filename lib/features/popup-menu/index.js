import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import ReplaceModule from '../replace';

import ReplaceMenuProvider from './ReplaceMenuProvider';
import AppendMenuProvider from './AppendMenuProvider';
import AutoPlaceModule from '../auto-place';

export default {
  __depends__: [
    PopupMenuModule,
    ReplaceModule,
    AutoPlaceModule
  ],
  __init__: [
    'replaceMenuProvider',
    'appendMenuProvider'
  ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ],
  appendMenuProvider: [ 'type', AppendMenuProvider ]
};