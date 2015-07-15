'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    coreModule = require('../../../../lib/core');



describe('features/replace', function() {

  var diagramXML = fs.readFileSync('test/fixtures/bpmn/features/replace/01_replace.bpmn', 'utf8');

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

      expect(newElement).to.be.defined;
      expect(businessObject.$instanceOf('bpmn:UserTask')).to.be.true;
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

      expect(newElement).to.be.defined;
      expect(businessObject.$instanceOf('bpmn:InclusiveGateway')).to.be.true;
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
      expect(newElement.x).to.equal(346);
      expect(newElement.y).to.equal(149);
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
      expect(selection.get()).to.include(newElement);
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
      expect(newElement.businessObject.name).to.equal('Task Caption');
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

      expect(target).to.be.defined;
      expect(businessObject.$instanceOf('bpmn:Task')).to.be.true;
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

      expect(servicetask).to.be.defined;
      expect(businessObject.$instanceOf('bpmn:ServiceTask')).to.be.true;
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


      expect(incoming).to.be.defined;
      expect(outgoing).to.be.defined;
      expect(source).to.eql(elementRegistry.get('StartEvent_1'));
      expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
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


      expect(incoming).to.be.undefined;
      expect(outgoing).to.be.undefined;
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


      expect(incoming).to.be.undefined;
      expect(outgoing).to.be.undefined;
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


        expect(incoming).to.be.defined;
        expect(outgoing).to.be.defined;
        expect(source).to.eql(elementRegistry.get('StartEvent_1'));
        expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
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


        expect(incoming).to.be.undefined;
        expect(outgoing).to.be.defined;
        expect(target).to.eql(elementRegistry.get('Task_1'));
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


        expect(incoming).to.be.defined;
        expect(outgoing).to.be.undefined;
        expect(source).to.eql(elementRegistry.get('ExclusiveGateway_1'));
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


        expect(incoming).to.be.defined;
        expect(outgoing).to.be.defined;
        expect(source).to.eql(elementRegistry.get('StartEvent_1'));
        expect(target).to.eql(elementRegistry.get('ExclusiveGateway_1'));
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


        expect(incoming).to.be.undefined;
        expect(outgoing).to.be.undefined;
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


        expect(incoming).to.be.undefined;
        expect(outgoing).to.be.undefined;
      }));

    });

  });

});
