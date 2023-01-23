import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import PaletteModule from 'diagram-js/lib/features/palette';
import AutoPlaceModule from 'diagram-js/lib/features/auto-place';
import ContextPadModule from 'diagram-js/lib/features/context-pad';

import CreateMenuProvider from './CreateMenuProvider';
import CreatePaletteProvider from './CreatePaletteProvider';
import CreateAppendEditorActions from './CreateAppendEditorActions';
import AppendMenuProvider from './AppendMenuProvider';
import AppendContextPadProvider from './AppendContextPadProvider';

export default {
  __depends__: [
    PaletteModule,
    PopupMenuModule,
    AutoPlaceModule,
    ContextPadModule
  ],
  __init__: [
    'createMenuProvider',
    'createPaletteProvider',
    'createAppendEditorActions',
    'appendMenuProvider',
    'appendContextPadProvider'
  ],
  createMenuProvider: [ 'type', CreateMenuProvider ],
  createPaletteProvider: [ 'type', CreatePaletteProvider ],
  createAppendEditorActions: [ 'type', CreateAppendEditorActions ],
  appendMenuProvider: [ 'type', AppendMenuProvider ],
  appendContextPadProvider: [ 'type', AppendContextPadProvider ]
};
