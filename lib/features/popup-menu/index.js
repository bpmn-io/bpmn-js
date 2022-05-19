import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import ReplaceModule from '../replace';
import ColorMenuProvider from './ColorMenuProvider';
import ReplaceMenuProvider from './ReplaceMenuProvider';


export default {
  __depends__: [
    PopupMenuModule,
    ReplaceModule
  ],
  __init__: [
    'replaceMenuProvider',
    'colorMenuProvider'
  ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ],
  colorMenuProvider: [ 'type', ColorMenuProvider ]

};