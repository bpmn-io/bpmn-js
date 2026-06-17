import { expect } from 'chai';
import sinon from 'sinon';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import bpmnEditorActionsModule from 'bpmn-js/lib/features/editor-actions';
import selectionModule from 'diagram-js/lib/features/selection';
import alignElementsModule from 'diagram-js/lib/features/align-elements';
import distributeElementsModule from 'diagram-js/lib/features/distribute-elements';
import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';
import contextPad from 'bpmn-js/lib/features/context-pad';
import { pick } from 'min-dash';
import { getBBox } from 'diagram-js/lib/util/Elements.js';
import { getParent } from 'bpmn-js/lib/features/modeling/util/ModelingUtil.js';

import subProcessesXML from '../../../fixtures/bpmn/nested-subprocesses.bpmn';
import collaborationXML from '../../../fixtures/bpmn/collaboration.bpmn';


describe('features/editor-actions', function() {

  describe('#moveToOrigin', function() {

    function testMoveToOrigin(xml) {

      return function() {

        beforeEach(bootstrapModeler(xml, {
          modules: [
            bpmnEditorActionsModule,
            modelingModule,
            coreModule
          ]
        }));


        it('should move to origin', inject(function(editorActions) {

          // given
          var elements = editorActions.trigger('selectElements'),
              boundingBox;

          // when
          editorActions.trigger('moveToOrigin');

          boundingBox = getBBox(elements);

          // then
          expect(pick(boundingBox, [ 'x', 'y' ])).to.eql({ x: 0, y: 0 });
        }));

      };

    }


    describe('single process', testMoveToOrigin(subProcessesXML));


    describe('collaboration', testMoveToOrigin(collaborationXML));


    describe('subprocesses', function() {

      beforeEach(bootstrapModeler(subProcessesXML, {
        modules: [
          bpmnEditorActionsModule,
          modelingModule,
          coreModule
        ]
      }));


      it('should ignore children of subprocesses', inject(
        function(editorActions, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3'),
              startEventParent = getParent(startEvent);

          // when
          editorActions.trigger('moveToOrigin');

          // then
          expect(getParent(startEvent)).to.equal(startEventParent);
        }
      ));

    });

  });


  describe('#alignElements', function() {

    beforeEach(bootstrapModeler(subProcessesXML, {
      modules: [
        selectionModule,
        alignElementsModule,
        bpmnEditorActionsModule,
        modelingModule,
        coreModule
      ]
    }));


    it('should align items', inject(
      function(elementRegistry, selection, editorActions) {

        // given
        var elementIds = [ 'StartEvent_1', 'UserTask_1', 'EndEvent_1' ];
        var elements = elementIds.map(function(id) {
          return elementRegistry.get(id);
        });

        // when
        selection.select(elements);
        editorActions.trigger('alignElements', { type: 'middle' });

        // then
        expect(elements.map(function(e) {
          return e.y + e.height / 2;
        })).to.eql([ 311, 311, 311 ]);
      }
    ));


    it('should not align if too few elements', inject(
      function(elementRegistry, eventBus, editorActions, selection) {

        // given
        var elementIds = [ 'StartEvent_1' ];
        var elements = elementIds.map(function(id) {
          return elementRegistry.get(id);
        });

        var changedSpy = sinon.spy();

        // when
        eventBus.once('commandStack.changed', changedSpy);

        selection.select(elements);
        editorActions.trigger('alignElements', { type: 'center' });

        // then
        expect(changedSpy).not.to.have.been.called;
      }
    ));

  });


  describe('#distributeElements', function() {

    beforeEach(bootstrapModeler(subProcessesXML, {
      modules: [
        selectionModule,
        distributeElementsModule,
        bpmnEditorActionsModule,
        modelingModule,
        coreModule
      ]
    }));


    it('should distribute items', inject(
      function(elementRegistry, selection, editorActions) {

        // given
        var elementIds = [ 'StartEvent_1', 'UserTask_1', 'EndEvent_1' ];
        var elements = elementIds.map(function(id) {
          return elementRegistry.get(id);
        });

        // when
        selection.select(elements);
        editorActions.trigger('distributeElements', { type: 'horizontal' });

        // then
        expect(elements.map(function(e) {
          return e.x + e.width / 2;
        })).to.eql([ 433, 574, 714 ]);
      }
    ));


    it('should not distribute if too few elements', inject(
      function(elementRegistry, eventBus, editorActions, selection) {

        // given
        var elementIds = [ 'StartEvent_1', 'UserTask_1' ];
        var elements = elementIds.map(function(id) {
          return elementRegistry.get(id);
        });

        var changedSpy = sinon.spy();

        // when
        eventBus.once('commandStack.changed', changedSpy);

        selection.select(elements);
        editorActions.trigger('distributeElements', { type: 'horizontal' });

        // then
        expect(changedSpy).not.to.have.been.called;
      }
    ));

  });


  describe('#replaceElement', function() {

    beforeEach(bootstrapModeler(subProcessesXML, {
      modules: [
        selectionModule,
        bpmnEditorActionsModule,
        modelingModule,
        coreModule,
        contextPad
      ]
    }));


    it('should open replace element', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('StartEvent_1');

      selection.select(element);
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('replaceElement', {});

      // then
      expect(changedSpy).to.have.been.called;
    }));


    it('should not open replace element if no selection', inject(function(editorActions, eventBus) {

      // given
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('replaceElement', {});

      // then
      expect(changedSpy).to.not.have.been.called;
    }));


    it('should not open replace element if multiple elements selected', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      var elementIds = [ 'StartEvent_1', 'UserTask_1' ];
      var elements = elementIds.map(function(id) {
        return elementRegistry.get(id);
      });

      selection.select(elements);
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('replaceElement', {});

      // then
      expect(changedSpy).to.not.have.been.called;
    }));

  });

});
