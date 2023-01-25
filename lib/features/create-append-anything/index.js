import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import PaletteModule from 'diagram-js/lib/features/palette';
import AutoPlaceModule from 'diagram-js/lib/features/auto-place';
import ContextPadModule from 'diagram-js/lib/features/context-pad';

import CreateMenuProvider from './CreateMenuProvider';
import CreatePaletteProvider from './CreatePaletteProvider';
import CreateAppendEditorActions from './CreateAppendEditorActions';
import CreateAppendKeyboardBindings from './CreateAppendKeyboardBindings';
import AppendMenuProvider from './AppendMenuProvider';
import AppendContextPadProvider from './AppendContextPadProvider';
import AppendRules from './AppendRules';

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
    'createAppendKeyboardBindings',
    'appendMenuProvider',
    'appendContextPadProvider',
    'appendRules'
  ],
  createMenuProvider: [ 'type', CreateMenuProvider ],
  createPaletteProvider: [ 'type', CreatePaletteProvider ],
  createAppendEditorActions: [ 'type', CreateAppendEditorActions ],
  createAppendKeyboardBindings: [ 'type', CreateAppendKeyboardBindings ],
  appendMenuProvider: [ 'type', AppendMenuProvider ],
  appendContextPadProvider: [ 'type', AppendContextPadProvider ],
  appendRules: [ 'type', AppendRules ]
};
