/* global sinon */

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import tooltipsModule from 'diagram-js/lib/features/tooltips';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import {
  map,
  filter,
  forEach,
  uniqueBy
} from 'min-dash';

import DescriptorTree from './DescriptorTree';

import { is } from 'lib/util/ModelUtil';


describe('features/copy-paste', function() {

  var testModules = [
    bpmnCopyPasteModule,
    copyPasteModule,
    tooltipsModule,
    modelingModule,
    coreModule
  ];

  var basicXML = require('../../../fixtures/bpmn/features/copy-paste/basic.bpmn'),
      clonePropertiesXML = require('../../../fixtures/bpmn/features/replace/clone-properties.bpmn'),
      propertiesXML = require('../../../fixtures/bpmn/features/copy-paste/properties.bpmn'),
      collaborationXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration.bpmn'),
      collaborationMultipleXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration-multiple.bpmn'),
      collaborationAssociations = require('../../../fixtures/bpmn/features/copy-paste/data-associations.bpmn');


  describe('basic diagram', function() {

    beforeEach(bootstrapModeler(basicXML, {
      modules: testModules
    }));


    describe('copy', function() {

      it('selected elements', inject(function(elementRegistry, copyPaste) {

        // when
        var tree = copy([ 'SubProcess_1kd6ist' ]);

        var subProcess = tree.getElement('SubProcess_1kd6ist');

        // then
        expect(tree.getLength()).to.equal(3);

        expect(tree.getDepthLength(0)).to.equal(1);
        expect(tree.getDepthLength(1)).to.equal(3);
        expect(tree.getDepthLength(2)).to.equal(12);

        expect(subProcess.isExpanded).to.be.true;
      }));


      it('selected elements 2', inject(function(elementRegistry, copyPaste) {

        // given
        var event = elementRegistry.get('StartEvent_1');

        // add business object type property
        event.businessObject.type = 'Foo';

        // when
        var tree = copy([ event ]);

        var eventDescriptor = tree.getElement('StartEvent_1');

        // then
        expect(tree.getLength()).to.equal(1);

        expect(eventDescriptor.type).to.eql('bpmn:StartEvent');
      }));

    });


    it('should paste twice', inject(
      function(elementRegistry, canvas, copyPaste) {
        // given
        var element = elementRegistry.get('SubProcess_1kd6ist'),
            rootElement = canvas.getRootElement();

        // when
        copyPaste.copy(element);

        copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 100
          }
        });

        copyPaste.paste({
          element: rootElement,
          point: {
            x: 1500,
            y: 275
          }
        });

        // then
        // 3 sub-processes
        // 6 pasted labels
        expect(rootElement.children).to.have.length(9);

        var pastedElements = elementRegistry.filter(function(e) {
          return e !== element && is(e, 'bpmn:SubProcess');
        });

        expect(pastedElements[0].id).not.to.equal(pastedElements[1].id);
      }
    ));


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


      it.skip('selected elements', inject(integrationTest([ 'SubProcess_1kd6ist' ])));


      it('should retain color properties',
        inject(function(modeling, copyPaste, canvas, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1fo63a7'),
              rootElement = canvas.getRootElement(),
              newTask,
              fill = '#BBDEFB',
              stroke = '#1E88E5';


          // when
          modeling.setColor(task, { fill: fill, stroke: stroke });

          copyPaste.copy([ task ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          newTask = elementRegistry.filter(function(element) {
            return element.parent === rootElement && element.type === 'bpmn:Task' && element.id !== 'Task_1fo63a7';
          })[0];

          // then
          expect(newTask.type).to.equal('bpmn:Task');
          expect(newTask.businessObject.di.fill).to.equal(fill);
          expect(newTask.businessObject.di.stroke).to.equal(stroke);
        })
      );

    });


    describe('rules', function() {

      it('disallow individual boundary events copying', inject(
        function(copyPaste, elementRegistry, canvas) {

          var boundaryEventA = elementRegistry.get('BoundaryEvent_1404oxd'),
              boundaryEventB = elementRegistry.get('BoundaryEvent_1c94bi9');

          // when
          var tree = copy([ boundaryEventA, boundaryEventB ]);

          expect(tree.getLength()).to.equal(0);
        }
      ));
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

        expect(participant.children).to.have.length(7);
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

      it('multiple participants', inject(integrationTest([
        'Participant_0pgdgt4',
        'Participant_1id96b4'
      ])));

      it('multiple participants', inject(integrationTest([
        'Participant_0pgdgt4',
        'Participant_1id96b4'
      ])));

    });

  });


  describe('participants', function() {

    beforeEach(bootstrapModeler(collaborationAssociations, { modules: testModules }));


    it('copying participant should copy process as well', inject(
      function(elementRegistry, copyPaste, canvas) {

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

        expect(uniqueBy(function(e) {return e;}, processIds)).to.have.length(4);
      }
    ));


    it('participant with DataOutputAssociation', inject(integrationTest([ 'Participant_Output' ])));


    it('participant with DataInputAssociation', inject(integrationTest([ 'Participant_Input' ])));

  });


  describe('deep properties', function() {

    var camundaPackage = require('../../../fixtures/json/model/camunda');

    beforeEach(bootstrapModeler(clonePropertiesXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('integration', inject(integrationTest([ 'Participant_0x9lnke' ])));


    it('should copy UserTask properties',
      inject(function(elementRegistry, copyPaste, canvas) {

        var participant = elementRegistry.get('Participant_0x9lnke'),
            task = elementRegistry.get('Task_1'),
            newTask;

        // when
        copyPaste.copy([ task ]);

        copyPaste.paste({
          element: participant,
          point: {
            x: 500,
            y: 50
          }
        });

        newTask = filter(participant.children, function(element) {
          return is(element, 'bpmn:Task');
        })[0];

        // then
        var bo = task.businessObject;
        var copiedBo = newTask.businessObject;


        expect(copiedBo.asyncBefore).to.eql(bo.asyncBefore);
        expect(copiedBo.documentation).to.jsonEqual(bo.documentation);

        var copiedExtensions = copiedBo.extensionElements;

        expect(copiedExtensions).to.jsonEqual(bo.extensionElements);
        expect(copiedExtensions.$parent).to.equal(copiedBo);
      })
    );

  });

});



// test helpers //////////////////////


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

  return getBpmnJS().invoke(function(copyPaste, elementRegistry) {

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
      expect(collA).not.to.contain(element);
    }
  });
}
