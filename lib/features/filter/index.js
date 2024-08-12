import PopupMenuModule from 'diagram-js/lib/features/popup-menu';

import FilterMenuProvider from './FilterMenuProvider';

export default {
  __depends__: [
    PopupMenuModule
  ],
  __init__: [
    'filterMenuProvider'
  ],
  filterMenuProvider: [ 'type', FilterMenuProvider ]
};