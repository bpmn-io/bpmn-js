import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import copyPasteModule from 'lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import camundaModdleModule from 'camunda-bpmn-moddle/lib';
import camundaPackage from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getBusinessObject,
  is
} from 'lib/util/ModelUtil';

var HIGH_PRIORITY = 3000;


describe('features/copy-paste/ModdleCopy', function() {

  var testModules = [
    camundaModdleModule,
    copyPasteModule,
    coreModule,
    modelingModule
  ];

  var basicXML = require('../../../fixtures/bpmn/basic.bpmn');

  beforeEach(bootstrapModeler(basicXML, {
    modules: testModules,
    moddleExtensions: {
      camunda: camundaPackage
    }
  }));


  describe('simple', function() {

    it('should copy primitive properties', inject(function(moddle, moddleCopy) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        asyncBefore: true
      });

      // when
      var serviceTask = moddleCopy.copyElement(userTask, moddle.create('bpmn:ServiceTask'));

      // then
      expect(serviceTask.asyncBefore).to.be.true;

      expectNoAttrs(serviceTask);
    }));


    it('should copy arrays of properties', inject(function(moddle, moddleCopy) {

      // given
      var messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
          signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
          startEvent = moddle.create('bpmn:StartEvent');

      startEvent.eventDefinitions = [ messageEventDefinition, signalEventDefinition ];

      // when
      var endEvent = moddleCopy.copyElement(startEvent, moddle.create('bpmn:EndEvent'));

      // then
      var eventDefinitions = endEvent.eventDefinitions;

      expect(eventDefinitions).to.have.length(2);
      expect(eventDefinitions[0].$type).to.equal('bpmn:MessageEventDefinition');
      expect(eventDefinitions[1].$type).to.equal('bpmn:SignalEventDefinition');

      expectNoAttrs(endEvent);
    }));


    it('should NOT copy properties that are not allowed in target element', inject(
      function(moddle, moddleCopy) {

        // given
        var userTask = moddle.create('bpmn:UserTask', {
          assignee: 'foobar'
        });

        // when
        var serviceTask = moddleCopy.copyElement(userTask, moddle.create('bpmn:ServiceTask'));

        // then
        expect(serviceTask.assignee).not.to.exist;

        expectNoAttrs(serviceTask);
      }
    ));


    it('should NOT copy IDs if taken', inject(function(moddle, moddleCopy, canvas, modeling) {

      // given
      var task = modeling.createShape({ type: 'bpmn:Task' },
        { x: 0, y: 0 }, canvas.getRootElement());
      var taskId = task.id;

      // when
      var userTask = moddleCopy.copyElement(task.businessObject, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.id).not.to.equal(taskId);

      expectNoAttrs(userTask);
    }));


    it('should copy IDs if free', inject(function(moddle, moddleCopy, canvas, modeling) {

      // given
      var task = modeling.createShape({ type: 'bpmn:Task' },
        { x: 0, y: 0 }, canvas.getRootElement());
      var taskId = task.id;

      // when
      modeling.removeShape(task);
      var userTask = moddleCopy.copyElement(task.businessObject, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.id).to.equal(taskId);

      expectNoAttrs(userTask);
    }));


    it('should NOT copy <processRef>', inject(function(moddle, moddleCopy) {

      // given
      var processElement = moddle.create('bpmn:Process'),
          participant = moddle.create('bpmn:Participant');

      participant.processRef = processElement;

      // when
      var copiedParticipant = moddleCopy.copyElement(participant, moddle.create('bpmn:Participant'));

      // then
      expect(copiedParticipant).not.to.equal(participant);
      expect(copiedParticipant.processRef).not.to.exist;
    }));


    it('should NOT copy misc references', inject(function(moddle, moddleCopy) {

      // given
      var label = moddle.create('bpmndi:BPMNLabel'),
          labelStyle = moddle.create('bpmndi:BPMNLabelStyle');

      label.labelStyle = labelStyle;

      // when
      var copiedLabel = moddleCopy.copyElement(label, moddle.create('bpmndi:BPMNLabel'));

      // then
      expect(copiedLabel.labelStyle).not.to.exist;
    }));


    it('should copy extension elements last', inject(function(moddleCopy, eventBus, moddle) {

      // given
      var connector = moddle.create('camunda:Connector'),
          extensionElements = moddle.create('bpmn:ExtensionElements'),
          messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
          messageEndEvent = moddle.create('bpmn:EndEvent');

      connector.$parent = extensionElements;

      extensionElements.$parent = messageEventDefinition;
      extensionElements.values = [ connector ];

      messageEventDefinition.$parent = messageEndEvent;
      messageEventDefinition.extensionElements = extensionElements;

      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      var propertyNames = [];

      eventBus.on('moddleCopy.canCopyProperty', function(context) {
        var propertyName = context.propertyName;

        propertyNames.push(propertyName);
      });

      moddleCopy.copyElement(messageEndEvent, moddle.create('bpmn:EndEvent'), [
        'extensionElements',
        'name'
      ]);

      expect(propertyNames).to.eql([
        'name',
        'extensionElements'
      ]);
    }));


    it('should NOT copy empty extension elements', inject(function(moddle, moddleCopy) {

      // given
      var connector = moddle.create('camunda:Connector'),
          extensionElements = moddle.create('bpmn:ExtensionElements'),
          messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
          messageEndEvent = moddle.create('bpmn:EndEvent');

      connector.$parent = extensionElements;

      extensionElements.$parent = messageEventDefinition;
      extensionElements.values = [ connector ];

      messageEventDefinition.$parent = messageEndEvent;
      messageEventDefinition.extensionElements = extensionElements;

      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      var startEvent = moddleCopy.copyElement(messageEndEvent, moddle.create('bpmn:StartEvent'));

      // connector not allowed in start event
      expect(startEvent.eventDefinitions[0].extensionElements).not.to.exist;
    }));


    it('should only copy specified properties', inject(function(moddle, moddleCopy) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        asyncBefore: true,
        name: 'foo'
      });

      // when
      var serviceTask = moddleCopy.copyElement(
        userTask,
        moddle.create('bpmn:ServiceTask'),
        'asyncBefore'
      );

      // then
      expect(serviceTask.asyncBefore).to.be.true;
      expect(serviceTask.name).not.to.exist;

      expectNoAttrs(serviceTask);
    }));

  });


  describe('nested', function() {

    it('should copy documentation', inject(function(moddle, moddleCopy) {

      // given
      var documentation = [
        moddle.create('bpmn:Documentation', { text: 'FOO\nBAR', textFormat: 'xyz' }),
        moddle.create('bpmn:Documentation', { text: '<html></html>' })
      ];

      var userTask = moddle.create('bpmn:UserTask');

      userTask.documentation = documentation;

      // when
      var serviceTask = moddleCopy.copyElement(userTask, moddle.create('bpmn:ServiceTask'));

      expect(serviceTask.documentation[0].$parent).to.equal(serviceTask);
      expect(serviceTask.documentation[0].text).to.equal('FOO\nBAR');
      expect(serviceTask.documentation[0].textFormat).to.equal('xyz');

      expect(serviceTask.documentation[1].$parent).to.equal(serviceTask);
      expect(serviceTask.documentation[1].text).to.equal('<html></html>');
    }));


    it('should copy execution listener', inject(function(moddle, moddleCopy) {

      // given
      var script = moddle.create('camunda:Script', {
        scriptFormat: 'groovy',
        value: 'foo = bar;'
      });

      var executionListener = moddle.create('camunda:ExecutionListener', {
        event: 'start',
        script: script
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements'),
          userTask = moddle.create('bpmn:UserTask');

      executionListener.$parent = extensionElements;

      extensionElements.$parent = userTask;
      extensionElements.values = [ executionListener ];

      userTask.extensionElements = extensionElements;

      // when
      var serviceTask = moddleCopy.copyElement(userTask, moddle.create('bpmn:ServiceTask'));

      // then
      executionListener = serviceTask.extensionElements.values[0];

      expect(executionListener).to.exist;
      expect(executionListener.$type).to.equal('camunda:ExecutionListener');
      expect(executionListener.$parent).to.equal(serviceTask.extensionElements);
      expect(executionListener.event).to.equal('start');

      script = executionListener.script;

      expect(script).to.exist;
      expect(script.$type).to.equal('camunda:Script');
      expect(script.$parent).to.equal(executionListener);
      expect(script.scriptFormat).to.equal('groovy');
      expect(script.value).to.equal('foo = bar;');
    }));


    it('should copy output parameter', inject(function(moddle, moddleCopy) {

      // given
      var outputParameter = moddle.create('camunda:OutputParameter', {
        name: 'foo',
        definition: moddle.create('camunda:List', {
          items: [
            moddle.create('camunda:Value', { value: '${1+1}' }),
            moddle.create('camunda:Value', { value: '${1+2}' }),
            moddle.create('camunda:Value', { value: '${1+3}' })
          ]
        })
      });

      var inputOutput = moddle.create('camunda:InputOutput', {
        outputParameters: [ outputParameter ]
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements'),
          userTask = moddle.create('bpmn:UserTask');

      extensionElements.$parent = userTask;
      extensionElements.values = [ inputOutput ];

      userTask.extensionElements = extensionElements;

      // when
      var subProcess = moddleCopy.copyElement(userTask, moddle.create('bpmn:SubProcess'));

      // then
      extensionElements = subProcess.extensionElements;

      inputOutput = extensionElements.values[0];

      expect(inputOutput.$type).to.equal('camunda:InputOutput');
      expect(inputOutput.$parent).to.equal(extensionElements);

      outputParameter = inputOutput.outputParameters[0];

      expect(outputParameter.$type).to.equal('camunda:OutputParameter');
      expect(outputParameter.$parent).to.equal(inputOutput);
      expect(outputParameter.name).to.equal('foo');

      var definition = outputParameter.definition;

      expect(definition.$type).to.equal('camunda:List');
      expect(definition.$parent).to.equal(outputParameter);

      var items = definition.items;

      expect(items[0].$type).to.equal('camunda:Value');
      expect(items[0].$parent).to.equal(definition);
      expect(items[0].value).to.equal('${1+1}');

      expect(items[1].$type).to.equal('camunda:Value');
      expect(items[1].$parent).to.equal(definition);
      expect(items[1].value).to.equal('${1+2}');

      expect(items[2].$type).to.equal('camunda:Value');
      expect(items[2].$parent).to.equal(definition);
      expect(items[2].value).to.equal('${1+3}');
    }));

  });


  describe('integration', function() {

    describe('camunda:Connector', function() {

      it('should copy if parent is message event definition and is child of end event', inject(
        function(moddle, moddleCopy) {

          // given
          var connector = moddle.create('camunda:Connector', {
            connectorId: 'foo'
          });

          var extensionElements = moddle.create('bpmn:ExtensionElements'),
              messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
              messageIntermediateThrowEvent = moddle.create('bpmn:IntermediateThrowEvent');

          connector.$parent = extensionElements;

          extensionElements.$parent = messageEventDefinition;
          extensionElements.values = [ connector ];

          messageEventDefinition.$parent = messageIntermediateThrowEvent;
          messageEventDefinition.extensionElements = extensionElements;

          messageIntermediateThrowEvent.eventDefinitions = [ messageEventDefinition ];

          // when
          var endEvent =
            moddleCopy.copyElement(messageIntermediateThrowEvent, moddle.create('bpmn:EndEvent'));

          // then
          extensionElements = endEvent.eventDefinitions[0].extensionElements;

          expect(extensionElements.values[0].$type).to.equal('camunda:Connector');
          expect(extensionElements.values[0].connectorId).to.equal('foo');
        }
      ));

    });


    describe('camunda:Field', function() {

      it('should copy if parent is message event definition and is child of end event', inject(
        function(moddle, moddleCopy) {

          // given
          var field = moddle.create('camunda:Field', {
            name: 'foo'
          });

          var extensionElements = moddle.create('bpmn:ExtensionElements'),
              messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
              messageIntermediateThrowEvent = moddle.create('bpmn:IntermediateThrowEvent');

          field.$parent = extensionElements;

          extensionElements.$parent = messageEventDefinition;
          extensionElements.values = [ field ];

          messageEventDefinition.$parent = messageIntermediateThrowEvent;
          messageEventDefinition.extensionElements = extensionElements;

          messageIntermediateThrowEvent.eventDefinitions = [ messageEventDefinition ];

          // when
          var endEvent =
            moddleCopy.copyElement(messageIntermediateThrowEvent, moddle.create('bpmn:EndEvent'));

          // then
          extensionElements = endEvent.eventDefinitions[0].extensionElements;

          expect(extensionElements.values[0].$type).to.equal('camunda:Field');
          expect(extensionElements.values[0].name).to.equal('foo');
        }
      ));

    });


    describe('camunda:FailedJobRetryTimeCycle', function() {

      it('should copy if parent is SignalEventDefinition and is intermediate throwing', inject(
        function(moddle, moddleCopy) {

          // given
          var retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle', {
            body: 'foo'
          });

          var extensionElements = moddle.create('bpmn:ExtensionElements'),
              signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
              signalIntermediateThrowEvent = moddle.create('bpmn:IntermediateThrowEvent');

          retryCycle.$parent = extensionElements;

          extensionElements.$parent = signalEventDefinition;
          extensionElements.values = [ retryCycle ];

          signalEventDefinition.$parent = signalIntermediateThrowEvent;
          signalEventDefinition.extensionElements = extensionElements;

          signalIntermediateThrowEvent.eventDefinitions = [ signalEventDefinition ];

          // when
          var intermediateThrowEvent = moddleCopy.copyElement(
            signalIntermediateThrowEvent,
            moddle.create('bpmn:IntermediateThrowEvent')
          );

          // then
          extensionElements = intermediateThrowEvent.eventDefinitions[0].extensionElements;

          expect(extensionElements.values[0].$type).to.equal('camunda:FailedJobRetryTimeCycle');
          expect(extensionElements.values[0].body).to.equal('foo');
        }
      ));


      it('should copy if parent is TimerEventDefinition and is catching', inject(
        function(moddle, moddleCopy) {

          // given
          var retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle', {
            body: 'foo'
          });

          var extensionElements = moddle.create('bpmn:ExtensionElements'),
              timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              timerStartEvent = moddle.create('bpmn:StartEvent');

          retryCycle.$parent = extensionElements;

          extensionElements.$parent = timerEventDefinition;
          extensionElements.values = [ retryCycle ];

          timerEventDefinition.$parent = timerStartEvent;
          timerEventDefinition.extensionElements = extensionElements;

          timerStartEvent.eventDefinitions = [ timerEventDefinition ];

          // when
          var intermediateCatchEvent =
            moddleCopy.copyElement(timerStartEvent, moddle.create('bpmn:IntermediateCatchEvent'));

          // then
          extensionElements = intermediateCatchEvent.eventDefinitions[0].extensionElements;

          expect(extensionElements.values[0].$type).to.equal('camunda:FailedJobRetryTimeCycle');
          expect(extensionElements.values[0].body).to.equal('foo');
        }
      ));


      it('should copy if parent is call activity', inject(function(moddle, moddleCopy) {

        // given
        var retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle', {
          body: 'foo'
        });

        var extensionElements = moddle.create('bpmn:ExtensionElements'),
            loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics'),
            subProcess = moddle.create('bpmn:SubProcess');

        retryCycle.$parent = extensionElements;

        extensionElements.$parent = loopCharacteristics;
        extensionElements.values = [ retryCycle ];

        loopCharacteristics.$parent = subProcess;
        loopCharacteristics.extensionElements = extensionElements;

        subProcess.loopCharacteristics = loopCharacteristics;

        // when
        var callActivity = moddleCopy.copyElement(subProcess, moddle.create('bpmn:CallActivity'));

        // then
        extensionElements = callActivity.loopCharacteristics.extensionElements;

        expect(extensionElements.values[0].$type).to.equal('camunda:FailedJobRetryTimeCycle');
        expect(extensionElements.values[0].body).to.equal('foo');
      }));

    });


    describe('generic properties', function() {

      it('should not copy generic extension elements', inject(function(moddle, moddleCopy) {

        // given
        var genericExtensionElement = moddle.createAny('foo:property', {
          value: 'foo'
        });

        var extensionElements = moddle.create('bpmn:ExtensionElements'),
            startEvent = moddle.create('bpmn:StartEvent');

        genericExtensionElement.$parent = extensionElements;

        extensionElements.$parent = startEvent;
        extensionElements.values = [ genericExtensionElement ];

        startEvent.extensionElements = extensionElements;

        // when
        var endEvent = moddleCopy.copyElement(startEvent, moddle.create('bpmn:EndEvent'));

        // then
        expect(endEvent.extensionElements).not.to.exist;
      }));

    });

  });


  describe('events', function() {

    it('should disallow copying properties', inject(function(moddleCopy, eventBus, moddle) {

      // given
      var task = moddle.create('bpmn:Task', {
        name: 'foo'
      });

      eventBus.on('moddleCopy.canCopyProperties', HIGH_PRIORITY, function(context) {
        var sourceElement = context.sourceElement;

        if (is(sourceElement, 'bpmn:Task')) {
          return false;
        }
      });

      // when
      var userTask = moddleCopy.copyElement(task, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.name).not.to.exist;
    }));


    it('should disallow copying property', inject(function(moddleCopy, eventBus, moddle) {

      // given
      var task = moddle.create('bpmn:Task', {
        name: 'foo'
      });

      eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {

        // verify provided properties
        expect(context).to.have.property('parent');
        expect(context).to.have.property('property');
        expect(context).to.have.property('propertyName');

        var propertyName = context.propertyName;

        if (propertyName === 'name') {
          return false;
        }
      });

      // when
      var userTask = moddleCopy.copyElement(task, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.name).not.to.exist;
    }));


    it('should disallow setting copied property', inject(function(moddleCopy, eventBus, moddle) {

      // given
      var task = moddle.create('bpmn:Task', {
        name: 'foo'
      });

      eventBus.on('moddleCopy.canSetCopiedProperty', HIGH_PRIORITY, function(context) {

        // verify provided properties
        expect(context).to.have.property('parent');
        expect(context).to.have.property('property');
        expect(context).to.have.property('propertyName');

        var property = context.property;

        if (property === 'foo') {
          return false;
        }
      });

      // when
      var userTask = moddleCopy.copyElement(task, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.name).not.to.exist;
    }));


    it('should copy primitive property', inject(function(moddleCopy, eventBus, moddle) {

      // given
      var task = moddle.create('bpmn:Task', {
        name: 'foo'
      });

      eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
        var propertyName = context.propertyName;

        if (propertyName === 'name') {
          return 'bar';
        }
      });

      // when
      var userTask = moddleCopy.copyElement(task, moddle.create('bpmn:UserTask'));

      // then
      expect(userTask.name).to.equal('bar');
    }));


    describe('copy model element property', function() {

      it('should copy and set parent', inject(function(moddleCopy, eventBus, moddle) {

        // given
        var startEvent = moddle.create('bpmn:StartEvent'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition');

        messageEventDefinition.$parent = startEvent;

        startEvent.eventDefinitions = [ messageEventDefinition ];

        eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
          var property = context.property;

          if (is(property, 'bpmn:MessageEventDefinition')) {
            return moddle.create('bpmn:MessageEventDefinition');
          }
        });

        // when
        var endEvent = moddleCopy.copyElement(startEvent, moddle.create('bpmn:EndEvent'));

        // then
        expect(endEvent.eventDefinitions).to.have.length(1);
        expect(endEvent.eventDefinitions[0]).not.to.equal(messageEventDefinition);
        expect(endEvent.eventDefinitions[0].$type).to.equal('bpmn:MessageEventDefinition');
      }));


      it('should clone', inject(function(moddleCopy, eventBus, moddle) {

        // given
        var task = moddle.create('bpmn:Task', {
          name: 'foo'
        });

        eventBus.once('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
          var propertyName = context.propertyName;

          var clone = context.clone;

          expect(clone).to.be.true;

          if (propertyName === 'name') {
            return 'bar';
          }
        });

        // when
        var userTask = moddleCopy.copyElement(task, moddle.create('bpmn:UserTask'), null, true);

        // then
        expect(userTask.id).to.eql(task.id);
      }));

    });


    it('should copy and NOT set parent', inject(function(canvas, moddleCopy, eventBus, moddle) {

      // given
      var definitions = getDefinitions(canvas.getRootElement()),
          categoryValue = moddle.create('bpmn:CategoryValue'),
          category = moddle.create('bpmn:Category'),
          group = moddle.create('bpmn:Group'),
          newCategoryValue,
          newCategory,
          newGroup;

      categoryValue.$parent = category;

      category.$parent = definitions;
      category.categoryValue = [ categoryValue ];

      definitions.rootElements.push(category);

      group.categoryValueRef = categoryValue;

      eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
        var propertyName = context.propertyName;

        if (propertyName !== 'categoryValueRef') {
          return;
        }

        newCategoryValue = moddle.create('bpmn:CategoryValue');
        newCategory = moddle.create('bpmn:Category');

        newCategoryValue.$parent = newCategory;

        newCategory.$parent = definitions;
        newCategory.categoryValue = [ newCategoryValue ];

        definitions.rootElements.push(newCategory);

        return newCategoryValue;
      });

      // when
      newGroup = moddleCopy.copyElement(group, moddle.create('bpmn:Group'));

      // then
      expect(newGroup.categoryValueRef).to.exist;
      expect(newGroup.categoryValueRef).not.to.equal(categoryValue);
      expect(newGroup.categoryValueRef.$parent).to.equal(newCategory);
    }));


    describe('default events', function() {

      describe('allowed references', function() {

        it('should copy error reference', inject(function(moddle, moddleCopy) {

          // given
          var boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              errorEventDefinition = moddle.create('bpmn:ErrorEventDefinition');

          errorEventDefinition.$parent = boundaryEvent;

          boundaryEvent.eventDefinitions = [ errorEventDefinition ];

          var error = moddle.create('bpmn:Error');

          errorEventDefinition.errorRef = error;

          // when
          var boundaryEventCopy = moddleCopy.copyElement(boundaryEvent, moddle.create('bpmn:BoundaryEvent'));

          // then
          expect(boundaryEventCopy.eventDefinitions).to.have.length(1);
          expect(boundaryEventCopy.eventDefinitions[0]).not.to.equal(errorEventDefinition);
          expect(boundaryEventCopy.eventDefinitions[0].$type).to.equal('bpmn:ErrorEventDefinition');
          expect(boundaryEventCopy.eventDefinitions[0].errorRef).to.exist;
          expect(boundaryEventCopy.eventDefinitions[0].errorRef).to.equal(error);
        }));


        it('should copy escalation reference', inject(function(moddle, moddleCopy) {

          // given
          var boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              escalationEventDefinition = moddle.create('bpmn:EscalationEventDefinition');

          escalationEventDefinition.$parent = boundaryEvent;

          boundaryEvent.eventDefinitions = [ escalationEventDefinition ];

          var error = moddle.create('bpmn:Escalation');

          escalationEventDefinition.escalationRef = error;

          // when
          var boundaryEventCopy = moddleCopy.copyElement(boundaryEvent, moddle.create('bpmn:BoundaryEvent'));

          // then
          expect(boundaryEventCopy.eventDefinitions).to.have.length(1);
          expect(boundaryEventCopy.eventDefinitions[0]).not.to.equal(escalationEventDefinition);
          expect(boundaryEventCopy.eventDefinitions[0].$type).to.equal('bpmn:EscalationEventDefinition');
          expect(boundaryEventCopy.eventDefinitions[0].escalationRef).to.exist;
          expect(boundaryEventCopy.eventDefinitions[0].escalationRef).to.equal(error);
        }));


        it('should copy message reference (event)', inject(function(moddle, moddleCopy) {

          // given
          var boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              messageEventDefinition = moddle.create('bpmn:MessageEventDefinition');

          messageEventDefinition.$parent = boundaryEvent;

          boundaryEvent.eventDefinitions = [ messageEventDefinition ];

          var message = moddle.create('bpmn:Message');

          messageEventDefinition.messageRef = message;

          // when
          var boundaryEventCopy = moddleCopy.copyElement(boundaryEvent, moddle.create('bpmn:BoundaryEvent'));

          // then
          expect(boundaryEventCopy.eventDefinitions).to.have.length(1);
          expect(boundaryEventCopy.eventDefinitions[0]).not.to.equal(messageEventDefinition);
          expect(boundaryEventCopy.eventDefinitions[0].$type).to.equal('bpmn:MessageEventDefinition');
          expect(boundaryEventCopy.eventDefinitions[0].messageRef).to.exist;
          expect(boundaryEventCopy.eventDefinitions[0].messageRef).to.equal(message);
        }));


        it('should copy message reference (receive task)', inject(function(moddle, moddleCopy) {

          // given
          var receiveTask = moddle.create('bpmn:ReceiveTask');

          var message = moddle.create('bpmn:Message');

          receiveTask.messageRef = message;

          // when
          var receiveTaskCopy = moddleCopy.copyElement(receiveTask, moddle.create('bpmn:ReceiveTask'));

          // then
          expect(receiveTaskCopy.messageRef).to.exist;
          expect(receiveTaskCopy.messageRef).to.equal(message);
        }));


        it('should copy signal reference', inject(function(moddle, moddleCopy) {

          // given
          var boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              signalEventDefinition = moddle.create('bpmn:SignalEventDefinition');

          signalEventDefinition.$parent = boundaryEvent;

          boundaryEvent.eventDefinitions = [ signalEventDefinition ];

          var signal = moddle.create('bpmn:Signal');

          signalEventDefinition.signalRef = signal;

          // when
          var boundaryEventCopy = moddleCopy.copyElement(boundaryEvent, moddle.create('bpmn:BoundaryEvent'));

          // then
          expect(boundaryEventCopy.eventDefinitions).to.have.length(1);
          expect(boundaryEventCopy.eventDefinitions[0]).not.to.equal(signalEventDefinition);
          expect(boundaryEventCopy.eventDefinitions[0].$type).to.equal('bpmn:SignalEventDefinition');
          expect(boundaryEventCopy.eventDefinitions[0].signalRef).to.exist;
          expect(boundaryEventCopy.eventDefinitions[0].signalRef).to.equal(signal);
        }));

      });


      describe('disallowed properties', function() {

        it('should NOT copy incoming and outgoing', inject(function(moddle, moddleCopy) {

          // given
          var incoming = moddle.create('bpmn:SequenceFlow'),
              outgoing = moddle.create('bpmn:SequenceFlow'),
              task = moddle.create('bpmn:Task', {
                incoming: [ incoming ],
                outgoing: [ outgoing ]
              });

          expect(task.get('incoming')).to.have.length(1);
          expect(task.get('outgoing')).to.have.length(1);

          // when
          var taskCopy = moddleCopy.copyElement(task, moddle.create('bpmn:Task'));

          // then
          expect(taskCopy.get('incoming')).to.have.length(0);
          expect(taskCopy.get('outgoing')).to.have.length(0);
        }));

      });

    });

  });


  describe('custom', function() {

    var customPackage = require('../../../fixtures/json/model/custom.json');

    beforeEach(bootstrapModeler(basicXML, {
      modules: testModules,
      moddleExtensions: {
        custom: customPackage
      }
    }));


    it('should copy arrays of strings', inject(function(moddle, moddleCopy) {

      // given
      var paths = [ 'A', 'B', 'C' ];

      var customElement = moddle.create('custom:CustomSendElement', {
        paths: paths
      });

      // when
      var newElement = moddleCopy.copyElement(
        customElement,
        moddle.create('custom:CustomSendElement')
      );

      // then
      expect(newElement.paths).to.have.length(3);
      expect(newElement.paths).to.eql(paths);

      expectNoAttrs(newElement);
    }));

  });

});


// helpers //////////

function expectNoAttrs(element) {
  expect(element.$attrs).to.be.empty;
}

function getDefinitions(rootElement) {
  var businessObject = getBusinessObject(rootElement);

  return businessObject.$parent;
}