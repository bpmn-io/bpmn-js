/* global sinon */

import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import { forEach } from 'min-dash';

import coreModule from 'lib/core';
import editorActionsModule from 'lib/features/editor-actions';
import searchModule from 'lib/features/search';
import globalConnectModule from 'diagram-js/lib/features/global-connect';
import spaceToolModule from 'diagram-js/lib/features/space-tool';
import lassoToolModule from 'diagram-js/lib/features/lasso-tool';
import handToolModule from 'diagram-js/lib/features/hand-tool';
import keyboardModule from 'lib/features/keyboard';
import modelingModule from 'lib/features/modeling';
import labelEditingModule from 'lib/features/label-editing';

var createKeyEvent = require('../../../util/KeyEvents').createKeyEvent;


describe('features/keyboard', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [
    coreModule,
    editorActionsModule,
    keyboardModule,
    modelingModule,
    globalConnectModule,
    spaceToolModule,
    lassoToolModule,
    handToolModule,
    searchModule,
    labelEditingModule
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('bpmn keyboard bindings', function() {

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should include triggers inside editorActions', inject(function(editorActions) {
      // given
      var expectedActions = [
        'undo',
        'redo',
        'zoom',
        'removeSelection',
        'selectElements',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnectTool',
        'setColor',
        'directEditing',
        'find',
        'moveToOrigin'
      ];

      // then
      expect(editorActions.getActions()).to.eql(expectedActions);
    }));


    forEach(['c', 'C'], function(key) {

      it('should global connect tool for key ' + key, inject(function(keyboard, globalConnect) {

        sinon.spy(globalConnect, 'toggle');

        // given
        var e = createKeyEvent(container, key, false);

        // when
        keyboard._keyHandler(e);

        // then
        expect(globalConnect.toggle).to.have.been.calledOnce;
      }));

    });


    forEach(['l', 'L'], function(key) {

      it('should trigger lasso tool for key ' + key, inject(function(keyboard, lassoTool) {

        sinon.spy(lassoTool, 'activateSelection');

        // given
        var e = createKeyEvent(container, key, false);

        // when
        keyboard._keyHandler(e);

        // then
        expect(lassoTool.activateSelection).to.have.been.calledOnce;
      }));

    });


    forEach(['s', 'S'], function(key) {

      it('should trigger space tool', inject(function(keyboard, spaceTool) {

        sinon.spy(spaceTool, 'activateSelection');

        // given
        var e = createKeyEvent(container, key, false);

        // when
        keyboard._keyHandler(e);

        // then
        expect(spaceTool.activateSelection).to.have.been.calledOnce;
      }));

    });


    forEach(['e', 'E'], function(key) {

      it('should trigger direct editing', inject(function(keyboard, selection, elementRegistry, directEditing) {

        sinon.spy(directEditing, 'activate');

        // given
        var task = elementRegistry.get('Task_1');

        selection.select(task);

        var e = createKeyEvent(container, key, false);

        // when
        keyboard._keyHandler(e);

        // then
        expect(directEditing.activate).to.have.been.calledOnce;
      }));

    });


    forEach(['a', 'A'], function(key) {

      it('should select all elements',
        inject(function(canvas, keyboard, selection, elementRegistry) {

          // given
          var e = createKeyEvent(container, key, true);

          var allElements = elementRegistry.getAll(),
              rootElement = canvas.getRootElement();

          // when
          keyboard._keyHandler(e);

          // then
          var selectedElements = selection.get();

          expect(selectedElements).to.have.length(allElements.length - 1);
          expect(selectedElements).not.to.contain(rootElement);
        })
      );

    });


    forEach(['f', 'F'], function(key) {

      it('should trigger search for labels', inject(function(keyboard, searchPad) {

        sinon.spy(searchPad, 'toggle');

        // given
        var e = createKeyEvent(container, key, true);

        // when
        keyboard._keyHandler(e);

        // then
        expect(searchPad.toggle).to.have.been.calledOnce;
      }));

    });

  });

});
