'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    moveModule = require('diagram-js/lib/features/move'),
    coreModule = require('../../../../lib/core');

var is = require('../../../../lib/util/ModelUtil').is,
    isExpanded = require('../../../../lib/util/DiUtil').isExpanded,
    isInterrupting = require('../../../../lib/util/DiUtil').isInterrupting,
    isEventSubProcess = require('../../../../lib/util/DiUtil').isEventSubProcess;


describe('features/replace - bpmn replace', function() {

  var testModules = [ coreModule, modelingModule, replaceModule, moveModule ];

  describe('should replace', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('task', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
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
      var newElementData =  {
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


    it('non interrupting boundary event by interrupting boundary event',
      inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          newElementData = {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:EscalationEventDefinition'
          };

      // when
      var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

      // then
      expect(newElement).to.exist;
      expect(is(newElement.businessObject, 'bpmn:BoundaryEvent')).to.be.true;
      expect(newElement.businessObject.eventDefinitions[0].$type).to.equal('bpmn:EscalationEventDefinition');
      expect(newElement.businessObject.cancelActivity).to.be.true;
    }));


    it('interrupting boundary event by non interrupting boundary event',
      inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_2'),
          newElementData = {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:SignalEventDefinition',
            cancelActivity: false
          };

      // when
      var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

      // then
      expect(newElement).to.exist;
      expect(is(newElement, 'bpmn:BoundaryEvent')).to.be.true;
      expect(newElement.businessObject.eventDefinitions[0].$type).to.equal('bpmn:SignalEventDefinition');
      expect(newElement.businessObject.cancelActivity).to.be.false;
    }));


    it('boundary event and update host',
      inject(function(elementRegistry, modeling, bpmnReplace, canvas) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          host = elementRegistry.get('Task_1'),
          newElementData = {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:ErrorEventDefinition',
          };

      // when
      var newElement = bpmnReplace.replaceElement(boundaryEvent, newElementData);

      // then
      expect(newElement.host).to.exist;
      expect(newElement.host).to.eql(host);
    }));

  });


  describe('should replace in collaboration', function() {

    var diagramXML = require('./BpmnReplace.collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('expanded with collapsed pool', inject(function(elementRegistry, bpmnReplace) {

      // given
      var shape = elementRegistry.get('Participant_1');

      // when
      var newShape = bpmnReplace.replaceElement(shape, { type: 'bpmn:Participant', isExpanded: false });

      // then
      expect(isExpanded(newShape)).to.be.false; // collapsed
      expect(newShape.children).to.be.empty;
    }));


    it('collapsed with expande pool', inject(function(elementRegistry, bpmnReplace) {

      // given
      var shape = elementRegistry.get('Participant_2');

      // when
      var newShape = bpmnReplace.replaceElement(shape, { type: 'bpmn:Participant', isExpanded: true });

      // then
      expect(isExpanded(newShape)).to.be.true; // expanded
      expect(newShape.children).to.be.empty;
    }));

  });


  describe('position and size', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should keep position', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.x).to.equal(task.x);
      expect(newElement.y).to.equal(task.y);
    }));

  });


  describe('selection', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should select after replace',
      inject(function(elementRegistry, selection, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(selection.get()).to.include(newElement);
    }));

  });


  describe('label', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should keep interior labels',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');

      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.name).to.equal('Task Caption');
    }));


    it('should keep exterior labels',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      var newElementData =  {
        type: 'bpmn:EndEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(startEvent, newElementData);

      // then
      expect(newElement.label.hidden).to.equal(false);
      expect(newElement.label.labelTarget).to.equal(newElement);
      expect(newElement.businessObject.name).to.equal('KEEP ME');
    }));

  });


  describe('undo support', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should undo replace',
      inject(function(elementRegistry, bpmnReplace, commandStack) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
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


    it('should redo replace',
      inject(function(elementRegistry, bpmnReplace, commandStack) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };
      var newElementData2 =  {
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

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should reconnect valid connections',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
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


    it('should remove invalid incomming connections',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('StartEvent_1');
      var newElementData =  {
        type: 'bpmn:EndEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var incoming = newElement.incoming[0],
          outgoing = newElement.outgoing[0];


      expect(incoming).not.to.exist;
      expect(outgoing).not.to.exist;
    }));


    it('should remove invalid outgoing connections',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('EndEvent_1');
      var newElementData =  {
        type: 'bpmn:StartEvent'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var incoming = newElement.incoming[0],
          outgoing = newElement.outgoing[0];


      expect(incoming).not.to.exist;
      expect(outgoing).not.to.exist;
    }));


    describe('undo support', function() {

      it('should reconnect valid connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var task = elementRegistry.get('Task_1');
        var newElementData =  {
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


      it('should remove invalid incoming connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');
        var newElementData =  {
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
      }));


      it('should remove invalid outgoing connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var endEvent = elementRegistry.get('EndEvent_1');
        var newElementData =  {
          type: 'bpmn:StartEvent'
        };

        bpmnReplace.replaceElement(endEvent, newElementData);

        // when
        commandStack.undo();

        // then
        var newEvent = elementRegistry.get('EndEvent_1');
        var incoming = newEvent.incoming[0],
            outgoing = newEvent.outgoing[0],
            source   = incoming.source;


        expect(incoming).to.exist;
        expect(outgoing).not.to.exist;
        expect(source).to.eql(elementRegistry.get('Transaction_1'));
      }));

    });


    describe('redo support', function() {

      it('should reconnect valid connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var task = elementRegistry.get('Task_1');
        var newElementData =  {
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
      }));


      it('should remove invalid incoming connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');
        var newElementData =  {
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
      }));


      it('should remove invalid outgoing connections',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

        // given
        var endEvent = elementRegistry.get('EndEvent_1');
        var newElementData =  {
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
      }));

    });

  });


  describe('children handling', function() {

    var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should update bpmn containment properly', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1');
      var startEventShape = elementRegistry.get('StartEvent_2');
      var taskShape = elementRegistry.get('Task_2');
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_4');

      var transactionShapeData =  {
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

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


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
    }));


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
    }));


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
    }));


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
    }));

  });


  describe('compensation activity', function() {

    var diagramXML = require('./BpmnReplace.compensation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should keep isForCompensation attr', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
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

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should remove connections',
      inject(function(elementRegistry, bpmnReplace) {

      // given
      var transaction = elementRegistry.get('SubProcess_1');
      var newElementData =  {
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
    }));


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

    }));


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

    }));


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

    }));


    it('should not replace interrupting start event after moving it outside event sub process',
      inject(function(bpmnReplace, elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_2'),
          root = elementRegistry.get('Process_1');

      var interruptingStartEvent = bpmnReplace.replaceElement(startEvent, { type: 'bpmn:StartEvent' });

      // when
      modeling.moveElements([interruptingStartEvent], { x: 0, y: 200 }, root);

      var startEventAfter = elementRegistry.filter(function(element) {
        return is(element, 'bpmn:StartEvent') && element.parent === root;
      })[0];

      // then
      expect(startEventAfter).to.equal(interruptingStartEvent);
      expect(startEventAfter.parent).to.equal(root);

    }));


    it('should replace non-interrupting start event when replacing parent event sub process',
      inject(function(elementRegistry, bpmnReplace){

      // given
      var eventSubProcess = elementRegistry.get('SubProcess_2');

      // when
      var subProcess = bpmnReplace.replaceElement(eventSubProcess, { type: 'bpmn:SubProcess' });

      // then
      var replacedStartEvent = elementRegistry.filter(function (element) {
        return (element.parent === subProcess && element.type !== 'label');
      })[0];

      expect(isInterrupting(replacedStartEvent)).to.be.true;
      expect(replacedStartEvent.parent).to.equal(subProcess);
    }));


    it('should not replace non-interrupting start event when moving parent event sub process',
      inject(function(elementRegistry, bpmnReplace, modeling){

      // given
      var eventSubProcess = elementRegistry.get('SubProcess_2'),
          startEvent = elementRegistry.get('StartEvent_2');

      // when
      modeling.moveElements([eventSubProcess], { x: 20, y: 30 });

      // start event after moving parent
      var startEventAfter = elementRegistry.filter(function (element) {
        return (element.parent === eventSubProcess && element.type !== 'label');
      })[0];

      // then
      expect(startEventAfter).to.equal(startEvent);
      expect(startEventAfter.parent).to.eql(eventSubProcess);
    }));

  });


  describe('events', function() {

    var diagramXML = require('../../../fixtures/bpmn/basic.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should properly set parent of event definitions', inject(function(elementRegistry, modeling, bpmnReplace) {

      var startEvent = elementRegistry.get('StartEvent_1');

      var messageEvent = bpmnReplace.replaceElement(startEvent, {
        type: 'bpmn:StartEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });

      var parent = messageEvent.businessObject.eventDefinitions[0].$parent;

      expect(parent).to.exist;
      expect(parent).to.equal(messageEvent.businessObject);
    }));
  });

});
