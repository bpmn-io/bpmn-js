import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  getBusinessObject,
  is
} from 'lib/util/ModelUtil';

import {
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  filter,
  find,
  forEach,
  matchPattern
} from 'min-dash';

var testModules = [
  coreModule,
  modelingModule
];


describe('features/modeling - root element reference behavior', function() {

  var diagramXML = require('./RootElementReferenceBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('add root element', function() {

    forEach([
      'error',
      'escalation',
      'message',
      'signal'
    ], function(type) {

      describe(type, function() {

        var id = capitalizeFirstChar(type) + 'BoundaryEvent_1';

        var boundaryEvent,
            host,
            rootElement,
            pastedRootElement;

        describe('should add a copy', function() {

          beforeEach(inject(function(bpmnjs, copyPaste, elementRegistry, modeling) {

            // given
            boundaryEvent = elementRegistry.get(id);

            host = elementRegistry.get('Task_2');

            var businessObject = getBusinessObject(boundaryEvent),
                eventDefinitions = businessObject.get('eventDefinitions'),
                eventDefinition = eventDefinitions[ 0 ];

            rootElement = getRootElementReferenced(eventDefinition);

            // when
            copyPaste.copy(boundaryEvent);

            modeling.removeShape(boundaryEvent);

            collectionRemove(bpmnjs.getDefinitions().get('rootElements'), rootElement);

            expect(hasRootElement(rootElement)).to.be.false;

            boundaryEvent = copyPaste.paste({
              element: host,
              point: {
                x: host.x,
                y: host.y
              },
              hints: {
                attach: 'attach'
              }
            })[0];

            businessObject = getBusinessObject(boundaryEvent);
            pastedRootElement = getRootElementReferenced(
              businessObject.get('eventDefinitions')[ 0 ]
            );
          }));


          it('<do>', function() {

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.true;
          });


          it('<undo>', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.false;
          }));


          it('<redo>', inject(function(commandStack) {

            // given
            commandStack.undo();

            // when
            commandStack.redo();

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.true;
          }));

        });


        it('should NOT add', inject(function(bpmnFactory, bpmnjs, copyPaste, elementRegistry, moddleCopy, modeling) {

          // given
          boundaryEvent = elementRegistry.get(id);

          host = elementRegistry.get('Task_2');

          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ],
              rootElements = bpmnjs.getDefinitions().get('rootElements');

          rootElement = getRootElementReferenced(eventDefinition);

          var rootElementsOfTypeCount = filter(
            rootElements, matchPattern({ $type: rootElement.$type })
          ).length;

          copyPaste.copy(boundaryEvent);

          modeling.removeShape(boundaryEvent);

          collectionRemove(rootElements, rootElement);

          expect(hasRootElement(rootElement)).to.be.false;

          var rootElementWithSameId = bpmnFactory.create(rootElement.$type);

          moddleCopy.copyElement(rootElement, rootElementWithSameId);

          collectionRemove(rootElements, rootElementWithSameId);

          // when
          boundaryEvent = copyPaste.paste({
            element: host,
            point: {
              x: host.x,
              y: host.y
            },
            hints: {
              attach: 'attach'
            }
          })[0];

          // then
          var rootElementsOfType = filter(rootElements, matchPattern({ $type: rootElement.$type }));

          expect(rootElementsOfType).to.have.lengthOf(rootElementsOfTypeCount);
        }));

      });

    });


    describe('receive and send task', function() {

      forEach([
        'ReceiveTask',
        'SendTask'
      ], function(type) {

        var id = type;

        var task,
            rootElement,
            pastedRootElement;

        describe('should add a copy', function() {

          beforeEach(inject(function(bpmnjs, copyPaste, elementRegistry, modeling, canvas) {

            // given
            task = elementRegistry.get(id);

            var businessObject = getBusinessObject(task),
                rootElement = businessObject.messageRef;

            // when
            copyPaste.copy(task);

            modeling.removeShape(task);

            collectionRemove(bpmnjs.getDefinitions().get('rootElements'), rootElement);

            expect(hasRootElement(rootElement)).to.be.false;

            task = copyPaste.paste({
              element: canvas.getRootElement(),
              point: {
                x: task.x,
                y: task.y + 200
              }
            })[0];

            businessObject = getBusinessObject(task);
            pastedRootElement = businessObject.messageRef;
          }));


          it('<do>', function() {

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.true;
          });


          it('<undo>', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.false;
          }));


          it('<redo>', inject(function(commandStack) {

            // given
            commandStack.undo();

            // when
            commandStack.redo();

            // then
            expect(hasRootElement(rootElement)).to.be.false;
            expect(hasRootElement(pastedRootElement)).to.be.true;
          }));

        });


        it('should NOT add', inject(function(
            bpmnFactory, bpmnjs, copyPaste, elementRegistry, moddleCopy, modeling, canvas
        ) {

          // given
          task = elementRegistry.get(id);

          var businessObject = getBusinessObject(task),
              rootElement = businessObject.messageRef,
              rootElements = bpmnjs.getDefinitions().get('rootElements');

          var rootElementsOfTypeCount = filter(
            rootElements, matchPattern({ $type: rootElement.$type })
          ).length;

          copyPaste.copy(task);

          modeling.removeShape(task);

          collectionRemove(rootElements, rootElement);

          expect(hasRootElement(rootElement)).to.be.false;

          var rootElementWithSameId = bpmnFactory.create(rootElement.$type);

          moddleCopy.copyElement(rootElement, rootElementWithSameId);

          collectionRemove(rootElements, rootElementWithSameId);

          // when
          task = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: task.x,
              y: task.y + 200
            }
          })[0];

          // then
          var rootElementsOfType = filter(rootElements, matchPattern({ $type: rootElement.$type }));

          expect(rootElementsOfType).to.have.lengthOf(rootElementsOfTypeCount);
        }));
      });
    });

  });


  describe('copy root element reference', function() {

    forEach([
      'error',
      'escalation',
      'message',
      'signal'
    ], function(type) {

      describe(type, function() {

        var id = capitalizeFirstChar(type) + 'BoundaryEvent_1';

        var boundaryEvent,
            host,
            rootElement;

        beforeEach(inject(function(copyPaste, elementRegistry) {

          // given
          boundaryEvent = elementRegistry.get(id);

          host = elementRegistry.get('Task_2');

          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          rootElement = getRootElementReferenced(eventDefinition);

          copyPaste.copy(boundaryEvent);

          // when
          boundaryEvent = copyPaste.paste({
            element: host,
            point: {
              x: host.x,
              y: host.y
            },
            hints: {
              attach: 'attach'
            }
          })[0];
        }));


        it('should copy root element reference', function() {

          // then
          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          expect(getRootElementReferenced(eventDefinition)).to.equal(rootElement);
        });

      });

    });


    describe('receive and send task', function() {

      forEach([
        'ReceiveTask',
        'SendTask'
      ], function(type) {

        var id = type,
            task,
            rootElement;

        beforeEach(inject(function(copyPaste, elementRegistry, canvas) {

          // given
          task = elementRegistry.get(id);

          var businessObject = getBusinessObject(task);

          rootElement = businessObject.messageRef;

          copyPaste.copy(task);

          // when
          task = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: task.x,
              y: task.y + 200,
            }
          })[0];
        }));


        it('should copy root element reference', function() {

          // then
          var businessObject = getBusinessObject(task),
              copiedRootElement = businessObject.messageRef;

          expect(copiedRootElement).to.equal(rootElement);
        });
      });
    });

  });

});

// helpers //////////

function getRootElementReferenced(eventDefinition) {
  if (is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
    return eventDefinition.get('errorRef');
  } else if (is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
    return eventDefinition.get('escalationRef');
  } else if (is(eventDefinition, 'bpmn:MessageEventDefinition')) {
    return eventDefinition.get('messageRef');
  } else if (is(eventDefinition, 'bpmn:SignalEventDefinition')) {
    return eventDefinition.get('signalRef');
  }
}

function hasRootElement(rootElement) {
  var definitions = getBpmnJS().getDefinitions(),
      rootElements = definitions.get('rootElements');

  return !!rootElement && !!find(rootElements, matchPattern({ id: rootElement.id }));
}

function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}