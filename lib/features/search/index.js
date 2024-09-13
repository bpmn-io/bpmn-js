import SearchPadModule from 'diagram-js/lib/features/search-pad';
import SearchModule from 'diagram-js/lib/features/search';

import BpmnSearchProvider from './BpmnSearchProvider';


export default {
  __depends__: [
    SearchPadModule,
    SearchModule
  ],
  __init__: [ 'bpmnSearch' ],
  bpmnSearch: [ 'type', BpmnSearchProvider ]
};
