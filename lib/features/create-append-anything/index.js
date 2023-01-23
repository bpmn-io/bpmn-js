import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import PaletteModule from 'diagram-js/lib/features/palette';
import AutoPlace from '../auto-place';

import CreateMenuProvider from './CreateMenuProvider';
import CreatePaletteProvider from './CreatePaletteProvider';

export default {
  __depends__: [
    PaletteModule,
    PopupMenuModule,
    AutoPlace
  ],
  __init__: [
    'createMenuProvider',
    'createPaletteProvider'
  ],
  createMenuProvider: [ 'type', CreateMenuProvider ],
  createPaletteProvider: [ 'type', CreatePaletteProvider ]
};
