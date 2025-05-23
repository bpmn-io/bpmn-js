import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import camundaPackage from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  find,
  forEach,
  isArray,
  isNumber,
  keys,
  map,
  pick,
  reduce
} from 'min-dash';

import {
  getBusinessObject,
  getDi,
  is
} from 'lib/util/ModelUtil';

import { isRoot } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('../../../../lib/model/Types').Element} Element
 */


describe('features/copy-paste', function() {

  var testModules = [
    bpmnCopyPasteModule,
    copyPasteModule,
    coreModule,
    modelingModule
  ];

  var basicXML = require('./basic.bpmn'),
      copyPropertiesXML = require('./copy-properties.bpmn'),
      propertiesXML = require('./properties.bpmn'),
      complexXML = require('./complex.bpmn'),
      collaborationXML = require('./collaboration.bpmn'),
      collaborationMultipleXML = require('./collaboration-multiple.bpmn'),
      collaborationAssociationsXML = require('./data-associations.bpmn'),
      eventBasedGatewayXML = require('./event-based-gateway.bpmn'),
      collapsedSubprocessXML = require('./collapsed-subprocess.bpmn');


  describe('basic diagram', function() {

    beforeEach(bootstrapModeler(basicXML, {
      modules: testModules
    }));


    describe('copy', function() {

      it('should copy sub process', inject(function() {

        // when
        var tree = copy('SubProcess_1');

        // then
        expect(keys(tree)).to.have.length(3);

        expect(getAllElementsInTree(tree, 0)).to.have.length(1);
        expect(getAllElementsInTree(tree, 1)).to.have.length(3);
        expect(getAllElementsInTree(tree, 2)).to.have.length(12);

        expect(findDescriptorInTree('SubProcess_1', tree).isExpanded).to.be.true;
      }));


      describe('should copy boundary events without host', function() {

        it('should copy/paste', inject(function(elementRegistry, canvas, copyPaste) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              rootElement = canvas.getRootElement();

          // when
          copyPaste.copy(boundaryEvent);

          var copiedElements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 1000,
              y: 1000
            }
          });

          // then
          expect(rootElement.children).to.have.length(2);

          expect(copiedElements).to.have.length(1);

          expect(copiedElements[0].type).to.eql('bpmn:IntermediateCatchEvent');

          expect(copiedElements[0].attachedToRef).to.be.undefined;

          expect(copiedElements[0].host).to.be.undefined;

          expect(copiedElements[0].id).not.to.eql(boundaryEvent.id);
        }));


        it('should copy/paste and reattach', inject(function(elementRegistry, canvas, copyPaste) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              task = elementRegistry.get('Task_1'),
              rootElement = canvas.getRootElement();

          // when
          copyPaste.copy(boundaryEvent);

          var copiedElement = copyPaste.paste({
            element: rootElement,
            point: {
              x: 1000,
              y: 1000
            }
          })[0];

          copyPaste.copy(copiedElement);

          var attachedBoundaryEvent = copyPaste.paste({
            element: task,
            point: {
              x: task.x,
              y: task.y
            },
            hints: {
              attach: 'attach'
            }
          })[0];

          // then
          expect(attachedBoundaryEvent.businessObject.attachedToRef).to.eql(task.businessObject);
          expect(attachedBoundaryEvent.host).to.be.eql(task);
          expect(attachedBoundaryEvent.type).to.eql('bpmn:BoundaryEvent');

        }));

      });


      it('should not mutate copy', inject(function(copyPaste, elementRegistry, modeling) {

        // given
        var parent = elementRegistry.get('Process_1'),
            event = elementRegistry.get('IntermediateThrowEvent_1');

        copyPaste.copy(event);

        // when
        modeling.updateProperties(event, {
          name: 'foo'
        });

        var elements = copyPaste.paste({
          element: parent,
          point: {
            x: 1000,
            y: 1000
          }
        });

        // then
        var pastedEvent = find(elements, function(element) {
          return is(element, 'bpmn:IntermediateThrowEvent');
        });

        var pastedEventBo = getBusinessObject(pastedEvent);
        expect(pastedEventBo.name).not.to.exist;
      }));

    });


    it('should paste twice', inject(function(elementRegistry, canvas, copyPaste) {

      // given
      var subProcess = elementRegistry.get('SubProcess_1'),
          rootElement = canvas.getRootElement();

      // when
      copyPaste.copy(subProcess);

      copyPaste.paste({
        element: rootElement,
        point: {
          x: 1000,
          y: 1000
        }
      });

      var elements = copyPaste.paste({
        element: rootElement,
        point: {
          x: 2000,
          y: 1000
        }
      });

      // then
      expect(rootElement.children).to.have.length(13);

      var subProcesses = elements.filter(function(element) {
        return is(element, 'bpmn:SubProcess');
      });

      expect(subProcesses[0].id).not.to.equal(subProcesses[1].id);
      expect(subProcesses[0].businessObject).not.to.equal(subProcesses[1].businessObject);
    }));


    describe('integration', function() {

      it('should copy conditionExpression and default flow properties',
        inject(function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1'),
              rootElement = canvas.getRootElement();

          // when
          copyPaste.copy(subProcess);

          modeling.removeShape(subProcess);

          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 300,
              y: 300
            }
          });

          // then
          var task = find(elements, function(element) {
            return is(element, 'bpmn:Task');
          });

          var taskBo = getBusinessObject(task);

          var conditionalFlow = find(elementRegistry.getAll(), function(element) {
            return is(element, 'bpmn:SequenceFlow') && element.businessObject.conditionExpression;
          });

          var defaultFlow = find(elementRegistry.getAll(), function(element) {
            return is(element, 'bpmn:SequenceFlow') && taskBo.default.id === element.id;
          });

          expect(conditionalFlow).to.exist;
          expect(defaultFlow).to.exist;
          expect(Object.prototype.propertyIsEnumerable.call(taskBo, 'default')).to.be.false;
        })
      );


      it('should copy attachedToRef properties', inject(function(canvas, copyPaste, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
            rootElement = canvas.getRootElement();

        // when
        copyPaste.copy([ task, boundaryEvent ]);

        var elements = copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000
          }
        });

        // then
        task = find(elements, function(element) {
          return is(element, 'bpmn:Task');
        });

        boundaryEvent = find(elements, function(element) {
          return is(element, 'bpmn:BoundaryEvent');
        });

        // then
        var boundaryEventBo = getBusinessObject(boundaryEvent);

        expect(boundaryEventBo.attachedToRef).to.equal(getBusinessObject(task));
      }));


      it('should copy loopCharacteristics properties',
        inject(function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              rootElement = canvas.getRootElement();

          // when
          copyPaste.copy(subProcess);

          modeling.removeShape(subProcess);

          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 300,
              y: 300
            }
          });

          subProcess = find(elements, function(element) {
            return is(element, 'bpmn:SubProcess');
          });

          var subProcessesBo = getBusinessObject(subProcess);

          var loopCharacteristics = subProcessesBo.loopCharacteristics;

          expect(loopCharacteristics.$type).to.equal('bpmn:MultiInstanceLoopCharacteristics');
          expect(loopCharacteristics.isSequential).to.be.true;
        })
      );


      it('should copy color properties',
        inject(function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('Task_1'),
              rootElement = canvas.getRootElement(),
              fill = '#ff0000',
              stroke = '#00ff00';


          // when
          modeling.setColor(task, { fill: fill, stroke: stroke });

          copyPaste.copy(task);

          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 1000,
              y: 1000
            }
          });

          // then
          task = find(elements, function(element) {
            return is(element, 'bpmn:Task');
          });

          var di = getDi(task);

          expect(di.get('background-color')).to.equal(fill);
          expect(di.get('border-color')).to.equal(stroke);

          // TODO @barmac: remove when we drop bpmn.io properties
          expect(di.fill).to.equal(fill);
          expect(di.stroke).to.equal(stroke);
        })
      );


      it('should copy label', inject(
        function(canvas, copyPaste, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1'),
              rootElement = canvas.getRootElement();

          copyPaste.copy(startEvent);

          // when
          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 50,
              y: 50
            }
          });

          // then
          expect(elements).to.have.length(2);

          var startEventCopy = find(elements, function(element) {
            return is(element, 'bpmn:StartEvent');
          });

          var startEventCopyBo = getBusinessObject(startEventCopy);
          var startEventCopyDi = getDi(startEventCopy);
          var startEventCopyLabel = startEventCopy.label;

          expect(startEventCopyBo).to.exist;
          expect(startEventCopyBo.name).to.equal('hello');

          expect(startEventCopyDi).to.exist;
          expect(startEventCopyLabel).to.exist;

          expect(startEventCopyLabel.di).to.equal(startEventCopyDi);
          expect(startEventCopyLabel.businessObject).to.equal(startEventCopyBo);
        }
      ));


      it('should copy name property', inject(
        function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1'),
              rootElement = canvas.getRootElement();

          copyPaste.copy(startEvent);

          modeling.removeShape(startEvent);

          // when
          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 300,
              y: 300
            }
          });

          // then
          expect(elements).to.have.length(2);

          startEvent = find(elements, function(element) {
            return is(element, 'bpmn:StartEvent');
          });

          var startEventBo = getBusinessObject(startEvent);

          expect(startEventBo.name).to.equal('hello');
        }
      ));


      it('should wire DIs correctly', inject(
        function(canvas, copyPaste, elementRegistry) {

          // given
          var subprcoess = elementRegistry.get('SubProcess_1'),
              rootElement = canvas.getRootElement();

          copyPaste.copy(subprcoess);

          // when
          var elements = copyPaste.paste({
            element: rootElement,
            point: {
              x: 300,
              y: 300
            }
          });

          // then
          var subprocess = elements[0];
          var di = subprocess.di;

          expect(di).to.exist;
          expect(di.bpmnElement).to.exist;
          expect(di.bpmnElement).to.equal(subprocess.businessObject);
        }
      ));

    });


    describe('rules', function() {

      it('should allow copying boundary event without host', inject(function(elementRegistry) {

        var boundaryEvent1 = elementRegistry.get('BoundaryEvent_1'),
            boundaryEvent2 = elementRegistry.get('BoundaryEvent_2');

        // when
        var tree = copy([ boundaryEvent1, boundaryEvent2 ]);

        expect(keys(tree)).to.have.length(1);
      }));

    });

  });


  describe('properties', function() {

    beforeEach(bootstrapModeler(propertiesXML, { modules: testModules }));


    function copyPasteElement(element) {

      return getBpmnJS().invoke(function(canvas, copyPaste, elementRegistry, modeling) {

        // given
        element = elementRegistry.get(element);

        var rootElement = canvas.getRootElement();

        // when
        copyPaste.copy(element);

        modeling.removeShape(element);

        return copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000
          }
        });
      });

    }

    it('should copy and paste non-interrupting boundary event', function() {

      // when
      var elements = copyPasteElement('SubProcess_NonInterrupting');

      var subProcess = find(elements, function(element) {
        return is(element, 'bpmn:SubProcess');
      });

      var boundaryEvent = subProcess.attachers[0],
          boundaryEventBo = getBusinessObject(boundaryEvent);

      // then
      expect(boundaryEventBo.cancelActivity).to.be.false;
    });


    it('should copy and paste interrupting boundary event', function() {

      // when
      var elements = copyPasteElement('SubProcess_Interrupting');

      var subProcess = find(elements, function(element) {
        return is(element, 'bpmn:SubProcess');
      });

      var boundaryEvent = subProcess.attachers[0],
          boundaryEventBo = getBusinessObject(boundaryEvent);

      // then
      expect(boundaryEventBo.cancelActivity).to.be.true;
    });


    it('should copy and paste event sub process', function() {

      // when
      var elements = copyPasteElement('SubProcess_Event');

      var subProcess = find(elements, function(element) {
        return is(element, 'bpmn:SubProcess');
      });

      var subProcessesBo = getBusinessObject(subProcess);

      expect(subProcessesBo.triggeredByEvent).to.be.true;
      expect(subProcessesBo.isExpanded).to.be.true;
    });


    it('should copy and paste transaction', function() {

      // when
      var elements = copyPasteElement('SubProcess_Transaction');

      var transaction = find(elements, function(element) {
        return is(element, 'bpmn:Transaction');
      });

      expect(transaction).to.exist;
    });


    it('should copy and paste group', function() {

      // when
      var elements = copyPasteElement('Group');

      var group = find(elements, function(element) {
        return is(element, 'bpmn:Group');
      });

      var groupBo = getBusinessObject(group);

      expect(groupBo.categoryValueRef).to.exist;
    });

  });


  describe('collaboration', function() {

    beforeEach(bootstrapModeler(collaborationXML, { modules: testModules }));


    describe('integration', function() {

      it('expanded participant', integrationTest('Participant_1'));


      it('collapsed participant', integrationTest('Participant_2'));

    });


    describe('rules', function() {

      it('should NOT allow copying lanes without their parent participant', function() {

        // when
        var tree = copy([ 'Lane_1', 'Lane_2' ]);

        // then
        expect(keys(tree)).to.have.length(0);
      });

    });

  });


  describe('collaboration (multiple)', function() {

    beforeEach(bootstrapModeler(collaborationMultipleXML, { modules: testModules }));


    describe('basics', function() {

      it('should paste onto lane', inject(function(copyPaste, elementRegistry) {

        // given
        var participant = elementRegistry.get('Participant_2'),
            lane = elementRegistry.get('Lane_5'),
            laneBo = getBusinessObject(lane),
            task = elementRegistry.get('Task_1');

        copyPaste.copy(task);

        // when
        copyPaste.paste({
          element: lane,
          point: {
            x: 400,
            y: 450
          }
        });

        // then
        expect(participant.children).to.have.length(7);

        expect(lane.children).to.be.empty;
        expect(laneBo.flowNodeRef).to.have.length(2);
      }));


      it('should paste onto nested lane', inject(function(copyPaste, elementRegistry) {

        // given
        var participant = elementRegistry.get('Participant_1'),
            lane = elementRegistry.get('Lane_3'),
            laneBo = getBusinessObject(lane),
            task = elementRegistry.get('Task_2');

        // when
        copyPaste.copy(task);

        copyPaste.paste({
          element: lane,
          point: {
            x: 450,
            y: 150
          }
        });

        // then
        expect(participant.children).to.have.length(5);

        expect(lane.children).to.be.empty;
        expect(lane.parent.children).to.have.length(2);
        expect(laneBo.flowNodeRef).to.have.length(2);
      }));

    });


    describe('integration', function() {

      it('should copy and paste multiple participants', integrationTest([
        'Participant_1',
        'Participant_2'
      ]));

    });

  });


  describe('participants', function() {

    beforeEach(bootstrapModeler(collaborationAssociationsXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    function expectEqual(copy, original) {
      var originalBo = getBusinessObject(original);
      var copyBo = getBusinessObject(copy);

      expect(originalBo).not.to.equal(copyBo);

      var originalProcessRef = originalBo.processRef;
      var copyProcessRef = copyBo.processRef;

      expect(copyProcessRef).not.to.equal(originalProcessRef);
      expect(copyProcessRef.extensionElements).to.exist;
      expect(copyProcessRef.extensionElements.values).to.have.length(1);
      expect(copyProcessRef.get('flowElements')).to.have.length(originalProcessRef.get('flowElements').length);

      var copyExecutionListener = copyProcessRef.extensionElements.values[0];
      var originalExtensionListener = originalProcessRef.extensionElements.values[0];

      expect(copyExecutionListener.$type).to.equal(originalExtensionListener.$type);
      expect(copyExecutionListener.class).to.equal(originalExtensionListener.class);
      expect(copyExecutionListener.event).to.equal(originalExtensionListener.event);
    }


    it('should copy participant with process', inject(
      function(canvas, copyPaste, elementRegistry) {

        // given
        var participantInput = elementRegistry.get('Participant_Input'),
            participantOutput = elementRegistry.get('Participant_Output'),
            rootElement = canvas.getRootElement();

        // when
        copyPaste.copy([ participantInput, participantOutput ]);

        var elements_1 = copyPaste.paste({
          element: rootElement,
          point: {
            x: 5000,
            y: 5000
          }
        });

        // then
        var participants_1 = elements_1.filter(function(element) {
          return is(element, 'bpmn:Participant');
        });

        expect(participants_1).to.have.length(2);

        expectEqual(participantInput, participants_1[0]);
        expectEqual(participantOutput, participants_1[1]);

        // but when
        // paste second time
        var elements_2 = copyPaste.paste({
          element: rootElement,
          point: {
            x: 7000,
            y: 5000
          }
        });

        // then
        var participants_2 = elements_2.filter(function(element) {
          return is(element, 'bpmn:Participant');
        });

        expect(participants_2).to.have.length(2);

        expectEqual(participants_2[0], participantInput);
        expectEqual(participants_2[1], participantOutput);

        expectEqual(participants_2[0], participants_1[0]);
        expectEqual(participants_2[1], participants_1[1]);
      }
    ));


    it('should copy and paste participant with DataInputAssociation',
      integrationTest('Participant_Input'));


    it('should copy and paste participant with DataOutputAssociation',
      integrationTest('Participant_Output'));

  });


  describe('nested properties', function() {

    beforeEach(bootstrapModeler(copyPropertiesXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('integration', integrationTest('Participant_1'));


    it('should copy user task properties', inject(function(copyPaste, elementRegistry) {

      var participant = elementRegistry.get('Participant_1'),
          task = elementRegistry.get('Task_1'),
          taskBo = getBusinessObject(task);

      // when
      copyPaste.copy(task);

      var elements = copyPaste.paste({
        element: participant,
        point: {
          x: 500,
          y: 50
        }
      });

      // then
      var newTask = find(elements, function(element) {
        return is(element, 'bpmn:Task');
      });

      var newTaskBo = getBusinessObject(newTask);

      expect(newTaskBo.asyncBefore).to.equal(taskBo.asyncBefore);
      expect(newTaskBo.documentation).to.jsonEqual(taskBo.documentation);
      expect(newTaskBo.extensionElements).to.jsonEqual(taskBo.extensionElements);
    }));

  });


  describe('event based gateway', function() {

    beforeEach(bootstrapModeler(eventBasedGatewayXML, {
      modules: testModules
    }));


    it('should copy and paste event based gateway connected to an event', integrationTest([
      'EventBasedGateway_1',
      'IntermediateCatchEvent_1'
    ]));
  });


  describe('collapsed sub-process', function() {

    beforeEach(bootstrapModeler(collapsedSubprocessXML, {
      modules: testModules
    }));


    it('should paste with children', inject(
      function(copyPaste, elementRegistry, modeling, bpmnjs) {

        // given
        var subProcess = elementRegistry.get('SUB_PROCESS'),
            root = elementRegistry.get('PROCESS'),
            definitions = bpmnjs.getDefinitions();

        // when
        copyPaste.copy(subProcess);

        modeling.removeElements([ subProcess ]);

        var pastedElements = copyPaste.paste({
          element: root,
          point: {
            x: 500,
            y: 50
          }
        });

        // then
        // elements pasted with original IDs
        forEach([ 'SUB_PROCESS', 'SUB_TASK', 'SUB_BOUNDARY' ], function(id) {

          var el = find(pastedElements, function(el) {
            return el.id === id;
          });

          expect(el, 'element <' + id + '>').to.exist;
        });

        // referenced root element exists only once
        var escalations = definitions.get('rootElements').filter(function(el) {
          return el.$type === 'bpmn:Escalation';
        });

        expect(escalations).to.have.length(1);
      }
    ));

  });


  describe('complex', function() {

    beforeEach(bootstrapModeler(complexXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should mark as changed', inject(
      function(canvas, eventBus, copyPaste, elementRegistry, commandStack) {

        // given
        var participant = elementRegistry.get('sid-187453C6-5AB5-4A6D-9A62-BF537E04EA0D'),
            rootElement = canvas.getRootElement();

        var changedSpy = sinon.spy(function(event) {
          expect(event.elements).to.have.length(56);
        });

        // when
        eventBus.on('elements.changed', changedSpy);

        copyPaste.copy([ participant ]);

        copyPaste.paste({
          element: rootElement,
          point: {
            x: 800,
            y: 300
          }
        });

        commandStack.undo();
        commandStack.redo();

        // then
        expect(changedSpy).to.have.been.calledThrice;
      }
    ));

  });

});


// helpers //////////

/**
 * Integration test involving copying, pasting, moving, undoing and redoing.
 *
 * @param {string|string[]} elementIds
 */
function integrationTest(elementIds) {
  if (!isArray(elementIds)) {
    elementIds = [ elementIds ];
  }

  return function() {

    getBpmnJS().invoke(function(canvas, commandStack, copyPaste, elementRegistry, modeling) {

      // given
      var allElements = elementRegistry.getAll();

      var initialContext = {
            length: allElements.length,
            ids: getPropertyForElements(allElements, 'id'),
            types: getPropertyForElements(allElements, 'type')
          },
          currentContext;

      var elements = map(elementIds, function(elementId) {
        return elementRegistry.get(elementId);
      });

      // (1) copy elements
      copyPaste.copy(elements);

      // (2) remove elements
      modeling.removeElements(elements);

      var rootElement = canvas.getRootElement();

      // (3) paste elements
      copyPaste.paste({
        element: rootElement,
        point: {
          x: 500,
          y: 500
        }
      });

      // (4) move all elements except root
      modeling.moveElements(elementRegistry.filter(element => !isRoot(element)), { x: 50, y: -50 });

      // when
      // (5) undo moving, pasting and removing
      commandStack.undo();
      commandStack.undo();
      commandStack.undo();

      elements = elementRegistry.getAll();

      currentContext = {
        length: elements.length,
        ids: getPropertyForElements(elements, 'id')
      };

      // then
      expect(initialContext.length).to.equal(currentContext.length);
      expectCollection(initialContext.ids, currentContext.ids, true);

      // when
      // (6) redo removing, pasting and moving
      commandStack.redo();
      commandStack.redo();
      commandStack.redo();

      elements = elementRegistry.getAll();

      currentContext = {
        length: elements.length,
        ids: getPropertyForElements(elements, 'id'),
        types: getPropertyForElements(elements, 'type')
      };

      // then
      expect(initialContext.length).to.equal(currentContext.length);
      expectCollection(initialContext.ids, currentContext.ids, false);
      expectCollection(initialContext.types, currentContext.types, true);
    });

  };
}

function getPropertyForElements(elements, property) {
  return map(elements, function(element) {
    return element[ property ];
  });
}

function expectCollection(collection1, collection2, contains) {
  expect(collection1).to.have.length(collection2.length);

  forEach(collection2, function(element) {
    if (!element.parent) {
      return;
    }

    if (contains) {
      expect(collection1).to.contain(element);
    } else {
      expect(collection1).not.to.contain(element);
    }
  });
}

function getAllElementsInTree(tree, depth) {
  var depths;

  if (isNumber(depth)) {
    depths = pick(tree, [ depth ]);
  } else {
    depths = tree;
  }

  return reduce(depths, function(allElements, depth) {
    return allElements.concat(depth);
  }, []);
}

function findDescriptorInTree(elements, tree, depth) {
  var foundDescriptors = _findDescriptorsInTree(elements, tree, depth);

  if (foundDescriptors.length !== 1) {
    return false;
  }

  return foundDescriptors[0];
}

function _findDescriptorsInTree(elements, tree, depth) {
  if (!isArray(elements)) {
    elements = [ elements ];
  }

  var depths;

  if (isNumber(depth)) {
    depths = pick(tree, [ depth ]);
  } else {
    depths = tree;
  }

  return reduce(elements, function(foundDescriptors, element) {
    var foundDescriptor = reduce(depths, function(foundDescriptor, depth) {
      return foundDescriptor || find(depth, function(descriptor) {
        return element === descriptor.id || element.id === descriptor.id;
      });
    });

    if (foundDescriptor) {
      return foundDescriptors.concat(foundDescriptor);
    }

    return foundDescriptors;
  }, []);
}

/**
 * Copy elements.
 *
 * @param {(string|Element)[]} elements
 *
 * @return {Object}
 */
function copy(elements) {
  if (!isArray(elements)) {
    elements = [ elements ];
  }

  return getBpmnJS().invoke(function(copyPaste, elementRegistry) {

    elements = elements.map(function(element) {
      element = elementRegistry.get(element.id || element);

      expect(element).to.exist;

      return element;
    });

    return copyPaste.copy(elements);
  });
}
