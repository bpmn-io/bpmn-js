import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createEvent as globalEvent
} from '../../../util/MockEvents';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import autoPlace from 'lib/features/auto-place';
import createAppendAything from 'lib/features/create-append-anything';
import customRulesModule from '../../../util/custom-rules';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { getBusinessObject } from 'lib/util/ModelUtil';


describe('features/create-append-anything - append menu provider', function() {

  var diagramXML = require('./AppendMenuProvider.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    autoPlace,
    createAppendAything,
    customRulesModule
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('rules', function() {

    it('should get entries by default', inject(function(elementRegistry) {

      // given
      var startEvent = elementRegistry.get('StartEvent');

      // when
      openPopup(startEvent);

      // then
      expect(queryEntries()).to.have.length.above(0);
    }));


    it('should get entries when custom rule returns true',
      inject(function(elementRegistry, customRules) {

        // given
        var startEvent = elementRegistry.get('StartEvent');

        customRules.addRule('shape.append', function() {
          return true;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryEntries()).to.have.length.above(0);
      })
    );


    it('should get no entries when custom rule returns false',
      inject(function(elementRegistry, customRules) {

        // given
        var startEvent = elementRegistry.get('StartEvent');

        customRules.addRule('shape.append', function() {
          return false;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryEntries()).to.have.length(0);
      })
    );

  });


  describe('menu', function() {

    describe('should not appear as append option', function() {

      it('Start Event', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-none-start')).to.not.exist;
      }));


      it('Participant', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-expanded-pool')).to.not.exist;
      }));


      it('None Boundary Event', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');

        // when
        openPopup(task);

        // then
        expect(queryEntry('append-boundary-event')).to.not.exist;
      }));

    });

  });


  describe('append', function() {

    describe('task', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-task');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-task');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-task');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));

    });


    describe('sub process', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        openPopup(startEvent);
        triggerAction('append-expanded-subprocess');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      describe('should trigger create mode', function() {

        it('event subprocess', inject(function(elementRegistry, eventBus) {

          // given
          const task = elementRegistry.get('Task');

          const spy = sinon.spy();

          eventBus.on('create.init', spy);

          // when
          openPopup(task);

          triggerAction('append-event-subprocess');

          // then
          expect(spy).to.have.been.called;

        }));

      });


    });


    describe('event', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(task);
        triggerAction('append-none-end-event');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        // when
        openPopup(task);
        triggerAction('append-none-end-event');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const outgoingFlows = getBusinessObject(task).outgoing;

        openPopup(task);
        triggerAction('append-none-end-event');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      describe('should trigger create mode', function() {

        it('boundary event', inject(function(elementRegistry, eventBus) {

          // given
          const task = elementRegistry.get('Task');

          const spy = sinon.spy();

          eventBus.on('create.init', spy);

          // when
          openPopup(task);

          triggerAction('append-non-interrupting-message-boundary');

          // then
          expect(spy).to.have.been.called;

        }));


        it('link intermediate catch event', inject(function(elementRegistry, eventBus) {

          // given
          const task = elementRegistry.get('Task');

          const spy = sinon.spy();

          eventBus.on('create.init', spy);

          // when
          openPopup(task);

          triggerAction('append-link-intermediate-catch');

          // then
          expect(spy).to.have.been.called;

        }));

      });

    });


    describe('gateway', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        expect(outgoingFlows).to.have.length(1);

        // when
        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');

        // then
        expect(outgoingFlows).to.have.length(2);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        // when
        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');

        // then
        expect(outgoingFlows).to.have.length(2);

        // when
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent');
        const outgoingFlows = getBusinessObject(startEvent).outgoing;

        openPopup(startEvent);
        triggerAction('append-exclusive-gateway');
        commandStack.undo();

        // then
        expect(outgoingFlows).to.have.length(1);

        // when
        commandStack.redo();

        // then
        expect(outgoingFlows).to.have.length(2);
      }));

    });


    describe('data reference', function() {

      it('should append', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        expect(dataOutputAssociations).to.have.length(0);

        // when
        openPopup(task);
        triggerAction('append-data-store-reference');

        // then
        expect(dataOutputAssociations).to.have.length(1);
      }));


      it('should undo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        // when
        openPopup(task);
        triggerAction('append-data-store-reference');

        // then
        expect(dataOutputAssociations).to.have.length(1);

        // when
        commandStack.undo();

        // then
        expect(dataOutputAssociations).to.have.length(0);
      }));


      it('should redo', inject(function(elementRegistry, commandStack) {

        // given
        const task = elementRegistry.get('Task');
        const dataOutputAssociations = getBusinessObject(task).get('dataOutputAssociations');

        openPopup(task);
        triggerAction('append-data-store-reference');
        commandStack.undo();

        // then
        expect(dataOutputAssociations).to.have.length(0);

        // when
        commandStack.redo();

        // then
        expect(dataOutputAssociations).to.have.length(1);
      }));

    });

  });

});


// // helpers
function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {

    popupMenu.open(element, 'bpmn-append', {
      x: element.x + offset, y: element.y + offset
    });

  });
}

function queryEntry(id) {
  var container = getMenuContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
}

function queryEntries() {
  var container = getMenuContainer();

  return domQueryAll('.djs-popup .entry', container);
}

function getMenuContainer() {
  const popup = getBpmnJS().get('popupMenu');
  return popup._current.container;
}

function triggerAction(id) {
  var entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "' + id + '" not found in append menu');
  }

  var popupMenu = getBpmnJS().get('popupMenu');

  return popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));
}