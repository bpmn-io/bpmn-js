import EditorActionsModule from 'diagram-js/lib/features/editor-actions';

import BpmnEditorActions from './BpmnEditorActions';

export default {
  __depends__: [
    EditorActionsModule
  ],
  editorActions: [ 'type', BpmnEditorActions ]
};
