import SpaceToolModule from 'diagram-js/lib/features/space-tool';

import BpmnSpaceTool from './BpmnSpaceTool';

export default {
  __depends__: [ SpaceToolModule ],
  spaceTool: [ 'type', BpmnSpaceTool ]
};