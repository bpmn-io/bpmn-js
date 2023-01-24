import {
  bootstrapViewer,
  inject,
  getBpmnJS
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

import {
  query as domQuery
} from 'min-dom';


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
        'appendElement',
        'createElement'
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
          expect(isMenu('bpmn-append')).to.be.true;
        }));


      it('should trigger create menu',
        inject(function(keyboard, popupMenu) {

          sinon.spy(popupMenu, 'open');

          // given
          var e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
          expect(isMenu('bpmn-create')).to.be.true;
        }));


      it('should not trigger create or append menus',
        inject(function(keyboard, popupMenu) {

          sinon.spy(popupMenu, 'open');

          // given
          var e = createKeyEvent(key, { ctrlKey: true });

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.not.have.been.called;
        }));

    });


    forEach([ 'n', 'N' ], function(key) {

      it('should trigger create menu',
        inject(function(keyboard, popupMenu) {

          sinon.spy(popupMenu, 'open');

          // given
          var e = createKeyEvent(key);

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.have.been.calledOnce;
          expect(isMenu('bpmn-create')).to.be.true;
        }));


      it('should not trigger create menu',
        inject(function(keyboard, popupMenu) {

          sinon.spy(popupMenu, 'open');

          // given
          var e = createKeyEvent(key, { ctrlKey: true });

          // when
          keyboard._keyHandler(e);

          // then
          expect(popupMenu.open).to.not.have.been.called;
        }));

    });

  });

});


// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}