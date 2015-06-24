'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    coreModule = require('../../../../lib/core'),
    is = require('../../../../lib/util/ModelUtil').is;


describe('features/replace', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

  var testModules = [ coreModule, modelingModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should replace', function() {

    it('task', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      var businessObject = newElement.businessObject;

      expect(newElement).toBeDefined();
      expect(is(businessObject, 'bpmn:UserTask')).toBe(true);
    }));


    it('gateway', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var gateway = elementRegistry.get('ExclusiveGateway_1');
      var newElementData =  {
        type: 'bpmn:InclusiveGateway'
      };

      // when
      var newElement = bpmnReplace.replaceElement(gateway, newElementData);


      // then
      var businessObject = newElement.businessObject;

      expect(newElement).toBeDefined();
      expect(is(businessObject, 'bpmn:InclusiveGateway')).toBe(true);
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
      expect(newElement).toBeDefined();
      expect(is(newElement.businessObject, 'bpmn:Transaction')).toBe(true);

    }));


    it('transaction', inject(function(elementRegistry, modeling, bpmnReplace, canvas) {
      
      var transaction = elementRegistry.get('Transaction_1'),
          newElementData = {
            type: 'bpmn:SubProcess',
            isExpanded: true
          };

      var newElement = bpmnReplace.replaceElement(transaction, newElementData);

      expect(newElement).toBeDefined();
      expect(is(newElement.businessObject, 'bpmn:SubProcess')).toBe(true);

    }));

  });


  describe('position and size', function() {

    it('should keep position', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.x).toBe(346);
      expect(newElement.y).toBe(149);
    }));

  });


  describe('selection', function() {

    it('should select after replace', inject(function(elementRegistry, selection, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');
      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(selection.get()).toContain(newElement);
    }));

  });


  describe('label', function() {

    it('should keep copy label', inject(function(elementRegistry, bpmnReplace) {

      // given
      var task = elementRegistry.get('Task_1');

      var newElementData =  {
        type: 'bpmn:UserTask'
      };

      // when
      var newElement = bpmnReplace.replaceElement(task, newElementData);

      // then
      expect(newElement.businessObject.name).toBe('Task Caption');
    }));

  });


  describe('undo support', function() {

    it('should undo replace', inject(function(elementRegistry, modeling, bpmnReplace, commandStack) {

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

      expect(target).toBeDefined();
      expect(is(businessObject, 'bpmn:Task')).toBe(true);
    }));


    it('should redo replace', inject(function(elementRegistry, modeling, bpmnReplace, commandStack, eventBus) {

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

      expect(servicetask).toBeDefined();
      expect(is(businessObject, 'bpmn:ServiceTask')).toBe(true);
    }));

  });


  describe('connection handling', function() {

    it('should reconnect valid connections', inject(function(elementRegistry, modeling, bpmnReplace) {

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


      expect(incoming).toBeDefined();
      expect(outgoing).toBeDefined();
      expect(source).toBe(elementRegistry.get('StartEvent_1'));
      expect(target).toBe(elementRegistry.get('ExclusiveGateway_1'));
    }));


    it('should remove invalid incomming connections', inject(function(elementRegistry, modeling, bpmnReplace) {

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


      expect(incoming).toBeUndefined();
      expect(outgoing).toBeUndefined();
    }));


    it('should remove invalid outgoing connections', inject(function(elementRegistry, modeling, bpmnReplace) {

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


      expect(incoming).toBeUndefined();
      expect(outgoing).toBeUndefined();
    }));


    describe('undo support', function() {

      it('should reconnect valid connections', inject(function(elementRegistry, modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeDefined();
        expect(outgoing).toBeDefined();
        expect(source).toBe(elementRegistry.get('StartEvent_1'));
        expect(target).toBe(elementRegistry.get('ExclusiveGateway_1'));
      }));


      it('should remove invalid incoming connections', inject(function(elementRegistry,
        modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeUndefined();
        expect(outgoing).toBeDefined();
        expect(target).toBe(elementRegistry.get('Task_1'));
      }));


      it('should remove invalid outgoing connections', inject(function(elementRegistry,
         modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeDefined();
        expect(outgoing).toBeUndefined();
        expect(source).toBe(elementRegistry.get('ExclusiveGateway_1'));
      }));

    });


    describe('redo support', function() {

      it('should reconnect valid connections', inject(function(elementRegistry, modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeDefined();
        expect(outgoing).toBeDefined();
        expect(source).toBe(elementRegistry.get('StartEvent_1'));
        expect(target).toBe(elementRegistry.get('ExclusiveGateway_1'));
      }));


      it('should remove invalid incoming connections', inject(function(elementRegistry,
        modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeUndefined();
        expect(outgoing).toBeUndefined();
      }));


      it('should remove invalid outgoing connections', inject(function(elementRegistry,
        modeling, bpmnReplace, commandStack) {

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


        expect(incoming).toBeUndefined();
        expect(outgoing).toBeUndefined();
      }));

    });

  });

});
