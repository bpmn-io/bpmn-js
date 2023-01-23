import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent,
  createEvent as globalEvent
} from '../../../util/MockEvents';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import createAppendElements from 'lib/features/create-append-anything';

import {
  query as domQuery
} from 'min-dom';

import { is } from 'lib/util/ModelUtil';


describe('features/popup-menu - create menu provider', function() {

  var diagramXML = require('./CreateMenuProvider.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    createAppendElements
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create', function() {

    describe('task', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-task', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:Task');
        expectSelected(selection, 'bpmn:Task');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-task', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:Task');
        expectSelected(selection, 'bpmn:Task');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:Task', false);
        expectSelected(selection, 'bpmn:Task', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-task', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:Task', false);
        expectSelected(selection, 'bpmn:Task', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:Task');
      }));

    });


    describe('sub process', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-expanded-subprocess', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:SubProcess');
        expectSelected(selection, 'bpmn:SubProcess');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-expanded-subprocess', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:SubProcess');
        expectSelected(selection, 'bpmn:SubProcess');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:SubProcess', false);
        expectSelected(selection, 'bpmn:SubProcess', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-expanded-subprocess', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:SubProcess', false);
        expectSelected(selection, 'bpmn:SubProcess', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:SubProcess');
      }));

    });


    describe('event', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-none-start-event', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:StartEvent');
        expectSelected(selection, 'bpmn:StartEvent');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-none-start-event', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:StartEvent');
        expectSelected(selection, 'bpmn:StartEvent');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:StartEvent', false);
        expectSelected(selection, 'bpmn:StartEvent', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-none-start-event', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:StartEvent', false);
        expectSelected(selection, 'bpmn:StartEvent', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:StartEvent');
      }));

    });


    describe('gateway', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-exclusive-gateway', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:ExclusiveGateway');
        expectSelected(selection, 'bpmn:ExclusiveGateway');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-exclusive-gateway', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:ExclusiveGateway');
        expectSelected(selection, 'bpmn:ExclusiveGateway');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:ExclusiveGateway', false);
        expectSelected(selection, 'bpmn:ExclusiveGateway', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-exclusive-gateway', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:ExclusiveGateway', false);
        expectSelected(selection, 'bpmn:ExclusiveGateway', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:ExclusiveGateway');
      }));

    });


    describe('data reference', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-data-store-reference', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:DataStoreReference');
        expectSelected(selection, 'bpmn:DataStoreReference');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-data-store-reference', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:DataStoreReference');
        expectSelected(selection, 'bpmn:DataStoreReference');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:DataStoreReference', false);
        expectSelected(selection, 'bpmn:DataStoreReference', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-data-store-reference', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:DataStoreReference', false);
        expectSelected(selection, 'bpmn:DataStoreReference', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:DataStoreReference');
      }));

    });


    describe('participant', function() {

      it('should create', inject(function(canvas, dragging, selection, elementRegistry) {

        // when
        triggerEntry('create-expanded-pool', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:Participant');
        expectSelected(selection, 'bpmn:Participant');
      }));


      it('should undo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-expanded-pool', canvas, dragging);

        // then
        expectElement(elementRegistry, 'bpmn:Participant');
        expectSelected(selection, 'bpmn:Participant');

        // when
        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:Participant', false);
        expectSelected(selection, 'bpmn:Participant', false);
      }));


      it('should redo', inject(function(canvas, dragging, selection, commandStack, elementRegistry) {

        // when
        triggerEntry('create-expanded-pool', canvas, dragging);

        commandStack.undo();

        // then
        expectElement(elementRegistry, 'bpmn:Participant', false);
        expectSelected(selection, 'bpmn:Participant', false);

        // when;
        commandStack.redo();

        // then
        expectElement(elementRegistry, 'bpmn:Participant');
      }));

    });

  });

});


// // helpers
function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {

    popupMenu.open(element, 'bpmn-create', {
      x: element.x + offset, y: element.y + offset
    });

  });
}

function queryEntry(id) {
  var container = getMenuContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
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

function triggerEntry(id, canvas, dragging) {
  var rootElement = canvas.getRootElement(),
      rootGfx = canvas.getGraphics(rootElement);

  openPopup(rootElement);
  triggerAction(id);

  dragging.hover({ element: rootElement, gfx: rootGfx });
  dragging.move(createCanvasEvent({ x: 100, y: 100 }));

  // when
  dragging.end();
}

function expectElement(elementRegistry, type, result = true) {
  const element = elementRegistry.find((element) => is(element, type));

  if (!result) {
    expect(element).to.not.exist;
  } else {
    expect(element).to.exist;
  }
}

function expectSelected(selection, type, result = true) {
  const selected = selection.get();

  if (!result) {
    expect(selected).to.have.length(0);
  } else {
    expect(selected).to.have.length(1);
    expect(is(selected[0], type)).to.be.true;
  }
}