import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  expectCanConnect,
  expectCanCopy,
  expectCanCreate,
  expectCanDrop,
  expectCanInsert,
  expectCanMove
} from './Helper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/rules - BpmnRules', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('create elements', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('create tasks -> process', inject(function(elementFactory) {

      // given
      var task1 = elementFactory.createShape({ type: 'bpmn:Task' }),
          task2 = elementFactory.createShape({ type: 'bpmn:Task' });

      // then
      expectCanCreate([ task1, task2 ], 'Process', true);
    }));


    it('create tasks -> task', inject(function(elementFactory) {

      // given
      var task1 = elementFactory.createShape({ type: 'bpmn:Task' }),
          task2 = elementFactory.createShape({ type: 'bpmn:Task' });

      // then
      expectCanCreate([ task1, task2 ], 'Task', false);
    }));


    it('create tasks and sequence flow -> process', inject(function(elementFactory) {

      // given
      var task1 = elementFactory.createShape({ type: 'bpmn:Task' }),
          task2 = elementFactory.createShape({ type: 'bpmn:Task' }),
          sequenceFlow = elementFactory.createConnection({
            type: 'bpmn:SequenceFlow',
            source: task1,
            target: task2
          });

      // then
      expectCanCreate([ task1, task2, sequenceFlow ], 'Process', true);
    }));


    it('create tasks and message flow -> process', inject(function(elementFactory) {

      // given
      var task1 = elementFactory.createShape({ type: 'bpmn:Task' }),
          task2 = elementFactory.createShape({ type: 'bpmn:Task' }),
          sequenceFlow = elementFactory.createConnection({
            type: 'bpmn:MessageFlow',
            source: task1,
            target: task2
          });

      // then
      expectCanCreate([ task1, task2, sequenceFlow ], 'Process', false);
    }));


    it('create task and non-interrupting boundary event', inject(function(elementFactory) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' }),
          boundaryEvent = elementFactory.createShape({
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:EscalationEventDefinition',
            cancelActivity: false,
            host: task
          });

      // then
      expectCanCreate([ task, boundaryEvent ], 'Process', true);
    }));


    it('create task and interrupting boundary event', inject(function(elementFactory) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' }),
          boundaryEvent = elementFactory.createShape({
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:EscalationEventDefinition',
            host: task
          });

      // then
      expectCanCreate([ task, boundaryEvent ], 'Process', true);
    }));
  });


  describe('copy elements', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('copy task', inject(function(elementFactory) {

      // given
      var task1 = elementFactory.createShape({ type: 'bpmn:Task' });

      // then
      expectCanCopy(task1, [ task1 ], true);
    }));


    it('copy label', inject(function(elementFactory) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' }),
          label = elementFactory.createLabel({ labelTarget: task });

      // then
      // copying labels should always be allowed
      expectCanCopy(label, [], true);
    }));


    it('copy lane with parent participant', inject(function(elementFactory) {

      // given
      var participant = elementFactory.createShape({ type: 'bpmn:Participant' }),
          lane = elementFactory.createShape({ type: 'bpmn:Lane', parent: participant });

      // then
      expectCanCopy(lane, [ participant ], true);
    }));


    it('copy lane without parent participant', inject(function(elementFactory) {

      // given
      var participant = elementFactory.createShape({ type: 'bpmn:Participant' }),
          lane = elementFactory.createShape({ type: 'bpmn:Lane', parent: participant });

      // then
      expectCanCopy(lane, [], false);
    }));


    it('copy boundary event with host', inject(function(elementFactory) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' }),
          boundaryEvent = elementFactory.createShape({ type: 'bpmn:BoundaryEvent', host: task });

      // then
      expectCanCopy(boundaryEvent, [ task ], true);
    }));


    it('copy boundary event without host', inject(function(elementFactory) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' }),
          boundaryEvent = elementFactory.createShape({ type: 'bpmn:BoundaryEvent', host: task });

      // then
      expectCanCopy(boundaryEvent, [ boundaryEvent ], true);
    }));

  });


  describe('on process diagram', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> Task', inject(function() {

      expectCanConnect('StartEvent_None', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> TextAnnotation', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task -> IntermediateThrowEvent_Link', inject(function() {

      expectCanConnect('Task', 'IntermediateThrowEvent_Link', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Link -> EndEvent_None', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Link', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> IntermediateCatchEvent_Link', inject(function() {

      expectCanConnect('StartEvent_None', 'IntermediateCatchEvent_Link', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect IntermediateCatchEvent_Link -> Task', inject(function() {

      expectCanConnect('IntermediateCatchEvent_Link', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('drop TextAnnotation -> Process', inject(function() {

      expectCanDrop('TextAnnotation', 'Process', true);
    }));


    it('drop TextAnnotation -> SubProcess', inject(function() {

      expectCanDrop('TextAnnotation', 'SubProcess', true);
    }));


    it('drop Start Event -> Collapsed Sub Process', function() {

      expectCanDrop('StartEvent_None', 'CollapsedSubProcess', false);
    });


    it('connect DataObjectReference -> StartEvent_None', inject(function() {

      expectCanConnect('DataObjectReference', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> DataObjectReference', inject(function() {

      expectCanConnect('StartEvent_None', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> EndEvent_None', inject(function() {

      expectCanConnect('DataObjectReference', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect EndEvent_None -> DataObjectReference', inject(function() {

      expectCanConnect('EndEvent_None', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect Task -> DataObjectReference', inject(function() {

      expectCanConnect('Task', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> Task', inject(function() {

      expectCanConnect('DataObjectReference', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect SubProcess -> DataObjectReference', inject(function() {

      expectCanConnect('SubProcess', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> SubProcess', inject(function() {

      expectCanConnect('DataObjectReference', 'SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect DataStoreReference -> StartEvent_None', inject(function() {

      expectCanConnect('DataStoreReference', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect DataObjectReference -> TextAnnotation', inject(function() {

      expectCanConnect('DataObjectReference', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect TextAnnotation -> DataObjectReference', inject(function() {

      expectCanConnect('TextAnnotation', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect DataStoreReference -> TextAnnotation', inject(function() {

      expectCanConnect('DataStoreReference', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect TextAnnotation -> DataStoreReference', inject(function() {

      expectCanConnect('TextAnnotation', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> DataStoreReference', inject(function() {

      expectCanConnect('StartEvent_None', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> EndEvent_None', inject(function() {

      expectCanConnect('DataStoreReference', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect EndEvent_None -> DataStoreReference', inject(function() {

      expectCanConnect('EndEvent_None', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect Task -> DataStoreReference', inject(function() {

      expectCanConnect('Task', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> Task', inject(function() {

      expectCanConnect('DataStoreReference', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect SubProcess -> DataStoreReference', inject(function() {

      expectCanConnect('SubProcess', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> SubProcess', inject(function() {

      expectCanConnect('DataStoreReference', 'SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect Task -> Task', inject(function() {

      expectCanConnect('Task', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));

  });


  describe('boundary events', function() {

    var testXML = require('./BpmnRules.boundaryEvent.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect BoundaryEvent_on_SubProcess -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> ExclusiveGateway', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'ExclusiveGateway', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> SubProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'SubProcess', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_on_Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_on_Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> StartEvent_None', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('StartEvent_None', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_nested -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_nested -> EndEvent_nested', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'EndEvent_nested', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> Task_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect Task_in_OtherProcess -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('Task_in_OtherProcess', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('drop BoundaryEvent -> Task', function() {
      expectCanDrop('BoundaryEvent_on_SubProcess', 'Task_in_OtherProcess', false);
    });
  });


  describe('event based gateway', function() {

    describe('EventBasedGateway -> EventBasedGateway targets', function() {

      var testXML = require('./BpmnRules.eventBasedGatewayBasic.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
          sequenceFlow: true,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> IntermediateCatchEvent_Signal', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Signal', {
          sequenceFlow: true,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> IntermediateCatchEvent_Condition', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Condition', {
          sequenceFlow: true,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> IntermediateCatchEvent_Timer', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Timer', {
          sequenceFlow: true,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> IntermediateCatchEvent', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> IntermediateThrowEvent_Message', inject(function() {

        expectCanConnect('EventBasedGateway', 'IntermediateThrowEvent_Message', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> ReceiveTask', inject(function() {

        expectCanConnect('EventBasedGateway', 'ReceiveTask', {
          sequenceFlow: true,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> Task_None', inject(function() {

        expectCanConnect('EventBasedGateway', 'Task_None', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));


      it('connect EventBasedGateway -> ParallelGateway', inject(function() {

        expectCanConnect('EventBasedGateway', 'ParallelGateway', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      }));

    });

    describe('Task -> EventBasedGateway target with incoming sequence flow', function() {

      var testXML = require('./BpmnRules.eventBasedGatewayConfiguration.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));

      it('connect Task -> ReceiveTask', function() {

        expectCanConnect('Task', 'ReceiveTask', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });


      it('connect Task -> IntermediateCatchEvent_Message', function() {

        expectCanConnect('Task', 'IntermediateCatchEvent_Message', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });


      it('connect Task -> IntermediateCatchEvent_Timer', function() {

        expectCanConnect('Task', 'IntermediateCatchEvent_Timer', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });


      it('connect Task -> IntermediateCatchEvent_Condition', function() {

        expectCanConnect('Task', 'IntermediateCatchEvent_Condition', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });


      it('connect Task -> IntermediateCatchEvent_Signal', function() {

        expectCanConnect('Task', 'IntermediateCatchEvent_Signal', {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });

    });
  });


  describe('compensation', function() {

    var testXML = require('./BpmnRules.compensation.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect CompensationBoundary -> Task', inject(function() {

      expectCanConnect('CompensationBoundary', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect CompensationBoundary -> TaskForCompensation', inject(function() {

      expectCanConnect('CompensationBoundary', 'TaskForCompensation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect CompensationBoundary -> Gateway', inject(function() {

      expectCanConnect('CompensationBoundary', 'Gateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect CompensationBoundary -> IntermediateEvent', inject(function() {

      expectCanConnect('CompensationBoundary', 'IntermediateEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect Task -> TaskForCompensation', inject(function() {

      expectCanConnect('Task', 'TaskForCompensation', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect TaskForCompensation -> Task', inject(function() {

      expectCanConnect('TaskForCompensation', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));

  });


  describe('compensation in collaboration', function() {

    var testXML = require('./BpmnRules.compensation-collaboration.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect CompensationTask -> CollapsedPool', inject(function() {

      expectCanConnect('CompensationTask', 'CollapsedPool', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect CollapsedPool -> CompensationTask', inject(function() {

      expectCanConnect('CollapsedPool', 'CompensationTask', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));

  });


  describe('on collaboration diagram', function() {

    var testXML = require('./BpmnRules.collaboration.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> IntermediateEvent', inject(function() {

      expectCanConnect('StartEvent_None', 'IntermediateThrowEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> StartEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect OtherParticipant -> StartEvent_Timer', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Timer', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect OtherParticipant -> StartEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Message', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect EndEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_Cancel -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Cancel', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> EndEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Signal -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Signal', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> IntermediateThrowEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect Task_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('Task_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_None_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> Task_in_SubProcess', inject(function() {

      expectCanConnect('OtherParticipant', 'Task_in_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect Participant -> OtherParticipant', inject(function() {

      expectCanConnect('Participant', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> TextAnnotation_OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation_OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('drop TextAnnotation_Global -> Participant', inject(function() {
      expectCanDrop('TextAnnotation_Global', 'Participant', true);
    }));


    it('drop DataStoreReference -> Collaboration', function() {
      expectCanDrop('DataStoreReference', 'Collaboration', true);
    });


    it('drop element -> collapsed Participant', inject(function() {
      expectCanDrop('StartEvent_None', 'CollapsedParticipant', false);
      expectCanDrop('SubProcess', 'CollapsedParticipant', false);
      expectCanDrop('Task_in_SubProcess', 'CollapsedParticipant', false);
      expectCanDrop('TextAnnotation_Global', 'CollapsedParticipant', false);
    }));


    describe('drop MessageFlow label', function() {

      var label;

      beforeEach(inject(function(elementRegistry) {
        label = elementRegistry.get('MessageFlow_labeled').label;
      }));


      it('-> MessageFlow', function() {
        expectCanDrop(label, 'MessageFlow_labeled', true);
      });


      it('-> CollapsedParticipant', function() {
        expectCanDrop(label, 'CollapsedParticipant', true);
      });


      it('-> Collaboration', function() {

        // then
        expectCanDrop(label, 'Collaboration', true);
      });


      it('-> Task_in_SubProcess', function() {
        expectCanDrop(label, 'Task_in_SubProcess', true);
      });


      it('-> SequenceFlow', function() {
        expectCanDrop(label, 'SequenceFlow', true);
      });


      it('-> DataOutputAssociation', function() {
        expectCanDrop(label, 'DataOutputAssociation', true);
      });


      it('-> Group', function() {
        expectCanDrop(label, 'Group', true);
      });

    });


    describe('create Group', function() {

      var group;

      beforeEach(inject(function(elementFactory) {
        group = elementFactory.createShape({
          type: 'bpmn:Group',
          x: 413, y: 254
        });
      }));


      it('-> MessageFlow', function() {
        expectCanCreate(group, 'MessageFlow_labeled', true);
      });


      it('-> CollapsedParticipant', function() {
        expectCanCreate(group, 'CollapsedParticipant', true);
      });


      it('-> Collaboration', function() {

        // then
        expectCanCreate(group, 'Collaboration', true);
      });


      it('-> Task_in_SubProcess', function() {
        expectCanCreate(group, 'Task_in_SubProcess', true);
      });


      it('-> SequenceFlow', function() {
        expectCanCreate(group, 'SequenceFlow', true);
      });


      it('-> DataOutputAssociation', function() {
        expectCanCreate(group, 'DataOutputAssociation', true);
      });


      it('-> Group', function() {
        expectCanCreate(group, 'Group', true);
      });

    });


    describe('reject create on Group', function() {

      it('DataStoreReference ->', inject(function(elementFactory) {
        var dataStoreReference = elementFactory.createShape({
          type: 'bpmn:DataStoreReference',
          x: 413, y: 254
        });

        expectCanCreate(dataStoreReference, 'Group', false);
      }));


      it('Task ->', inject(function(elementFactory) {
        var task = elementFactory.createShape({
          type: 'bpmn:Task',
          x: 413, y: 254
        });

        expectCanCreate(task, 'Group', false);
      }));

    });


    describe('reject create on label', function() {

      var label;

      beforeEach(inject(function(elementRegistry) {
        label = elementRegistry.get('MessageFlow_labeled').label;
      }));


      it('DataStoreReference ->', inject(function(elementFactory) {
        var dataStoreReference = elementFactory.createShape({
          type: 'bpmn:DataStoreReference',
          x: 413, y: 254
        });

        expectCanCreate(dataStoreReference, label, false);
      }));


      it('Task ->', inject(function(elementFactory) {
        var task = elementFactory.createShape({
          type: 'bpmn:Task',
          x: 413, y: 254
        });

        expectCanCreate(task, label, false);
      }));

    });

  });


  describe('participants', function() {

    var testXML = require('./BpmnRules.collapsedPools.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect CollapsedPool_A -> CollapsedPool_B', inject(function() {

      expectCanConnect('CollapsedPool_A', 'CollapsedPool_B', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect CollapsedPool_A -> ExpandedPool', inject(function() {

      expectCanConnect('CollapsedPool_A', 'ExpandedPool', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });

    }));


    it('connect ExpandedPool -> CollapsedPool_A', inject(function() {

      expectCanConnect('ExpandedPool', 'CollapsedPool_A', {
        sequenceFlow: false,
        messageFlow: true,
        association: false,
        dataAssociation: false
      });

    }));

  });


  describe('message flows', function() {

    var testXML = require('./BpmnRules.messageFlow.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('drop MessageFlow -> Collaboration', inject(function() {

      expectCanDrop('MessageFlow', 'Collaboration', true);
    }));

  });


  describe('data association move', function() {

    describe('on process diagram', function() {

      var testXML = require('./BpmnRules.dataAssociation.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('move selection including data association', inject(function(elementRegistry) {

        // when
        var elements = [
          elementRegistry.get('Task'),
          elementRegistry.get('DataAssociation'),
          elementRegistry.get('DataObjectReference')
        ];

        // then
        expectCanMove(elements, 'Process', {
          attach: false,
          move: true
        });
      }));

    });


    describe('on sub process', function() {

      var testXML = require('./BpmnRules.subProcess-dataAssociation.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('move task and data association', inject(function(elementRegistry) {

        // when
        var elements = [
          elementRegistry.get('DataInputAssociation'),
          elementRegistry.get('DataOutputAssociation'),
          elementRegistry.get('DataStoreReference'),
          elementRegistry.get('Task')
        ];

        // then
        expectCanMove(elements, 'SubProcess', {
          attach: false,
          move: true
        });
      }));
    });


    describe('on collaboration', function() {

      var testXML = require('./BpmnRules.collaboration-dataAssociation.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('move participant and data association', inject(function(elementRegistry) {

        // when
        var elements = [
          elementRegistry.get('DataInputAssociation'),
          elementRegistry.get('Participant')
        ];

        // then
        expectCanMove(elements, 'Collaboration', {
          attach: false,
          move: true
        });
      }));
    });

  });


  describe('multi selection move', function() {

    var testXML = require('./BpmnRules.multiSelectionPools.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    it('is allowed across pools when parent does not change', inject(function(elementRegistry) {

      // when
      var elements = [
        elementRegistry.get('Task_A'),
        elementRegistry.get('Task_B'),
        elementRegistry.get('MessageFlow_1v3u2fb')
      ];

      var target = 'Participant_1';

      // then
      expectCanMove(elements, target, {
        attach: false,
        move: true
      });
    }));

  });


  describe('event move', function() {

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('attach/move multiple BoundaryEvents -> SubProcess_1', inject(
      function(elementRegistry) {

        // when
        var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
            boundaryEvent2 = elementRegistry.get('BoundaryEvent_2');

        // we assume boundary events and labels
        // to be already filtered during move
        var elements = [ boundaryEvent, boundaryEvent2 ];

        // then
        expectCanMove(elements, 'SubProcess_1', {
          attach: false,
          move: true
        });
      }
    ));


    it('attach/move SubProcess, BoundaryEvent and label -> Process', inject(
      function(elementRegistry) {

        // when
        var subProcess = elementRegistry.get('SubProcess_1'),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
            label = boundaryEvent.label;

        // we assume boundary events and labels
        // to be already filtered during move
        var elements = [ subProcess, boundaryEvent, label ];

        // then
        expectCanMove(elements, 'Process_1', {
          attach: false,
          move: true
        });
      }
    ));

  });


  describe('event attaching', function() {

    var testXML = require('./BpmnRules.attaching.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('should allow to attach attachable events to SubProcess', inject(function(elementRegistry) {

      // given
      var attachableEvents = [
        'IntermediateThrowEvent',
        'MessageCatchEvent',
        'TimerCatchEvent',
        'SignalCatchEvent',
        'ConditionalCatchEvent',
        'IntermediateThrowEventWithConnections'
      ];

      var events = attachableEvents.map(function(eventId) {
        return elementRegistry.get(eventId);
      });

      // then
      events.forEach(function(event) {

        expectCanMove([ event ], 'SubProcess_1', {
          attach: 'attach',
          move: true
        });
      });
    }));


    it('should not allow to attach non-attachable events to SubProcess',
      inject(function(elementRegistry) {

        // given
        var nonAttachableEvents = [
          'MessageThrowEvent',
          'EscalationThrowEvent',
          'LinkCatchEvent',
          'LinkThrowEvent',
          'CompensateThrowEvent',
          'SignalThrowEvent'
        ];

        var events = nonAttachableEvents.map(function(eventId) {
          return elementRegistry.get(eventId);
        });

        // then
        events.forEach(function(event) {

          expectCanMove([ event ], 'SubProcess_1', {
            attach: false,
            move: true
          });
        });
      })
    );
  });


  describe('event create', function() {

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('attach IntermediateEvent to Task', inject(function(elementFactory) {

      // given
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 254
      });

      // then
      expectCanMove([ eventShape ], 'Task_1', {
        attach: 'attach',
        move: false
      });
    }));


    it('not attach IntermediateEvent to CompensationTask', inject(
      function(elementFactory) {

        // given
        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 413, y: 254
        });

        // then
        expectCanMove([ eventShape ], 'CompensationTask', {
          attach: false,
          move: false
        });
      }
    ));


    it('attach IntermediateEvent to SubProcess inner', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');
        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 413, y: 350
        });

        var position = {
          x: subProcessElement.x + subProcessElement.width / 2,
          y: subProcessElement.y + subProcessElement.height / 2
        };

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          subProcessElement,
          null,
          position
        );

        // then
        expect(canAttach).to.be.false;
      }
    ));


    it('attach IntermediateEvent to SubProcess border', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');
        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 0, y: 0
        });

        var position = {
          x: subProcessElement.x + subProcessElement.width / 2,
          y: subProcessElement.y + subProcessElement.height
        };

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          subProcessElement,
          null,
          position
        );

        // then
        expect(canAttach).to.equal('attach');
      }
    ));


    it('not attach IntermediateEvent to compensation activity', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var compensationTask = elementRegistry.get('CompensationTask');
        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 0, y: 0
        });

        var position = {
          x: compensationTask.x + compensationTask.width / 2,
          y: compensationTask.y + compensationTask.height
        };

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          compensationTask,
          null,
          position
        );

        // then
        expect(canAttach).to.be.false;
      }
    ));


    it('not attach IntermediateEvent to ReceiveTask after EventBasedGateway', inject(
      function(canvas, modeling, elementFactory, bpmnRules) {

        // given
        var rootElement = canvas.getRootElement(),
            eventBasedGatewayShape = elementFactory.createShape({ type: 'bpmn:EventBasedGateway' }),
            receiveTaskShape = elementFactory.createShape({ type: 'bpmn:ReceiveTask' }),
            eventShape = elementFactory.createShape({
              type: 'bpmn:IntermediateThrowEvent',
              x: 0, y: 0
            });

        var boundaryPosition = {
          x: 175,
          y: 100 + receiveTaskShape.height
        };

        // when
        modeling.createShape(eventBasedGatewayShape, { x: 100, y: 100 }, rootElement);
        modeling.createShape(receiveTaskShape, { x : 150, y: 100 }, rootElement);
        modeling.connect(eventBasedGatewayShape, receiveTaskShape, {
          type: 'bpmn:SequenceFlow'
        });

        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          receiveTaskShape,
          null,
          boundaryPosition
        );

        // then
        expect(canAttach).to.be.false;
      }
    ));


    it('create IntermediateEvent in SubProcess body', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');
        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 413, y: 250
        });

        var position = {
          x: eventShape.x,
          y: eventShape.y
        };

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          subProcessElement,
          null,
          position
        );

        var canCreate = bpmnRules.canCreate(
          eventShape,
          subProcessElement,
          null,
          position
        );

        // then
        expect(canAttach).to.be.false;
        expect(canCreate).to.be.true;
      }
    ));

  });


  describe('event append', function() {

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('append IntermediateEvent from Task', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1'),
            taskElement = elementRegistry.get('Task_2');

        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 413, y: 250
        });

        var position = {
          x: eventShape.x,
          y: eventShape.y
        };

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          subProcessElement,
          taskElement,
          position
        );

        var canCreate = bpmnRules.canCreate(
          eventShape,
          subProcessElement,
          taskElement,
          position
        );

        // then
        expect(canAttach).to.be.false;
        expect(canCreate).to.be.true;
      }
    ));


    it('append IntermediateEvent from BoundaryEvent', inject(
      function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var boundaryElement = elementRegistry.get('BoundaryEvent_1'),
            taskElement = elementRegistry.get('Task_2');

        var eventShape = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent',
          x: 413, y: 250
        });

        // when
        var canAttach = bpmnRules.canAttach(
          [ eventShape ],
          taskElement,
          boundaryElement
        );

        var canCreate = bpmnRules.canCreate(
          eventShape,
          taskElement,
          boundaryElement
        );

        // then
        expect(canAttach).to.eql('attach');
        expect(canCreate).to.be.false;
      }
    ));

  });


  describe('groups', function() {

    var testXML = require('./BpmnRules.groups.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));

    describe('should resize', function() {

      it('Group', inject(function(bpmnRules, elementRegistry) {

        // given
        var groupElement = elementRegistry.get('Group_1');

        // when
        var canResize = bpmnRules.canResize(groupElement);

        // then
        expect(canResize).to.be.true;
      }));

    });

  });


  describe('lanes', function() {

    var testXML = require('./BpmnRules.collaboration-lanes.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    describe('should add', function() {

      it('Lane -> Participant', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, participantElement);

        // then
        expect(canCreate).to.be.true;
      }));


      it('Lane -> Participant_Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant_Lane');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, participantElement);

        // then
        expect(canCreate).to.be.true;
      }));


      it('[not] Lane -> SubProcess', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, subProcessElement);

        // then
        expect(canCreate).to.be.false;
      }));

    });


    describe('should not allow move', function() {

      it('Lane -> Participant', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ laneElement ], participantElement);

        // then
        expect(canMove).to.be.false;
      }));


      it('Lane -> SubProcess', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ laneElement ], subProcessElement);

        // then
        expect(canMove).to.be.false;
      }));

    });


    describe('should resize', function() {

      it('Lane', inject(function(bpmnRules, elementRegistry) {

        // given
        var laneElement = elementRegistry.get('Lane');

        // when
        var canResize = bpmnRules.canResize(laneElement);

        // then
        expect(canResize).to.be.true;
      }));

    });


    describe('should allow drop', function() {

      it('SubProcess -> Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var element = elementRegistry.get('SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ element ], laneElement);

        // then
        expect(canMove).to.be.true;
      }));


      it('Task_in_SubProcess -> Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var element = elementRegistry.get('Task_in_SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ element ], laneElement);

        // then
        expect(canMove).to.be.true;
      }));

    });

  });


  describe('insert', function() {

    var testXML = require('./BpmnRules.insert.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('insert END -> S1', function() {
      expectCanInsert('END', 'S1', false);
    });

    it('insert START -> S1', function() {
      expectCanInsert('START', 'S1', false);
    });

    it('insert GATEWAY -> S1', function() {
      expectCanInsert('GATEWAY', 'S1', true);
    });

  });


  describe('connect on create', function() {

    var testXML = require('./BpmnRules.connectOnCreate.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('should handle target without parent', inject(function(elementFactory) {

      // given
      var types = [
        'bpmn:Task',
        'bpmn:StartEvent',
        'bpmn:EndEvent',
        'bpmn:Gateway'
      ];

      types.forEach(function(type) {

        // when
        var element = elementFactory.createShape({ type: type });

        // then
        expectCanConnect('Task_A', element, {
          sequenceFlow: false,
          messageFlow: false,
          association: false,
          dataAssociation: false
        });
      });

    }));

  });


  describe('data input / output', function() {

    describe('in process', function() {

      var testXML = require('./BpmnRules.dataInputOutput.process.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('should move', inject(function(elementRegistry) {

        // when
        var elements = [
          'Task',
          'DataInput',
          'DataOutput'
        ];

        // then
        expectCanDrop('DataInput', 'Process', true);
        expectCanDrop('DataOutput', 'Process', true);

        expectCanMove(elements, 'Process', {
          attach: false,
          move: true
        });
      }));

    });


    describe('in collaboration', function() {

      var testXML = require('./BpmnRules.dataInputOutput.collaboration.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('should move', inject(function(elementRegistry) {

        // when
        var elements = [
          'Task',
          'DataInput',
          'DataOutput'
        ];

        // then
        expectCanDrop('DataInput', 'Participant_A', true);
        expectCanDrop('DataInput', 'Participant_B', false);

        expectCanDrop('DataOutput', 'Participant_A', true);
        expectCanDrop('DataOutput', 'Participant_B', false);

        expectCanMove(elements, 'Participant_A', {
          attach: false,
          move: true
        });

        expectCanMove(elements, 'Participant_B', {
          attach: false,
          move: false
        });
      }));

    });

  });


  describe('integration', function() {

    describe('move Lane', function() {

      var testXML = require('./BpmnRules.moveLane.bpmn');

      beforeEach(bootstrapModeler(testXML, { modules: testModules }));


      it('should disallow', inject(function(elementRegistry, rules) {

        // given
        var lane = elementRegistry.get('Lane_1');

        // when
        var result = rules.allowed('elements.move', {
          shapes: [ lane ]
        });

        // then
        expect(result).to.be.false;
      }));

    });

  });


  describe('start connection', function() {

    var testXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('should allow start for given element types', inject(function(elementFactory, rules) {

      // given
      var types = [
        'bpmn:FlowNode',
        'bpmn:InteractionNode',
        'bpmn:DataObjectReference',
        'bpmn:DataStoreReference'
      ];

      // when
      var results = types.map(function(type) {
        var element = elementFactory.createShape({ type: type });
        return rules.allowed('connection.start', { source: element });
      });

      // then
      results.forEach(function(result) {
        expect(result).to.be.true;
      });
    }));


    it('should ignore label elements', inject(function(elementFactory, rules) {

      // given
      var label = elementFactory.createShape({ type: 'bpmn:FlowNode', labelTarget: {} });

      // when
      var result = rules.allowed('connection.start', { source: label });

      // then
      expect(result).to.be.null;
    }));


    it('should NOT allow start on unknown element', inject(function(rules) {

      // given
      var element = { type: 'bpmn:SomeUnknownType' };

      // when
      var result = rules.allowed('connection.start', { source: element });

      // then
      expect(result).to.be.false;
    }));

  });

});
