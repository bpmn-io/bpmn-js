import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import { forEach } from 'min-dash';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import keyboardModule from 'diagram-js/lib/features/keyboard';
import createAppendAnything from 'lib/features/create-append-anything';
import editorActions from 'diagram-js/lib/features/editor-actions';

import {
  createKeyEvent
} from 'test/util/KeyEvents';


describe('features/create-append-anything - keyboard bindings', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    keyboardModule,
    editorActions,
    createAppendAnything
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('create append keyboard bindings', function() {

    it('should include triggers inside editorActions', inject(function(editorActions) {

      // given
      var expectedActions = [
        'appendElement'
      ];
      var actualActions = editorActions.getActions();

      // then
      expect(
        expectedActions.every(action => actualActions.includes(action))
      ).to.be.true;
    }));


    forEach([ 'a', 'A' ], function(key) {

      it('should trigger append menu',
        inject(function(keyboard, popupMenu, elementRegistry, selection) {

          sinon.spy(popupMenu, 'open');

          // given
          var task = elementRegistry.get('Task_1');

          selection.select(task);

          var e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
        }));

    });

  });

});
