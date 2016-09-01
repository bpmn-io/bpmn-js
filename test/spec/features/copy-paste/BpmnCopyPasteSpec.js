'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject, sinon */

var bpmnCopyPasteModule = require('../../../../lib/features/copy-paste'),
    copyPasteModule = require('diagram-js/lib/features/copy-paste'),
    tooltipsModule = require('diagram-js/lib/features/tooltips'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var map = require('lodash/collection/map'),
    forEach = require('lodash/collection/forEach'),
    uniq = require('lodash/array/uniq');

var DescriptorTree = require('./DescriptorTree');


describe('features/copy-paste', function() {

  var testModules = [ bpmnCopyPasteModule, copyPasteModule, tooltipsModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/features/copy-paste/basic.bpmn'),
      propertiesXML = require('../../../fixtures/bpmn/features/copy-paste/properties.bpmn'),
      collaborationXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration.bpmn'),
      collaborationMultipleXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration-multiple.bpmn'),
      collaborationAssociations = require('../../../fixtures/bpmn/features/copy-paste/data-associations.bpmn');


  describe('basic diagram', function() {

    beforeEach(bootstrapModeler(basicXML, { modules: testModules }));


    describe('copy', function() {

      it('selected elements', inject(function(elementRegistry, copyPaste) {

        // given
        var subProcess,
            startEvent,
            boundaryEvent,
            textAnnotation;

        // when
        var tree = copy([ 'SubProcess_1kd6ist' ]);

        startEvent = tree.getElement('StartEvent_1');
        boundaryEvent = tree.getElement('BoundaryEvent_1c94bi9');
        subProcess = tree.getElement('SubProcess_1kd6ist');
        textAnnotation = tree.getElement('TextAnnotation_0h1hhgg');

        // then
        expect(tree.getLength()).to.equal(3);

        expect(tree.getDepthLength(0)).to.equal(1);
        expect(tree.getDepthLength(1)).to.equal(3);
        expect(tree.getDepthLength(2)).to.equal(15);

        expect(subProcess.isExpanded).to.be.true;
        expect(startEvent.name).to.equal('hello');
        expect(textAnnotation.text).to.equal('foo');
        expect(boundaryEvent.eventDefinitions).to.contain('bpmn:TimerEventDefinition');
      }));

    });


    describe('integration', function() {

      it('should retain label\'s relative position',
        inject(function(modeling, copyPaste, canvas, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventLabel = startEvent.label,
              seqFlow = elementRegistry.get('SequenceFlow_1rtr33r'),
              seqFlowLabel = seqFlow.label,
              task = elementRegistry.get('Task_1fo63a7'),
              rootElement = canvas.getRootElement(),
              newEvent, newFlow;

          // when
          copyPaste.copy([ startEvent, task ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          newEvent = elementRegistry.filter(function(element) {
            return element.parent === rootElement && element.type === 'bpmn:StartEvent';
          })[0];

          newFlow = elementRegistry.filter(function(element) {
            return element.parent === rootElement && element.type === 'bpmn:SequenceFlow';
          })[0];

          // then
          expect(newEvent.label.x - newEvent.x).to.equal(startEventLabel.x - startEvent.x);
          expect(newEvent.label.y - newEvent.y).to.equal(startEventLabel.y - startEvent.y);

          var seqFlowDeltaX = seqFlow.label.x - seqFlow.waypoints[0].x;

          expect(newFlow.label.x - newFlow.waypoints[0].x).to.be.within(seqFlowDeltaX, seqFlowDeltaX + 1);
          expect(newFlow.label.y - newFlow.waypoints[0].y).to.equal(seqFlowLabel.y - seqFlow.waypoints[0].y);
        })
      );


      it('should retain default & conditional flow property',
        inject(function(elementRegistry, copyPaste, canvas, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1kd6ist'),
              rootElement = canvas.getRootElement(),
              task, defaultFlow, conditionalFlow;

          // when
          copyPaste.copy(subProcess);

          modeling.removeElements([ subProcess ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          task = elementRegistry.filter(function(element) {
            return element.type === 'bpmn:Task';
          })[0];

          defaultFlow = elementRegistry.filter(function(element) {
            return !!(element.type === 'bpmn:SequenceFlow' && task.businessObject.default.id === element.id);
          })[0];

          conditionalFlow = elementRegistry.filter(function(element) {
            return !!(element.type === 'bpmn:SequenceFlow' && element.businessObject.conditionExpression);
          })[0];

          expect(defaultFlow).to.exist;
          expect(conditionalFlow).to.exist;
        })
      );


      it('should retain loop characteristics',
        inject(function(elementRegistry, copyPaste, canvas, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_0gev7mx'),
              rootElement = canvas.getRootElement(),
              loopCharacteristics;

          // when
          copyPaste.copy(subProcess);

          modeling.removeElements([ subProcess ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          subProcess = elementRegistry.filter(function(element) {
            return !!(element.id !== 'SubProcess_1kd6ist' && element.type === 'bpmn:SubProcess');
          })[0];

          loopCharacteristics = subProcess.businessObject.loopCharacteristics;

          expect(loopCharacteristics.$type).to.equal('bpmn:MultiInstanceLoopCharacteristics');
          expect(loopCharacteristics.isSequential).to.be.true;
        })
      );


      it('selected elements', inject(integrationTest([ 'SubProcess_1kd6ist' ])));

    });


    describe('rules', function() {

      it('disallow individual boundary events copying', inject(function(copyPaste, elementRegistry, canvas) {

        var boundaryEventA = elementRegistry.get('BoundaryEvent_1404oxd'),
            boundaryEventB = elementRegistry.get('BoundaryEvent_1c94bi9');

        // when
        var tree = copy([ boundaryEventA, boundaryEventB ]);

        expect(tree.getLength()).to.equal(0);
      }));
    });

  });


  describe('properties', function() {

    beforeEach(bootstrapModeler(propertiesXML, { modules: testModules }));

    var subProcesses = [
      'Sub_non_interrupt',
      'Sub_event_subprocess',
      'Sub_interrupt',
      'Sub_transaction'
    ];

    function copyPasteElement(elementRegistry, canvas, copyPaste, modeling, element) {
      // given
      var elem = elementRegistry.get(element),
          rootElement = canvas.getRootElement();

      // when
      copyPaste.copy(elem);

      modeling.removeElements([ elem ]);

      copyPaste.paste({
        element: rootElement,
        point: {
          x: 175,
          y: 450
        }
      });
    }

    it('should copy & paste non interrupting (boundary) events',
      inject(function(elementRegistry, canvas, copyPaste, modeling) {

        // when
        copyPasteElement(elementRegistry, canvas, copyPaste, modeling, 'Sub_non_interrupt');

        var subProcess = elementRegistry.filter(function(element) {
          return element.type === 'bpmn:SubProcess' && (subProcesses.indexOf(element.id) === -1);
        })[0];

        var nonInterruptEvt = subProcess.attachers[0].businessObject;

        // then
        expect(nonInterruptEvt.cancelActivity).to.be.false;
      })
    );


    it('should copy & paste event sub processes',
      inject(function(elementRegistry, canvas, copyPaste, modeling) {

        // when
        copyPasteElement(elementRegistry, canvas, copyPaste, modeling, 'Sub_event_subprocess');

        var subProcess = elementRegistry.filter(function(element) {
          return element.type === 'bpmn:SubProcess' && (subProcesses.indexOf(element.id) === -1);
        })[0];

        expect(subProcess.businessObject.triggeredByEvent).to.be.true;
        expect(subProcess.businessObject.isExpanded).to.be.true;
      })
    );


    it('should copy & paste interrupting (boundary) events',
      inject(function(elementRegistry, canvas, copyPaste, modeling) {

        // when
        copyPasteElement(elementRegistry, canvas, copyPaste, modeling, 'Sub_interrupt');

        var subProcess = elementRegistry.filter(function(element) {
          return element.type === 'bpmn:SubProcess' && (subProcesses.indexOf(element.id) === -1);
        })[0];

        var interruptEvt = subProcess.attachers[0].businessObject;

        // then
        expect(interruptEvt.cancelActivity).to.be.true;
      })
    );


    it('should copy & paste transactions',
      inject(function(elementRegistry, canvas, copyPaste, modeling) {

        // when
        copyPasteElement(elementRegistry, canvas, copyPaste, modeling, 'Sub_transaction');

        var transaction = elementRegistry.filter(function(element) {
          return element.type === 'bpmn:Transaction';
        })[0];

        expect(transaction).to.exist;
      })
    );

  });


  describe('basic collaboration', function() {

    beforeEach(bootstrapModeler(collaborationXML, { modules: testModules }));


    describe('integration', function() {

      it('participant with including lanes + elements', inject(integrationTest([ 'Participant_0uu1rvj' ])));

      it('collapsed pool', inject(integrationTest([ 'Participant_145muai' ])));

    });


    describe('rules', function() {

      it('disallow individual lanes copying', inject(function(copyPaste, elementRegistry, canvas) {

        // when
        var tree = copy([ 'Lane_13h648l', 'Lane_1gl63sa' ]);

        // then
        expect(tree.getLength()).to.equal(0);
      }));


      it('pasting on a collaboration is disallowed when NOT every element is a Participant',
        inject(function(copyPaste, elementRegistry, canvas, tooltips, eventBus) {

          var collaboration = canvas.getRootElement();

          var pasteRejected = sinon.spy(function() {});

          // when
          var tree = copy([ 'Task_13xbgyg', 'Participant_145muai' ]);

          // then
          expect(tree.getDepthLength(0)).to.equal(2);

          // when
          eventBus.on('elements.paste.rejected', pasteRejected);

          copyPaste.paste({
            element: collaboration,
            point: {
              x: 1000,
              y: 1000
            }
          });

          expect(pasteRejected).to.have.been.called;
        })
      );


      it('pasting participants on a process is disallowed when it\'s not a collaboration',
        inject(function(copyPaste, elementRegistry, canvas, tooltips, eventBus, modeling, elementFactory) {

          var participant = elementRegistry.get('Participant_145muai'),
              otherParticipant = elementRegistry.get('Participant_0uu1rvj'),
              startEvent = elementFactory.create('shape', { type: 'bpmn:StartEvent' }),
              rootElement;

          var pasteRejected = sinon.spy(function() {});

          // when
          copyPaste.copy([ participant ]);

          modeling.removeElements([ participant, otherParticipant ]);

          rootElement = canvas.getRootElement();

          modeling.createShape(startEvent, { x: 50, y: 50 }, rootElement);

          eventBus.on('elements.paste.rejected', pasteRejected);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 500,
              y: 200
            }
          });

          expect(pasteRejected).to.have.been.called;
        })
      );

    });

  });


  describe('complex collaboration', function() {

    beforeEach(bootstrapModeler(collaborationMultipleXML, { modules: testModules }));

    describe('basics', function() {

      it('pasting on a lane', inject(function(elementRegistry, copyPaste) {

        // given
        var lane = elementRegistry.get('Lane_0aws6ii'),
            task = elementRegistry.get('Task_1pamrp2'),
            participant = elementRegistry.get('Participant_1id96b4');

        // when
        copyPaste.copy([ task ]);

        copyPaste.paste({
          element: lane,
          point: {
            x: 400,
            y: 450
          }
        });

        // then
        expect(lane.children).to.be.empty;
        expect(lane.businessObject.flowNodeRef).to.have.length(2);

        expect(participant.children).to.have.length(10);
      }));


      it('pasting on a nested lane', inject(function(elementRegistry, copyPaste) {
        // given
        var lane = elementRegistry.get('Lane_1yo0kyz'),
            task = elementRegistry.get('Task_0n0k2nj'),
            participant = elementRegistry.get('Participant_0pgdgt4');

        // when
        copyPaste.copy([ task ]);

        copyPaste.paste({
          element: lane,
          point: {
            x: 200,
            y: 75
          }
        });

        // then
        expect(lane.children).to.be.empty;
        expect(lane.businessObject.flowNodeRef).to.have.length(2);

        expect(lane.parent.children).to.have.length(2);
        expect(participant.children).to.have.length(5);
      }));

    });


    describe('integration', function() {

      it('multiple participants', inject(integrationTest([ 'Participant_0pgdgt4', 'Participant_1id96b4' ])));

      it('multiple participants', inject(integrationTest([ 'Participant_0pgdgt4', 'Participant_1id96b4' ])));
    });

  });


  describe('participants', function() {

    beforeEach(bootstrapModeler(collaborationAssociations, { modules: testModules }));


    it('copying participant should copy process as well', inject(function(elementRegistry, copyPaste, canvas) {

      // given
      var participants = map([ 'Participant_Input', 'Participant_Output' ], function(e) {
        return elementRegistry.get(e);
      });
      var rootElement = canvas.getRootElement();

      // when
      copyPaste.copy(participants);

      copyPaste.paste({
        element: rootElement,
        point: {
          x: 4000,
          y: 4500
        }
      });

      // then
      var elements = elementRegistry.filter(function(element) {
        return element.type === 'bpmn:Participant';
      });

      var processIds = map(elements, function(e) {
        return e.businessObject.processRef.id;
      });

      expect(uniq(processIds)).to.have.length(4);
    }));


    it('participant with OutputDataAssociation', inject(integrationTest([ 'Participant_Output' ])));


    it('participant with InputDataAssociation', inject(integrationTest([ 'Participant_Input' ])));

  });

});



////// test helpers //////////////////////////////////////////////////


function integrationTest(ids) {

  return function(canvas, elementRegistry, modeling, copyPaste, commandStack) {
    // given
    var shapes = elementRegistry.getAll(),
        rootElement;

    var initialContext = {
          type: mapProperty(shapes, 'type'),
          ids: mapProperty(shapes, 'id'),
          length: shapes.length
        },
        currentContext;

    var elements = map(ids, function(id) {
      return elementRegistry.get(id);
    });

    copyPaste.copy(elements);

    modeling.removeElements(elements);

    rootElement = canvas.getRootElement();

    copyPaste.paste({
      element: rootElement,
      point: {
        x: 1100,
        y: 250
      }
    });

    elements = elementRegistry.getAll();

    // remove root
    elements = elementRegistry.filter(function(element) {
      return !!element.parent;
    });

    modeling.moveElements(elements, { x: 50, y: -50 });

    // when
    commandStack.undo();
    commandStack.undo();
    commandStack.undo();

    elements = elementRegistry.getAll();

    currentContext = {
      type: mapProperty(elements, 'type'),
      ids: mapProperty(elements, 'id'),
      length: elements.length
    };

    // then
    expect(initialContext).to.have.length(currentContext.length);

    expectCollection(initialContext.ids, currentContext.ids, true);

    // when
    commandStack.redo();
    commandStack.redo();
    commandStack.redo();

    elements = elementRegistry.getAll();

    currentContext = {
      type: mapProperty(elements, 'type'),
      ids: mapProperty(elements, 'id'),
      length: elements.length
    };

    // then
    expect(initialContext).to.have.length(currentContext.length);

    expectCollection(initialContext.type, currentContext.type, true);
    expectCollection(initialContext.ids, currentContext.ids, false);
  };
}


/**
 * Copy elements (or elements with given ids).
 *
 * @param {Array<String|djs.model.Base} ids
 *
 * @return {DescriptorTree}
 */
function copy(ids) {

  return TestHelper.getBpmnJS().invoke(function(copyPaste, elementRegistry) {

    var elements = ids.map(function(e) {
      var element = elementRegistry.get(e.id || e);

      expect(element).to.exist;

      return element;
    });

    var copyResult = copyPaste.copy(elements);

    return new DescriptorTree(copyResult);
  });
}

function mapProperty(shapes, prop) {
  return map(shapes, function(shape) {
    return shape[prop];
  });
}

function expectCollection(collA, collB, contains) {
  expect(collA).to.have.length(collB.length);

  forEach(collB, function(element) {
    if (!element.parent) {
      return;
    }

    if (contains) {
      expect(collA).to.contain(element);
    } else {
      expect(collA).to.not.contain(element);
    }
  });
}
