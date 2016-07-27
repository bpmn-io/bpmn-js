'use strict';

var TestContainer = require('mocha-test-container-support');

var coreModule = require('../../../../lib/core'),
    editorActionsModule = require('../../../../lib/features/editor-actions'),
    modelingModule = require('../../../../lib/features/modeling');

/* global bootstrapViewer, inject, sinon */


describe('features - editor-actions', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [
    coreModule,
    editorActionsModule,
    modelingModule
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('actions', function() {

    describe('distributeElements', function () {

        it('should execute with current selection and given type', inject(function (editorActions, distributeElements, elementRegistry, selection) {

          sinon.spy(distributeElements, 'trigger');

          // given
          var task = elementRegistry.get('Task_1');

          selection.select(task);

          // when
          editorActions.trigger('distributeElements', { type: 'horizontal' });

          // then
          expect(distributeElements.trigger).to.have.been.calledOnce;
          expect(distributeElements.trigger).to.have.been.calledWith([task], 'horizontal');
        }));

        it('should NOT execute if selection is empty', inject(function (editorActions, distributeElements) {

          sinon.spy(distributeElements, 'trigger');

          // when
          editorActions.trigger('distributeElements', { type: 'horizontal' });

          // then
          expect(distributeElements.trigger).to.not.have.been.called;
        }));

        it('should NOT execute while read-only', inject(function (editorActions, distributeElements, elementRegistry, selection, eventBus) {

          sinon.spy(distributeElements, 'trigger');

          // given
          var task = elementRegistry.get('Task_1');

          selection.select(task);

          eventBus.fire('readOnly.changed', { readOnly: true });

          // when
          editorActions.trigger('distributeElements', { type: 'horizontal' });

          // then
          expect(distributeElements.trigger).to.not.have.been.called;
        }));

    });


    describe('alignElements', function () {

        it('should execute with current selection and given type', inject(function (editorActions, alignElements, elementRegistry, selection) {

          sinon.spy(alignElements, 'trigger');

          // given
          var task = elementRegistry.get('Task_1');

          selection.select(task);

          // when
          editorActions.trigger('alignElements', { type: 'left' });

          // then
          expect(alignElements.trigger).to.have.been.calledOnce;
          expect(alignElements.trigger).to.have.been.calledWith([task], 'left');
        }));

        it('should NOT execute if selection is empty', inject(function (editorActions, alignElements) {

          sinon.spy(alignElements, 'trigger');

          // when
          editorActions.trigger('alignElements', { type: 'left' });

          // then
          expect(alignElements.trigger).to.not.have.been.called;
        }));

        it('should NOT execute while read-only', inject(function (editorActions, alignElements, elementRegistry, selection, eventBus) {

          sinon.spy(alignElements, 'trigger');

          // given
          var task = elementRegistry.get('Task_1');

          selection.select(task);

          eventBus.fire('readOnly.changed', { readOnly: true });

          // when
          editorActions.trigger('alignElements', { type: 'left' });

          // then
          expect(alignElements.trigger).to.not.have.been.called;
        }));

    });

  });

});
