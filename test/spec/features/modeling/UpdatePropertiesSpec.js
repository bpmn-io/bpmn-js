import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - update properties', function() {

  var diagramXML = require('../../../fixtures/bpmn/conditions.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  var updatedElements;

  beforeEach(inject(function(eventBus) {

    eventBus.on([ 'commandStack.execute', 'commandStack.revert' ], function() {
      updatedElements = [];
    });

    eventBus.on('element.changed', function(event) {
      updatedElements.push(event.element);
    });

  }));


  describe('should execute', function() {

    it('setting loop characteristics', inject(
      function(elementRegistry, modeling, moddle) {

        // given
        var loopCharacteristics = moddle.create(
          'bpmn:MultiInstanceLoopCharacteristics'
        );

        var taskShape = elementRegistry.get('ServiceTask_1');

        // when
        modeling.updateProperties(taskShape, {
          loopCharacteristics: loopCharacteristics
        });

        // then
        expect(
          taskShape.businessObject.loopCharacteristics
        ).to.eql(loopCharacteristics);


        // task shape got updated
        expect(updatedElements).to.include(taskShape);
      }
    ));


    it('unsetting default flow', inject(function(elementRegistry, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });

      // then
      expect(gatewayShape.businessObject['default']).not.to.exist;

      // flow got updated, too
      expect(updatedElements).to.include(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating default flow', inject(function(elementRegistry, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1'),
          newDefaultFlowConnection = elementRegistry.get('SequenceFlow_2'),
          newDefaultFlow = newDefaultFlowConnection.businessObject;

      // when
      modeling.updateProperties(gatewayShape, { 'default': newDefaultFlow });

      // then
      expect(gatewayShape.businessObject['default']).to.eql(newDefaultFlow);

      // flow got updated, too
      expect(updatedElements).to.include(newDefaultFlowConnection);
    }));


    it('should keep unchanged default flow untouched', inject(
      function(elementRegistry, modeling) {

        // given
        var gatewayShape = elementRegistry.get('ExclusiveGateway_1'),
            sequenceFlow = elementRegistry.get('SequenceFlow_2'),
            taskShape = elementRegistry.get('Task_1');

        // when
        modeling.reconnectStart(
          sequenceFlow,
          taskShape,
          {
            x: taskShape.x + taskShape.width,
            y: taskShape.y + taskShape.height / 2
          }
        );

        // then
        expect(gatewayShape.businessObject.default).to.exist;
      }
    ));


    it('updating conditional flow on source replace', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var conditionalFlow = elementRegistry.get('SequenceFlow_3'),
            conditionalBo = conditionalFlow.businessObject,
            serviceTask = elementRegistry.get('ServiceTask_1');

        var conditionExpression = conditionalBo.conditionExpression;

        var userTaskData = {
          type: 'bpmn:UserTask'
        };

        // when
        bpmnReplace.replaceElement(serviceTask, userTaskData);

        // then
        expect(conditionalBo.conditionExpression).to.eql(conditionExpression);
      }
    ));


    it('updating conditional flow on target replace', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var conditionalFlow = elementRegistry.get('SequenceFlow_3'),
            conditionalBo = conditionalFlow.businessObject,
            endEvent = elementRegistry.get('EndEvent_1');

        var conditionExpression = conditionalBo.conditionExpression;

        var messageEndEventData = {
          type: 'bpmn:EndEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        };

        // when
        bpmnReplace.replaceElement(endEvent, messageEndEventData);

        // then
        expect(conditionalBo.conditionExpression).to.eql(conditionExpression);
      }
    ));


    it('updating name', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });

      // then
      expect(flowConnection.businessObject.name).to.equal('FOO BAR');

      // flow label got updated, too
      expect(updatedElements).to.include(flowConnection.label);
    }));


    it('unsetting name', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_3');

      // when
      modeling.updateProperties(flowConnection, { name: undefined });

      // then
      expect(flowConnection.businessObject.name).not.to.exist;
    }));


    it('updating id', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1'),
          flowBo = flowConnection.businessObject;

      var ids = flowBo.$model.ids;

      // when
      modeling.updateProperties(flowConnection, { id: 'FOO_BAR' });

      // then
      expect(ids.assigned('FOO_BAR')).to.eql(flowBo);
      expect(ids.assigned('SequenceFlow_1')).to.be.false;

      expect(flowBo.id).to.equal('FOO_BAR');
      expect(flowConnection.id).to.equal('FOO_BAR');
    }));


    it('updating extension elements', inject(
      function(elementRegistry, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_1'),
            flowBo = flowConnection.businessObject;

        // when
        modeling.updateProperties(flowConnection, {
          'xmlns:foo': 'http://foo',
          'foo:customAttr': 'FOO'
        });

        // then
        expect(flowBo.get('xmlns:foo')).to.equal('http://foo');
        expect(flowBo.get('foo:customAttr')).to.equal('FOO');
      }
    ));


    it('setting di properties', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1'),
          flowBo = flowConnection.businessObject;

      // when
      modeling.updateProperties(flowConnection, {
        di: {
          fill: 'FUCHSIA'
        }
      });

      // then
      expect(flowBo.di.fill).to.equal('FUCHSIA');

      expect(flowBo.get('di')).not.to.exist;
    }));


    it('unsetting di properties', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');
      modeling.updateProperties(flowConnection, { di: { fill: 'FUCHSIA' } });

      // when
      modeling.updateProperties(flowConnection, { di: { fill: undefined } });

      // then
      expect(flowConnection.businessObject.di.fill).not.to.exist;
    }));

  });


  describe('should undo', function() {

    it('setting loop characteristics', inject(
      function(elementRegistry, modeling, commandStack, moddle) {

        // given
        var loopCharactersistics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

        var taskShape = elementRegistry.get('ServiceTask_1');

        // when
        modeling.updateProperties(taskShape, { loopCharacteristics: loopCharactersistics });
        commandStack.undo();

        // then
        expect(taskShape.businessObject.loopCharactersistics).not.to.exist;
      }
    ));


    it('unsetting default flow', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var gatewayShape = elementRegistry.get('ExclusiveGateway_1'),
            gatewayBo = gatewayShape.businessObject,
            oldDefaultBo = gatewayShape.businessObject['default'],
            oldDefaultConnection = elementRegistry.get(oldDefaultBo.id);

        // when
        modeling.updateProperties(gatewayShape, {
          'default': undefined
        });

        commandStack.undo();

        // then
        expect(gatewayBo['default']).to.eql(oldDefaultBo);

        // flow got updated, too
        expect(updatedElements).to.include(oldDefaultConnection);
      }
    ));


    it('updating default flow', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var gatewayShape = elementRegistry.get('ExclusiveGateway_1'),
            gatewayBo = gatewayShape.businessObject,
            newDefaultFlowConnection = elementRegistry.get('SequenceFlow_2'),
            newDefaultFlow = newDefaultFlowConnection.businessObject,
            oldDefaultFlowConnection = elementRegistry.get('SequenceFlow_1'),
            oldDefaultFlow = oldDefaultFlowConnection.businessObject;

        // when
        modeling.updateProperties(gatewayShape, {
          'default': newDefaultFlow
        });
        commandStack.undo();

        // then
        expect(gatewayBo['default']).to.eql(oldDefaultFlow);

        // flow got updated, too
        expect(updatedElements).to.include(newDefaultFlowConnection);
        expect(updatedElements).to.include(oldDefaultFlowConnection);
      }
    ));


    it('updating name', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_1');

        // when
        modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
        commandStack.undo();

        // then
        expect(flowConnection.businessObject.name).to.equal('default');

        // flow got updated, too
        expect(updatedElements).to.include(flowConnection.label);
      }
    ));


    it('unsetting name', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_3');

        modeling.updateProperties(flowConnection, { name: undefined });

        // when
        commandStack.undo();

        // then
        expect(flowConnection.businessObject.name).to.equal('conditional');
      }
    ));


    it('updating id', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1'),
          flowBo = flowConnection.businessObject;

      var ids = flowBo.$model.ids;

      // when
      modeling.updateProperties(flowConnection, { id: 'FOO_BAR' });
      commandStack.undo();

      // then
      expect(ids.assigned('FOO_BAR')).to.be.false;
      expect(ids.assigned('SequenceFlow_1')).to.eql(flowBo);

      expect(flowConnection.id).to.equal('SequenceFlow_1');
      expect(flowBo.id).to.equal('SequenceFlow_1');
    }));


    it('updating extension elements', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_1'),
            flowBo = flowConnection.businessObject;

        modeling.updateProperties(flowConnection, {
          'xmlns:foo': 'http://foo',
          'foo:customAttr': 'FOO'
        });

        // when
        commandStack.undo();

        // then
        expect(flowBo.get('xmlns:foo')).not.to.exist;
        expect(flowBo.get('foo:customAttr')).not.to.exist;
      }
    ));

  });


  describe('should redo', function() {

    it('setting loop characteristics', inject(
      function(elementRegistry, modeling, commandStack, moddle) {

        // given
        var loopCharacteristics = moddle.create(
          'bpmn:MultiInstanceLoopCharacteristics'
        );

        var taskShape = elementRegistry.get('ServiceTask_1'),
            taskBo = taskShape.businessObject;

        // when
        modeling.updateProperties(taskShape, {
          loopCharacteristics: loopCharacteristics
        });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(taskBo.loopCharacteristics).to.eql(loopCharacteristics);
      }
    ));


    it('updating default flow', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

        // when
        modeling.updateProperties(gatewayShape, { 'default': undefined });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(gatewayShape.businessObject['default']).not.to.exist;

        // flow got updated, too
        expect(updatedElements).to.include(
          elementRegistry.get('SequenceFlow_1')
        );
      }
    ));


    it('updating name', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_1');

        // when
        modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
        commandStack.undo();
        commandStack.redo();

        // then
        expect(flowConnection.businessObject.name).to.equal('FOO BAR');

        // flow got updated, too
        expect(updatedElements).to.include(flowConnection.label);
      }
    ));


    it('unsetting name', inject(
      function(elementRegistry, commandStack, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_3');

        modeling.updateProperties(flowConnection, { name: undefined });

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(flowConnection.businessObject.name).not.to.exist;
      }
    ));

  });


  describe('unwrap diagram elements', function() {

    it('updating default flow with connection', inject(
      function(elementRegistry, modeling) {

        // given
        var gatewayShape = elementRegistry.get('ExclusiveGateway_1'),
            newDefaultFlowConnection = elementRegistry.get('SequenceFlow_2');

        // when
        modeling.updateProperties(gatewayShape, {
          'default': newDefaultFlowConnection
        });

        // then
        expect(gatewayShape.businessObject['default']).to.eql(
          newDefaultFlowConnection.businessObject
        );

        // flow got updated, too
        expect(updatedElements).to.include(newDefaultFlowConnection);
      }
    ));

  });


  describe('error handling', function() {

    it('should ignore unchanged id', inject(
      function(elementRegistry, modeling) {

        // given
        var flowConnection = elementRegistry.get('SequenceFlow_1'),
            flowBo = flowConnection.businessObject;

        var ids = flowBo.$model.ids;

        // when
        modeling.updateProperties(flowConnection, { id: 'SequenceFlow_1' });

        // then
        expect(ids.assigned('SequenceFlow_1')).to.eql(flowBo);

        expect(flowBo.id).to.equal('SequenceFlow_1');
      }
    ));


    it('should ignore setting color on root', inject(
      function(canvas, modeling) {

        // given
        var rootElement = canvas.getRootElement();

        // when
        modeling.updateProperties(rootElement, {
          di: {
            fill: 'fuchsia'
          }
        });

        // then
        expect(rootElement.di).not.to.exist;
      }
    ));

  });

});
