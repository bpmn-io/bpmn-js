import EditorActionsModule from 'diagram-js/lib/features/editor-actions';

import BpmnEditorActions from './BpmnEditorActions.js';

export default {
  __depends__: [
    EditorActionsModule
  ],
  editorActions: [ 'type', BpmnEditorActions ]
};
