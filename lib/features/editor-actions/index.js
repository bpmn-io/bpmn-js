module.exports = {
  __depends__: [
    require('diagram-js/lib/features/align-elements'),
    require('diagram-js/lib/features/editor-actions'),
    require('diagram-js/lib/features/hand-tool'),
    require('diagram-js/lib/features/lasso-tool'),
    require('diagram-js/lib/features/space-tool'),
    require('../global-connect'),
    require('../copy-paste'),
    require('../distribute-elements'),
    require('../global-connect'),
    require('../search'),
    require('../modeling')
  ],
  editorActions: [ 'type', require('./BpmnEditorActions') ]
};
