import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import selectionModule from 'diagram-js/lib/features/selection';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import editorActionsModule from 'diagram-js/lib/features/editor-actions';
import createAppendAnything from 'lib/features/create-append-anything';

var basicXML = require('../../../fixtures/bpmn/nested-subprocesses.bpmn');


describe('features/create-append-anything - editor actions', function() {

  describe('#appendElement', function() {

    beforeEach(bootstrapModeler(basicXML, {
      modules: [
        selectionModule,
        modelingModule,
        coreModule,
        editorActionsModule,
        createAppendAnything
      ]
    }));


    it('should open append element', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('StartEvent_1');

      selection.select(element);
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-append')).to.be.true;
    }));


    it('should open create element if multiple elements selected', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      var elementIds = [ 'StartEvent_1', 'UserTask_1' ];
      var elements = elementIds.map(function(id) {
        return elementRegistry.get(id);
      });

      selection.select(elements);
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if no selection', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if append not allowed', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('EndEvent_1');

      selection.select(element);
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));

  });


  describe('#createElement', function() {

    beforeEach(bootstrapModeler(basicXML, {
      modules: [
        selectionModule,
        modelingModule,
        coreModule,
        editorActionsModule,
        createAppendAnything
      ]
    }));


    it('should open create element', inject(function(editorActions, eventBus) {

      // given
      var changedSpy = sinon.spy();
      eventBus.once('popupMenu.open', changedSpy);

      // when
      editorActions.trigger('createElement', {});

      // then
      expect(changedSpy).to.have.been.called;
    }));

  });

});


// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}