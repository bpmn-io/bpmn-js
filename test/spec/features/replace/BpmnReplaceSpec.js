import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  assign,
  pick
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import moveModule from 'diagram-js/lib/features/move';
import coreModule from 'lib/core';

import camundaModdleModule from 'camunda-bpmn-moddle/lib';
import camundaPackage from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  is
} from 'lib/util/ModelUtil';

import {
  isExpanded,
  isInterrupting,
  isEventSubProcess,
  hasErrorEventDefinition
} from 'lib/util/DiUtil';


describe('features/replace - bpmn replace', function() {

  var testModules = [
    camundaModdleModule,
    coreModule,
    modelingModule,
    moveModule,
    replaceModule
  ];


  describe('should replace', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('task', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var businessObject = newElement.businessObject;

      expect(newElement).to.exist;
      expect(is(businessObject, 'bpmn:UserTask')).to.be.true;
    }));


    it('gateway', inject(function(elementRegistry, bpmnReplace) {

      // given
      var gateway = elementRegistry.get('ExclusiveGateway_1');
      var newElementData = {
        type: 'bpmn:InclusiveGateway'
      };

      // when
      var newElement = bpmnReplace.replaceElement(gateway, newElementData);


      // then
      var businessObject = newElement.businessObject;

      expect(newElement).to.exist;
      expect(is(businessObject, 'bpmn:InclusiveGateway')).to.be.true;
    }));


    it('expanded sub process', inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

      // given
      var subProcess = elementRegistry.get('SubProcess_1'),
          newElementData = {
            type: 'bpmn:Transaction',
            isExpanded: true
          };

      // when
      var newElement = bpmnReplace.replaceElement(subProcess, newElementData);

      // then
      expect(newElement).to.exist;
      expect(is(newElement.businessObject, 'bpmn:Transaction')).to.be.true;

    }));


    it('transaction', inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

      // given
      var transaction = elementRegistry.get('Transaction_1'),
          newElementData = {
            type: 'bpmn:SubProcess',
            isExpanded: true
          };

      // when
      var newElement = bpmnReplace.replaceElement(transaction, newElementData);

      // then
      expect(newElement).to.exist;
      expect(is(newElement.businessObject, 'bpmn:SubProcess')).to.be.true;

    }));


    it('event sub process', inject(function(elementRegistry, bpmnReplace) {

      // given
      var transaction = elementRegistry.get('SubProcess_1'),
          newElementData = {
            type: 'bpmn:SubProcess',
            triggeredByEvent: true
          };

      // when
      var newElement = bpmnReplace.replaceElement(transaction, newElementData);

      // then
      expect(newElement).to.exist;
      expect(isEventSubProcess(newElement)).to.be.true;

    }));


    describe('boundary event', function() {

      it('<non-interrupting> with <interrupting>',
        inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              boundaryBo = boundaryEvent.businessObject,
              newElementData = {
                type: 'bpmn:BoundaryEvent',
                eventDefinitionType: 'bpmn:TimerEventDefinition'
              };

          var eventDefinitions = boundaryBo.eventDefinitions.slice();

          // when
          var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);
          var newBo = newElement.businessObject;

          // then
          expect(newElement).to.exist;

          expect(is(newBo, 'bpmn:BoundaryEvent')).to.be.true;

          expect(newBo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);

          expect(newBo.cancelActivity).to.be.true;
        })
      );


      it('<interrupting> with <non-interrupting>',
        inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_2'),
              boundaryBo = boundaryEvent.businessObject,
              newElementData = {
                type: 'bpmn:BoundaryEvent',
                eventDefinitionType: 'bpmn:ConditionalEventDefinition',
                cancelActivity: false
              };

          var eventDefinitions = boundaryBo.eventDefinitions.slice();

          // when
          var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);
          var newBo = newElement.businessObject;

          // then
          expect(newElement).to.exist;

          expect(is(newBo, 'bpmn:BoundaryEvent')).to.be.true;

          expect(newBo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);

          expect(newBo.cancelActivity).to.be.false;
        })
      );


      it('<timer> with <signal>',
        inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              newElementData = {
                type: 'bpmn:BoundaryEvent',
                eventDefinitionType: 'bpmn:SignalEventDefinition',
                cancelActivity: false
              };

          // when
          var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

          var newBo = newElement.businessObject;
          var newEventDefinitions = newBo.eventDefinitions;
          var newEventDefinition = newEventDefinitions[0];

          // then
          expect(newElement).to.exist;
          expect(newEventDefinitions).to.have.length(1);

          expect(is(newBo, 'bpmn:BoundaryEvent')).to.be.true;
          expect(is(newEventDefinition, 'bpmn:SignalEventDefinition')).to.be.true;

          expect(newBo.cancelActivity).to.be.false;
        })
      );


      it('<conditional> with <timer>',
        inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_2'),
              newElementData = {
                type: 'bpmn:BoundaryEvent',
                eventDefinitionType: 'bpmn:TimerEventDefinition'
              };

          // when
          var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

          var newBo = newElement.businessObject;
          var newEventDefinitions = newBo.eventDefinitions;
          var newEventDefinition = newEventDefinitions[0];

          // then
          expect(newElement).to.exist;
          expect(newEventDefinitions).to.have.length(1);

          expect(is(newBo, 'bpmn:BoundaryEvent')).to.be.true;
          expect(is(newEventDefinition, 'bpmn:TimerEventDefinition')).to.be.true;

          expect(newBo.cancelActivity).to.be.true;
        })
      );


      it('updating host',
        inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
              host = elementRegistry.get('Task_1'),
              newElementData = {
                type: 'bpmn:BoundaryEvent',
                eventDefinitionType: 'bpmn:ErrorEventDefinition'
              };

          // when
          var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

          // then
          expect(newElement.host).to.exist;
          expect(newElement.host).to.eql(host);
        })
      );

    });

  });


  describe('should replace in collaboration', function() {

    var diagramXML = require('./BpmnReplace.collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('expanded with collapsed pool', inject(function(elementRegistry, bpmnReplace) {

      // given
      var shape = elementRegistry.get('Participant_1');

      var messageFlow = elementRegistry.get('MessageFlow_B_to_A');

      var collapsedBounds = assign({}, getBounds(shape), { height: 60 });

      // when
      var newShape = bpmnReplace.replaceElement(shape, {
        type: 'bpmn:Participant',
        isExpanded: false
      });

      // then
      expect(isExpanded(newShape)).to.be.false; // collapsed
      expect(newShape.children).to.be.empty;

      expect(newShape).to.have.bounds(collapsedBounds);

      expect(messageFlow).to.have.waypoints([
        { x: 368, y: 436 },
        { x: 368, y: newShape.y + collapsedBounds.height }
      ]);
    }));


    it('collapsed with expanded pool', inject(function(elementRegistry, bpmnReplace) {

      // given
      var shape = elementRegistry.get('Participant_2');

      var expandedBounds = assign({}, getBounds(shape), { height: 250 });

      // when
      var newShape = bpmnReplace.replaceElement(shape, {
        type: 'bpmn:Participant',
        isExpanded: true
      });

      // then
      expect(isExpanded(newShape)).to.be.true; // expanded
      expect(newShape.children).to.be.empty;

      expect(newShape).to.have.bounds(expandedBounds);
    }));

  });


  describe('should collapse pool, removing message flows', function() {

    var diagramXML = require('./BpmnReplace.poolMessageFlows.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('expanded with collapsed pool', inject(function(elementRegistry, bpmnReplace) {

      // given
      var shape = elementRegistry.get('Participant_1');

      // when
      var newShape = bpmnReplace.replaceElement(shape, {
        type: 'bpmn:Participant',
        isExpanded: false
      });

      // then
      expect(isExpanded(newShape)).to.be.false; // collapsed
      expect(newShape.children).to.be.empty;

      expect(elementRegistry.get('MessageFlow_1')).not.to.exist;
      expect(elementRegistry.get('MessageFlow_2')).not.to.exist;
    }));

  });


  describe('should replace with data objects', function() {

    var diagramXML = require('./BpmnReplace.dataObjects.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('restoring dataAssociations', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task');

      // when
      var serviceTask = bpmnReplace.replaceElement(task, { type: 'bpmn:ServiceTask' });
      var bo = serviceTask.businessObject;

      // then
      // expect one incoming connection
      expect(serviceTask.incoming).to.have.length(1);

      var inputAssociations = bo.dataInputAssociations;
      expect(inputAssociations).to.have.length(1);

      var inputAssociation = inputAssociations[0];

      // expect input association references __target_ref_placeholder property
      expect(inputAssociation.targetRef).to.equal(bo.properties[0]);

      // ...and
      // expect one outgoing connection
      expect(serviceTask.outgoing).to.have.length(1);

      var outputAssociations = bo.dataOutputAssociations;
      expect(outputAssociations).to.have.length(1);

    }));

  });


  describe('position and size', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should keep position', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.x).to.equal(task.x);
      expect(newElement.y).to.equal(task.y);
    }));


    it('should keep label position', inject(function(elementRegistry, bpmnReplace, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');
      var label = elementRegistry.get('StartEvent_1_label');

      var newElementData = {
        type: 'bpmn:EndEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(startEvent, newElementData);

      // then
      expect(newElement.label.x).to.equal(label.x);
      expect(newElement.label.y).to.equal(label.y);
    }));

  });


  describe('selection', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should select after replace',
      inject(function(elementRegistry, selection, bpmnReplace) {

        // given
        var task = elementRegistry.get('Task_1');
        var newElementData = {
          type: 'bpmn:UserTask'
        };

        // when
        var newElement = bpmnReplace.replaceElement(task, newElementData);

        // then
        expect(selection.get()).to.include(newElement);
      })
    );

  });


  describe('label', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));

    it('should keep internal labels',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var task = elementRegistry.get('Task_1');

        var newElementData = {
          type: 'bpmn:UserTask'
        };

        // when
        var newElement = bpmnReplace.replaceElement(task, newElementData);

        // then
        expect(newElement.businessObject.name).to.equal('Task Caption');
      })
    );


    it('should keep external labels',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        var newElementData = {
          type: 'bpmn:EndEvent'
        };

        // when
        var newElement = bpmnReplace.replaceElement(startEvent, newElementData);

        // then
        expect(newElement.label.labelTarget).to.equal(newElement);
        expect(newElement.businessObject.name).to.equal('KEEP ME');
      })
    );

  });


  describe('undo support', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should undo', inject(function(elementRegistry, bpmnReplace, commandStack) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:UserTask'
      };

      bpmnReplace.replaceElement(task, newElementData);

      // when
      commandStack.undo();

      // then
      var target = elementRegistry.get('Task_1'),
          businessObject = target.businessObject;

      expect(target).to.exist;
      expect(is(businessObject, 'bpmn:Task')).to.be.true;
    }));


    it('should redo', inject(function(elementRegistry, bpmnReplace, commandStack) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:UserTask'
      };
      var newElementData2 = {
        type: 'bpmn:ServiceTask'
      };

      var usertask = bpmnReplace.replaceElement(task, newElementData);
      var servicetask = bpmnReplace.replaceElement(usertask, newElementData2);

      commandStack.undo();
      commandStack.undo();

      // when
      commandStack.redo();
      commandStack.redo();

      // then
      var businessObject = servicetask.businessObject;

      expect(servicetask).to.exist;
      expect(is(businessObject, 'bpmn:ServiceTask')).to.be.true;
    }));

  });


  describe('connection handling', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should reconnect valid', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var incoming = newElement.incoming[0],
          outgoing = newElement.outgoing[0],
          source = incoming.source,
          target = outgoing.target;

      expect(incoming).to.exist;
      expect(outgoing).to.exist;
      expect(source).to.eql(elementRegistry.get('StartEvent_1'));
      expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
    }));


    it('should remove invalid (incoming)', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('StartEvent_1');
      var newElementData = {
        type: 'bpmn:EndEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.incoming).to.be.empty;
    }));


    it('should remove invalid (outgoing)', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('EndEvent_1');
      var newElementData = {
        type: 'bpmn:StartEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.outgoing).to.be.empty;
    }));


    describe('undo support', function() {

      it('should reconnect valid', inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var task = elementRegistry.get('Task_1');
        var newElementData = {
          type: 'bpmn:UserTask'
        };

        bpmnReplace.replaceElement(task, newElementData);

        // when
        commandStack.undo();

        // then
        var newTask = elementRegistry.get('Task_1');
        var incoming = newTask.incoming[0],
            outgoing = newTask.outgoing[0],
            source = incoming.source,
            target = outgoing.target;

        expect(incoming).to.exist;
        expect(outgoing).to.exist;
        expect(source).to.eql(elementRegistry.get('StartEvent_1'));
        expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
      }));


      it('should remove invalid (invalid)',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1');
          var newElementData = {
            type: 'bpmn:EndEvent'
          };

          bpmnReplace.replaceElement(startEvent, newElementData);

          // when
          commandStack.undo();

          // then
          var newEvent = elementRegistry.get('StartEvent_1');
          var incoming = newEvent.incoming[0],
              outgoing = newEvent.outgoing[0],
              target = outgoing.target;


          expect(incoming).not.to.exist;
          expect(outgoing).to.exist;
          expect(target).to.eql(elementRegistry.get('Task_1'));
        })
      );


      it('should remove invalid outgoing connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var endEvent = elementRegistry.get('EndEvent_1');
          var newElementData = {
            type: 'bpmn:StartEvent'
          };

          bpmnReplace.replaceElement(endEvent, newElementData);

          // when
          commandStack.undo();

          // then
          var newEvent = elementRegistry.get('EndEvent_1');
          var incoming = newEvent.incoming[0],
              outgoing = newEvent.outgoing[0],
              source = incoming.source;

          expect(incoming).to.exist;
          expect(outgoing).not.to.exist;
          expect(source).to.eql(elementRegistry.get('Transaction_1'));
        })
      );

    });


    describe('redo support', function() {

      it('should reconnect valid connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var task = elementRegistry.get('Task_1');
          var newElementData = {
            type: 'bpmn:UserTask'
          };
          var newElement = bpmnReplace.replaceElement(task, newElementData);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var incoming = newElement.incoming[0],
              outgoing = newElement.outgoing[0],
              source = incoming.source,
              target = outgoing.target;


          expect(incoming).to.exist;
          expect(outgoing).to.exist;
          expect(source).to.eql(elementRegistry.get('StartEvent_1'));
          expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
        })
      );


      it('should remove invalid incoming connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1');
          var newElementData = {
            type: 'bpmn:EndEvent'
          };
          var newElement = bpmnReplace.replaceElement(startEvent, newElementData);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var incoming = newElement.incoming[0],
              outgoing = newElement.outgoing[0];


          expect(incoming).not.to.exist;
          expect(outgoing).not.to.exist;
        })
      );


      it('should remove invalid outgoing connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var endEvent = elementRegistry.get('EndEvent_1');
          var newElementData = {
            type: 'bpmn:StartEvent'
          };
          var newElement = bpmnReplace.replaceElement(endEvent, newElementData);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var incoming = newElement.incoming[0],
              outgoing = newElement.outgoing[0];


          expect(incoming).not.to.exist;
          expect(outgoing).not.to.exist;
        })
      );

    });

  });


  describe('children handling', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should update bpmn containment properly', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1');
      var startEventShape = elementRegistry.get('StartEvent_2');
      var taskShape = elementRegistry.get('Task_2');
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_4');

      var transactionShapeData = {
        type: 'bpmn:Transaction'
      };

      // when
      var transactionShape = bpmnReplace.replaceElement(subProcessShape, transactionShapeData);

      // then
      var subProcess = subProcessShape.businessObject,
          transaction = transactionShape.businessObject;

      var transactionChildren = transaction.get('flowElements');
      var subProcessChildren = subProcess.get('flowElements');

      expect(transactionChildren).to.include(startEventShape.businessObject);
      expect(transactionChildren).to.include(taskShape.businessObject);
      expect(transactionChildren).to.include(sequenceFlowConnection.businessObject);

      expect(subProcessChildren).not.to.include(startEventShape.businessObject);
      expect(subProcessChildren).not.to.include(taskShape.businessObject);
      expect(subProcessChildren).not.to.include(sequenceFlowConnection.businessObject);
    }));

  });


  describe('sub processes', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should allow morphing expanded into expanded ad hoc',
      inject(function(bpmnReplace, elementRegistry) {

        // given
        var element = elementRegistry.get('SubProcess_1');
        var newElementData = {
          type: 'bpmn:AdHocSubProcess'
        };

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:AdHocSubProcess')).to.be.true;
        expect(isExpanded(newElement)).to.be.true;
      })
    );


    it('should allow morphing expanded ad hoc into expanded',
      inject(function(bpmnReplace, elementRegistry) {

        // given
        var element = elementRegistry.get('AdHocSubProcessExpanded');
        var newElementData = {
          type: 'bpmn:SubProcess'
        };

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:SubProcess')).to.be.true;
        expect(is(newElement, 'bpmn:AdHocSubProcess')).to.be.false;
        expect(isExpanded(newElement)).to.be.true;
      })
    );


    it('should allow morphing collapsed into collapsed ad hoc',
      inject(function(bpmnReplace, elementRegistry) {

        // given
        var element = elementRegistry.get('SubProcessCollapsed');
        var newElementData = {
          type: 'bpmn:AdHocSubProcess'
        };

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:AdHocSubProcess')).to.be.true;
        expect(isExpanded(newElement)).not.to.be.true;
      })
    );


    it('should allow morphing collapsed ad hoc into collapsed',
      inject(function(bpmnReplace, elementRegistry) {

        // given
        var element = elementRegistry.get('AdHocSubProcessCollapsed');
        var newElementData = {
          type: 'bpmn:SubProcess'
        };

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:SubProcess')).to.be.true;
        expect(is(newElement, 'bpmn:AdHocSubProcess')).to.be.false;
        expect(isExpanded(newElement)).not.to.be.true;
      })
    );


    it('should keep size when morphing ad hoc',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var element = elementRegistry.get('SubProcess_1');
        var newElementData = {
          type: 'bpmn:AdHocSubProcess'
        };

        var width = element.width,
            height = element.height;

        modeling.resizeShape(element, {
          x: element.x,
          y: element.y,
          width: width + 20,
          height: height + 20
        });

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:AdHocSubProcess')).to.be.true;
        expect(isExpanded(newElement)).to.be.true;

        expect(newElement.width).to.equal(width + 20);
        expect(newElement.height).to.equal(height + 20);
      })
    );


    it('should remove children of collapsed sub process not morphing into expanded',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var element = elementRegistry.get('SubProcess_1');
        var newElementData = {
          type: 'bpmn:CallActivity'
        };

        modeling.toggleCollapse(element);

        // when
        var newElement = bpmnReplace.replaceElement(element, newElementData);

        // then
        expect(is(newElement, 'bpmn:CallActivity')).to.be.true;
      }));

  });


  describe('morph task with boundaryEvent', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('to expanded sub process', inject(function(bpmnReplace, elementRegistry) {

      // given
      var element = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:SubProcess',
        isExpanded: true
      };

      // when
      var newElement = bpmnReplace.replaceElement(element, newElementData);

      // then
      expect(is(newElement, 'bpmn:SubProcess')).to.be.true;
      expect(isExpanded(newElement)).to.be.true;

      // and keep boundaryEvent
      expect(newElement.attachers.length).to.be.equal(2);
    }));


    it('to collapsed sub process', inject(function(bpmnReplace, elementRegistry) {

      // given
      var element = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:SubProcess',
        isExpanded: false
      };

      // when
      var newElement = bpmnReplace.replaceElement(element, newElementData);

      // then
      expect(is(newElement, 'bpmn:SubProcess')).to.be.true;
      expect(isExpanded(newElement)).to.be.false;

      // and keep boundaryEvent
      expect(newElement.attachers.length).to.eql(2);
    }));

  });


  describe('compensation activity', function() {

    var diagramXML = require('./BpmnReplace.compensation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should keep isForCompensation attr', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
        type: 'bpmn:ServiceTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.isForCompensation).to.be.true;
    }));

  });


  describe('event sub processes', function() {

    var diagramXML = require('./BpmnReplace.eventSubProcesses.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should remove connections',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var transaction = elementRegistry.get('SubProcess_1');
        var newElementData = {
          type: 'bpmn:SubProcess',
          triggeredByEvent: true
        };

        // when
        var newElement = bpmnReplace.replaceElement(transaction, newElementData);

        // then
        var incoming = newElement.incoming[0],
            outgoing = newElement.outgoing[0];

        expect(incoming).not.to.exist;
        expect(outgoing).not.to.exist;
      })
    );


    it('should replace non-interrupting start event after moving it outside event sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_2'),
            root = elementRegistry.get('Process_1');

        // when
        modeling.moveElements([startEvent], { x: 0, y: 200 }, root);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === root;
        })[0];

        // then
        expect(isInterrupting(startEventAfter)).to.be.true;
        expect(startEventAfter.parent).to.equal(root);

      })
    );


    it('should replace non-interrupting start event after moving it to a regular sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_2'),
            subProcess = elementRegistry.get('SubProcess_1');

        // when
        modeling.moveElements([startEvent], { x: 260, y: 60 }, subProcess);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === subProcess;
        })[0];

        // then
        expect(isInterrupting(startEventAfter)).to.be.true;
        expect(startEventAfter.parent).to.equal(subProcess);

      })
    );


    it('should not replace non-interrupting start event after moving it to another event sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_2'),
            subProcess = elementRegistry.get('SubProcess_1');

        var eventSubProcess = bpmnReplace.replaceElement(subProcess, {
          type: 'bpmn:SubProcess',
          triggeredByEvent: true,
          isExpanded: true
        });

        // when
        modeling.moveElements([startEvent], { x: 260, y: 60 }, eventSubProcess);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === eventSubProcess && element.type !== 'label';
        })[1];

        // then
        expect(startEvent.id).to.equal(startEventAfter.id);
        expect(startEventAfter.parent).to.equal(eventSubProcess);

      })
    );


    it('should not replace interrupting start event after moving it outside event sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_2'),
            root = elementRegistry.get('Process_1');

        var interruptingStartEvent = bpmnReplace.replaceElement(startEvent, { type: 'bpmn:StartEvent' });

        // when
        modeling.moveElements([interruptingStartEvent], { x: 0, y: 200 }, root);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent')
            && element.type !== 'label'
            && element.parent === root;
        })[0];

        // then
        expect(startEventAfter).to.equal(interruptingStartEvent);
        expect(startEventAfter.parent).to.equal(root);

      })
    );


    it('should replace non-interrupting start event when replacing parent event sub process',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var eventSubProcess = elementRegistry.get('SubProcess_2');

        // when
        var subProcess = bpmnReplace.replaceElement(eventSubProcess, { type: 'bpmn:SubProcess' });

        // then
        var replacedStartEvent = elementRegistry.filter(function(element) {
          return (element.parent === subProcess && element.type !== 'label');
        })[0];

        expect(isInterrupting(replacedStartEvent)).to.be.true;
        expect(replacedStartEvent.parent).to.equal(subProcess);
      })
    );


    it('should not replace non-interrupting start event when moving parent event sub process',
      inject(function(elementRegistry, bpmnReplace, modeling) {

        // given
        var eventSubProcess = elementRegistry.get('SubProcess_2'),
            startEvent = elementRegistry.get('StartEvent_2');

        // when
        modeling.moveElements([eventSubProcess], { x: 20, y: 30 });

        // start event after moving parent
        var startEventAfter = elementRegistry.filter(function(element) {
          return (element.parent === eventSubProcess && element.type !== 'label');
        })[0];

        // then
        expect(startEventAfter).to.equal(startEvent);
        expect(startEventAfter.parent).to.eql(eventSubProcess);
      })
    );

    it('should replace error start event after moving it outside event sub process',
      inject(function(elementRegistry, bpmnReplace, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_3'),
            root = elementRegistry.get('Process_1');

        // when
        modeling.moveElements([startEvent], { x: 0, y: 200 }, root);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === root;
        })[0];

        // then
        expect(hasErrorEventDefinition(startEventAfter)).to.be.false;
        expect(startEventAfter.parent).to.equal(root);
      })
    );

    it('should replace error start event after moving it to a regular sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_3'),
            subProcess = elementRegistry.get('SubProcess_1');

        // when
        modeling.moveElements([startEvent], { x: 260, y: 60 }, subProcess);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === subProcess;
        })[0];

        // then
        expect(hasErrorEventDefinition(startEventAfter)).to.be.false;
        expect(startEventAfter.parent).to.equal(subProcess);

      })
    );

    it('should not replace error start event after moving it to another event sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_3'),
            subProcess = elementRegistry.get('SubProcess_1');

        var eventSubProcess = bpmnReplace.replaceElement(subProcess, {
          type: 'bpmn:SubProcess',
          triggeredByEvent: true,
          isExpanded: true
        });

        // when
        modeling.moveElements([startEvent], { x: 260, y: 60 }, eventSubProcess);

        var startEventAfter = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:StartEvent') && element.parent === eventSubProcess && element.type !== 'label';
        })[1];

        // then
        expect(hasErrorEventDefinition(startEventAfter)).to.be.true;
        expect(startEventAfter.parent).to.equal(eventSubProcess);

      })
    );

    it('should replace error start event when replacing parent event sub process',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var eventSubProcess = elementRegistry.get('SubProcess_3');

        // when
        var subProcess = bpmnReplace.replaceElement(eventSubProcess, { type: 'bpmn:SubProcess' });

        // then
        var replacedStartEvent = elementRegistry.filter(function(element) {
          return (element.parent === subProcess && element.type !== 'label');
        })[0];

        expect(hasErrorEventDefinition(replacedStartEvent)).to.be.false;
        expect(replacedStartEvent.parent).to.equal(subProcess);
      })
    );


    it('should not replace error start event when moving parent event sub process',
      inject(function(elementRegistry, bpmnReplace, modeling) {

        // given
        var eventSubProcess = elementRegistry.get('SubProcess_3'),
            startEvent = elementRegistry.get('StartEvent_3');

        // when
        modeling.moveElements([eventSubProcess], { x: 20, y: 30 });

        // start event after moving parent
        var startEventAfter = elementRegistry.filter(function(element) {
          return (element.parent === eventSubProcess && element.type !== 'label');
        })[0];

        // then
        expect(startEventAfter).to.equal(startEvent);
        expect(startEventAfter.parent).to.eql(eventSubProcess);
      })
    );

  });


  describe('events', function() {

    var diagramXML = require('../../../fixtures/bpmn/basic.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));


    it('should properly set parent of event definitions', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        var messageEvent = bpmnReplace.replaceElement(startEvent, {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });

        var parent = messageEvent.businessObject.eventDefinitions[0].$parent;

        expect(parent).to.exist;
        expect(parent).to.equal(messageEvent.businessObject);
      })
    );


    it('should add condition with ConditionalEventDefinition', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        // when
        var messageEvent = bpmnReplace.replaceElement(startEvent, {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:ConditionalEventDefinition'
        });

        var definition = messageEvent.businessObject.eventDefinitions[0];

        // then
        expect(definition.condition).to.exist;
      })
    );


    it('should set host for boundary event if provided',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');

        // when
        var boundaryEvent = bpmnReplace.replaceElement(startEvent, {
          type: 'bpmn:BoundaryEvent',
          host: task
        });

        // then
        expect(boundaryEvent).to.exist;
        expect(boundaryEvent).to.have.property('host', task);
        expect(task).to.have.property('attachers');
        expect(task.attachers).to.deep.eql([ boundaryEvent ]);
      })
    );

  });


  describe('properties', function() {
    var copyPropertiesXML = require('../../../fixtures/bpmn/features/replace/copy-properties.bpmn');

    beforeEach(bootstrapModeler(copyPropertiesXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));

    it('should copy properties', inject(function(bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('Task_1');

      var newElementData = {
        type: 'bpmn:ServiceTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var businessObject = newElement.businessObject;

      expect(businessObject.asyncBefore).to.be.true;
      expect(businessObject.jobPriority).to.equal('100');

      var documentation = businessObject.documentation;

      expect(documentation).to.have.length(1);
      expect(documentation[0]).to.exist;
      expect(documentation[0].text).to.equal('hello world');

      var extensionElements = businessObject.extensionElements;

      expect(extensionElements.values).to.have.length(4);

      var inputOutput = extensionElements.values[0],
          properties = extensionElements.values[1],
          executionListener = extensionElements.values[2],
          retryCycle = extensionElements.values[3];

      expect(is(inputOutput, 'camunda:InputOutput')).to.be.true;

      expect(is(inputOutput.inputParameters[0], 'camunda:InputParameter')).to.be.true;
      expect(inputOutput.inputParameters[0].name).to.equal('Input_1');
      expect(inputOutput.inputParameters[0].value).to.equal('foo');

      expect(is(inputOutput.outputParameters[0], 'camunda:OutputParameter')).to.be.true;
      expect(inputOutput.outputParameters[0].name).to.equal('Output_1');
      expect(inputOutput.outputParameters[0].value).to.equal('bar');

      expect(is(properties, 'camunda:Properties')).to.be.true;

      expect(is(properties.values[0], 'camunda:Property')).to.be.true;
      expect(properties.values[0].name).to.equal('bar');
      expect(properties.values[0].value).to.equal('foo');

      expect(is(executionListener, 'camunda:ExecutionListener')).to.be.true;

      expect(executionListener.class).to.equal('reallyClassy');
      expect(executionListener.event).to.equal('start');

      expect(is(retryCycle, 'camunda:FailedJobRetryTimeCycle')).to.be.true;

      expect(retryCycle.body).to.equal('10');
    }));

  });


  describe('colors', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should maintain colors', inject(function(elementRegistry, bpmnReplace, modeling) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData = {
            type: 'bpmn:UserTask'
          },
          fill = 'red',
          stroke = 'green';

      modeling.setColor(task, { fill: fill, stroke: stroke });

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var businessObject = newElement.businessObject;

      expect(businessObject.di.fill).to.equal(fill);
      expect(businessObject.di.stroke).to.equal(stroke);
    }));

  });

});


// helpers ////////////////////////

function skipId(key, value) {

  if (key === 'id') {
    return;
  }

  return value;
}

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}