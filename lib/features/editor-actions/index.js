import AlignElementsModule from 'diagram-js/lib/features/align-elements';
import EditorActionsModule from 'diagram-js/lib/features/editor-actions';
import HandToolModule from 'diagram-js/lib/features/hand-tool';
import LassoToolModule from 'diagram-js/lib/features/lasso-tool';
import SpaceToolModule from 'diagram-js/lib/features/space-tool';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';
import DirectEditingModule from 'diagram-js-direct-editing';

import CopyPasteModule from '../copy-paste';
import DistributeElementsModule from '../distribute-elements';
import SearchModule from '../search';

import BpmnEditorActions from './BpmnEditorActions';

export default {
  __depends__: [
    AlignElementsModule,
    EditorActionsModule,
    HandToolModule,
    LassoToolModule,
    SpaceToolModule,
    DirectEditingModule,
    GlobalConnectModule,
    CopyPasteModule,
    DistributeElementsModule,
    SearchModule
  ],
  editorActions: [ 'type', BpmnEditorActions ]
};
