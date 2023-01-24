import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

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
    }));


    it('should not open append element if no selection', inject(function(editorActions, eventBus) {

      // given
      var changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendElement', {});

      // then
      expect(changedSpy).to.not.have.been.called;
    }));


    it('should not open append element if multiple elements selected', inject(function(elementRegistry, selection, editorActions, eventBus) {

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
      expect(changedSpy).to.not.have.been.called;
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
