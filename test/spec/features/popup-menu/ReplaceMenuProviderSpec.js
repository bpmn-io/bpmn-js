import { expectToBeAccessible } from '@bpmn-io/a11y';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createEvent as globalEvent
} from '../../../util/MockEvents';

import autoResizeModule from 'lib/features/auto-resize';
import coreModule from 'lib/core';
import customRulesModule from '../../../util/custom-rules';
import modelingModule from 'lib/features/modeling';
import replaceMenuProviderModule from 'lib/features/popup-menu';

import camundaModdleModule from 'camunda-bpmn-moddle/lib';
import camundaPackage from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import { is } from 'lib/util/ModelUtil';

import { isExpanded } from 'lib/util/DiUtil';
import { getBusinessObject } from '../../../../lib/util/ModelUtil';
import { omit } from 'min-dash';


describe('features/popup-menu - replace menu provider', function() {

  var diagramXMLMarkers = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn'),
      diagramXMLReplace = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn'),
      diagramXMLDataElements = require('../../../fixtures/bpmn/features/replace/data-elements.bpmn'),
      diagramXMLDataStoresPositionedAgainstParticipant = require('../../../fixtures/bpmn/features/replace/data-stores-positioned-against-participant.bpmn'),
      diagramXMLParticipants = require('../../../fixtures/bpmn/features/replace/participants.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    replaceMenuProviderModule,
    customRulesModule
  ];


  describe('data object - collection marker', function() {

    beforeEach(bootstrapModeler(diagramXMLDataElements, { modules: testModules }));


    it('should toggle on', inject(function(elementRegistry) {

      // given
      var dataObjectReference = elementRegistry.get('DataObjectReference_1');

      openPopup(dataObjectReference);

      // when
      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.true;
      expect(dataObjectReference.businessObject.dataObjectRef.isCollection).to.be.true;
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      var dataObjectReference = elementRegistry.get('DataObjectReference_1');

      openPopup(dataObjectReference);

      triggerAction('toggle-is-collection');

      // when
      commandStack.undo();

      openPopup(dataObjectReference);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.false;
      expect(dataObjectReference.businessObject.dataObjectRef.isCollection).not.to.be.true;
    }));


    it('should redo', inject(function(commandStack, elementRegistry) {

      // given
      var dataObjectReference = elementRegistry.get('DataObjectReference_1');

      openPopup(dataObjectReference);

      triggerAction('toggle-is-collection');

      commandStack.undo();

      // when
      commandStack.redo();

      openPopup(dataObjectReference);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.true;
      expect(dataObjectReference.businessObject.dataObjectRef.isCollection).to.be.true;
    }));


    it('should toggle off', inject(function(elementRegistry) {

      // given
      var dataObjectReference = elementRegistry.get('DataObjectReference_1');

      openPopup(dataObjectReference);

      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference);

      // when
      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.false;
      expect(dataObjectReference.businessObject.dataObjectRef.isCollection).to.be.false;
    }));


    it('should activate marker of linked data object reference', inject(function(elementRegistry) {

      // given
      var dataObjectReference1 = elementRegistry.get('DataObjectReference_1');
      var dataObjectReference2 = elementRegistry.get('DataObjectReference_2');

      openPopup(dataObjectReference1);

      // when
      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference2);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.true;
    }));


    it('should deactivate marker of linked data object reference', inject(function(elementRegistry) {

      // given
      var dataObjectReference1 = elementRegistry.get('DataObjectReference_1');
      var dataObjectReference2 = elementRegistry.get('DataObjectReference_2');

      openPopup(dataObjectReference1);

      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference1);

      // when
      triggerAction('toggle-is-collection');

      openPopup(dataObjectReference2);

      var isCollectionMarker = queryEntry('toggle-is-collection');

      // then
      expect(domClasses(isCollectionMarker).has('active')).to.be.false;
    }));

  });


  describe('participants - multiplicity marker', function() {

    beforeEach(bootstrapModeler(diagramXMLParticipants, { modules: testModules }));


    it('should toggle on', inject(function(elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');

      openPopup(participant);

      // when
      triggerAction('toggle-participant-multiplicity');

      openPopup(participant);

      var multiplicityMarker = queryEntry('toggle-participant-multiplicity');

      // then
      expect(domClasses(multiplicityMarker).has('active')).to.be.true;
      expect(participant.businessObject.participantMultiplicity).to.exist;
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');

      openPopup(participant);

      triggerAction('toggle-participant-multiplicity');

      // when
      commandStack.undo();

      openPopup(participant);

      var multiplicityMarker = queryEntry('toggle-participant-multiplicity');

      // then
      expect(domClasses(multiplicityMarker).has('active')).to.be.false;
      expect(participant.businessObject.participantMultiplicity).not.to.exist;
    }));


    it('should redo', inject(function(commandStack, elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');

      openPopup(participant);

      triggerAction('toggle-participant-multiplicity');

      commandStack.undo();

      // when
      commandStack.redo();

      openPopup(participant);

      var multiplicityMarker = queryEntry('toggle-participant-multiplicity');

      // then
      expect(domClasses(multiplicityMarker).has('active')).to.be.true;
      expect(participant.businessObject.participantMultiplicity).to.exist;
    }));


    it('should toggle off', inject(function(elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');

      openPopup(participant);

      triggerAction('toggle-participant-multiplicity');

      openPopup(participant);

      // when
      triggerAction('toggle-participant-multiplicity');

      openPopup(participant);

      var multiplicityMarker = queryEntry('toggle-participant-multiplicity');

      // then
      expect(domClasses(multiplicityMarker).has('active')).to.be.false;
      expect(participant.businessObject.participantMultiplicity).not.to.exist;
    }));

  });


  describe('toggle', function() {

    beforeEach(bootstrapModeler(diagramXMLMarkers,{
      modules: Object.assign(testModules, camundaModdleModule),
      moddleExtensions: {
        camunda: camundaPackage
      }
    }));

    var toggleActive;

    beforeEach(inject(function(popupMenu) {
      toggleActive = function(entryCls) {
        return popupMenu._getEntry(entryCls).active;
      };
    }));


    describe('active attribute', function() {

      it('should be true for parallel marker', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // assume
        expect(loopCharacteristics.isSequential).to.be.false;
        expect(loopCharacteristics.isSequential).to.exist;

        // when
        openPopup(task);

        // then
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;

        expect(toggleActive('toggle-parallel-mi')).to.be.true;
      }));


      it('should be true for sequential marker', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // assume
        expect(loopCharacteristics.isSequential).to.be.true;
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-sequential-mi')).to.be.true;
      }));


      it('should be true for loop marker', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // assume
        expect(loopCharacteristics.isSequential).not.to.exist;
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.false;

        // when
        openPopup(task);

        // then
        expect(toggleActive('toggle-loop')).to.be.true;
      }));

    });


    describe('parallel toggle button', function() {

      it('should toggle parallel marker off',
        inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('ParallelTask');

          openPopup(task);

          // when
          triggerAction('toggle-parallel-mi');

          openPopup(task);

          var parallelEntry = queryEntry('toggle-parallel-mi');

          // then
          expect(task.businessObject.loopCharacteristics).not.to.exist;
          expect(domClasses(parallelEntry).has('active')).to.be.false;
        })
      );


      it('should toggle parallel marker on', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        // when
        triggerAction('toggle-parallel-mi');

        openPopup(task);

        var parallelEntry = queryEntry('toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.true;
        expect(task.businessObject.loopCharacteristics.isSequential).to.be.false;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      }));


      it('should set sequential button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        // when
        triggerAction('toggle-parallel-mi');

        openPopup(task);

        var sequentialEntry = queryEntry('toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should set loop button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        // when
        triggerAction('toggle-parallel-mi');

        openPopup(task);

        var loopEntry = queryEntry('toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
      }));


      it('should set loop characteristics type', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask'),
            businessObject = getBusinessObject(task);

        openPopup(task);

        // when
        triggerAction('toggle-parallel-mi');

        // then
        var newLoopCharacteristics = businessObject.loopCharacteristics;

        expect(is(newLoopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
        expect(newLoopCharacteristics.isSequential).to.be.false;
      }));


      it('should keep sequential properties', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask'),
            businessObject = getBusinessObject(task),
            loopCharacteristics = businessObject.get('loopCharacteristics');

        openPopup(task);

        // assume
        expect(loopCharacteristics.get('isSequential')).to.be.true;

        // when
        triggerAction('toggle-parallel-mi');

        // then
        const newLoopCharacteristics = businessObject.get('loopCharacteristics');

        expect(newLoopCharacteristics).to.equal(loopCharacteristics);
        expect(newLoopCharacteristics.get('isSequential')).to.be.false;
        expect(omit(newLoopCharacteristics, 'isSequential')).to.eql(omit(loopCharacteristics, 'isSequential'));
      }));

    });


    describe('sequential toggle button', function() {

      it('should toggle sequential marker off', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        openPopup(task);

        var sequentialEntry = queryEntry('toggle-sequential-mi');

        // then
        expect(task.businessObject.loopCharacteristics).not.to.exist;
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should toggle sequential marker on', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        openPopup(task);

        var sequentialEntry = queryEntry('toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.true;
        expect(task.businessObject.loopCharacteristics.isSequential).to.be.true;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      }));


      it('should set loop button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        openPopup(task);

        var loopEntry = queryEntry('toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
      }));


      it('should set parallel button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        openPopup(task);

        var parallelEntry = queryEntry('toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));


      it('should set loop characteristics type', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask'),
            businessObject = getBusinessObject(task);

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        // then
        var newLoopCharacteristics = businessObject.loopCharacteristics;

        expect(is(newLoopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
        expect(newLoopCharacteristics.isSequential).to.be.true;
      }));


      it('should keep parallel properties', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask'),
            businessObject = getBusinessObject(task),
            loopCharacteristics = businessObject.get('loopCharacteristics');

        openPopup(task);

        // assume
        expect(loopCharacteristics.get('isSequential')).to.be.false;

        // when
        triggerAction('toggle-sequential-mi');

        // then
        var newLoopCharacteristics = businessObject.get('loopCharacteristics');

        expect(newLoopCharacteristics).to.equal(loopCharacteristics);
        expect(newLoopCharacteristics.get('isSequential')).to.be.true;
        expect(omit(newLoopCharacteristics, 'isSequential')).to.eql(omit(loopCharacteristics, 'isSequential'));
      }));

    });


    describe('loop toggle button', function() {

      it('should toggle loop marker off', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('LoopTask');

        openPopup(task);

        // when
        triggerAction('toggle-loop');

        openPopup(task);

        var loopEntry = queryEntry('toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.false;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).not.to.exist;
      }));


      it('should toggle loop marker on', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task');

        openPopup(task);

        // when
        triggerAction('toggle-loop');

        openPopup(task);

        var loopEntry = queryEntry('toggle-loop');

        // then
        expect(domClasses(loopEntry).has('active')).to.be.true;
        expect(is(task.businessObject.loopCharacteristics, 'bpmn:StandardLoopCharacteristics')).to.be.true;
      }));


      it('should set sequential button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        triggerAction('toggle-loop');

        // when
        openPopup(task);

        var sequentialEntry = queryEntry('toggle-sequential-mi');

        // then
        expect(domClasses(sequentialEntry).has('active')).to.be.false;
      }));


      it('should set parallel button inactive', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        // when
        triggerAction('toggle-loop');

        openPopup(task);

        var parallelEntry = queryEntry('toggle-parallel-mi');

        // then
        expect(domClasses(parallelEntry).has('active')).to.be.false;
      }));


      it('should set loop characteristics type', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask'),
            businessObject = getBusinessObject(task);

        openPopup(task);

        // when
        triggerAction('toggle-loop');

        // then
        var newLoopCharacteristics = businessObject.loopCharacteristics;

        expect(is(newLoopCharacteristics, 'bpmn:StandardLoopCharacteristics')).to.be.true;
        expect(newLoopCharacteristics.isSequential).to.be.undefined;
      }));
    });


    describe('non-interrupting toggle', function() {
      beforeEach(bootstrapModeler(diagramXMLReplace,{
        modules: Object.assign(testModules, camundaModdleModule),
        moddleExtensions: {
          camunda: camundaPackage
        }
      }));

      describe('start events', function() {

        it('should toggle non-interrupting marker off', inject(function(bpmnReplace, elementRegistry) {

          // given
          var event = elementRegistry.get('StartEvent_3');

          openPopup(event);

          // when
          triggerAction('toggle-non-interrupting');

          openPopup(event);

          var nonInterruptingEntry = queryEntry('toggle-non-interrupting');

          // then
          expect(event.businessObject.isInterrupting).to.be.true;
          expect(domClasses(nonInterruptingEntry).has('active')).to.be.false;
        }));


        it('should toggle non-interrupting marker on', inject(function(bpmnReplace, elementRegistry) {

          // given
          var event = elementRegistry.get('StartEvent_6');

          openPopup(event);

          // when
          triggerAction('toggle-non-interrupting');

          openPopup(event);

          var nonInterruptingEntry = queryEntry('toggle-non-interrupting');

          // then
          expect(event.businessObject.isInterrupting).to.be.false;
          expect(domClasses(nonInterruptingEntry).has('active')).to.be.true;
        }));

      });


      describe('boundary events', function() {

        it('should toggle non-interrupting marker off', inject(function(bpmnReplace, elementRegistry) {

          // given
          var event = elementRegistry.get('BoundaryEvent_1');

          openPopup(event);

          // when
          triggerAction('toggle-non-interrupting');

          openPopup(event);

          var nonInterruptingEntry = queryEntry('toggle-non-interrupting');

          // then
          expect(event.businessObject.cancelActivity).to.be.true;
          expect(domClasses(nonInterruptingEntry).has('active')).to.be.false;
        }));


        it('should toggle non-interrupting marker on', inject(function(bpmnReplace, elementRegistry) {

          // given
          var event = elementRegistry.get('BoundaryEvent_2');

          openPopup(event);

          // when
          triggerAction('toggle-non-interrupting');

          openPopup(event);

          var nonInterruptingEntry = queryEntry('toggle-non-interrupting');

          // then
          expect(event.businessObject.cancelActivity).to.be.false;
          expect(domClasses(nonInterruptingEntry).has('active')).to.be.true;
        }));

      });

    });


    describe('integration', function() {

      it('should toggle sequential -> undo to parallel', inject(function(elementRegistry, commandStack) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        // when
        triggerAction('toggle-sequential-mi');

        commandStack.undo();

        // then
        const bo = getBusinessObject(task),
              loopCharacteristics = bo.get('loopCharacteristics');

        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
        expect(loopCharacteristics.isSequential).to.be.false;
      }));


      it('should toggle parallel -> undo to parallel', inject(function(elementRegistry, commandStack) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        // when
        triggerAction('toggle-parallel-mi');

        commandStack.undo();

        // then
        const bo = getBusinessObject(task),
              loopCharacteristics = bo.get('loopCharacteristics');

        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
        expect(loopCharacteristics.isSequential).to.be.false;
      }));


      it('should toggle loop -> undo to parallel', inject(function(elementRegistry, commandStack) {

        // given
        var task = elementRegistry.get('ParallelTask');

        openPopup(task);

        // when
        triggerAction('toggle-loop');

        commandStack.undo();

        // then
        const bo = getBusinessObject(task),
              loopCharacteristics = bo.get('loopCharacteristics');

        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
        expect(loopCharacteristics.isSequential).to.be.false;
      }));
    });

  });


  describe('replacing', function() {

    beforeEach(bootstrapModeler(diagramXMLMarkers, { modules: testModules }));

    it('should retain the loop characteristics', inject(function(elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask');

      openPopup(task);

      // when
      // replacing the task with a send task
      var sendTask = triggerAction('replace-with-send-task');

      // then
      expect(sendTask.businessObject.loopCharacteristics).to.exist;
      expect(sendTask.businessObject.loopCharacteristics.isSequential).to.be.true;
      expect(is(sendTask.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
    }));


    it('should retain the loop characteristics for call activites',
      inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('SequentialTask');

        openPopup(task);

        // when
        // replacing the task with a call activity
        var callActivity = triggerAction('replace-with-call-activity');

        // then
        expect(callActivity.businessObject.loopCharacteristics).to.exist;
        expect(callActivity.businessObject.loopCharacteristics.isSequential).to.be.true;
        expect(is(callActivity.businessObject.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;
      })
    );


    it('should retain expanded status for sub processes',
      inject(function(elementRegistry) {

        // given
        var subProcess = elementRegistry.get('SubProcess');

        openPopup(subProcess);

        // when
        // replacing the expanded sub process with a transaction
        var transaction = triggerAction('replace-with-transaction');

        // then
        expect(isExpanded(transaction)).to.equal(isExpanded(subProcess));
      })
    );


    it('should replace sub processes -> event sub process',
      inject(function(elementRegistry) {

        // given
        var subProcess = elementRegistry.get('SubProcess');

        openPopup(subProcess);

        // when
        // replacing the expanded sub process with a eventSubProcess
        var eventSubProcess = triggerAction('replace-with-event-subprocess');

        // then
        expect(eventSubProcess.businessObject.triggeredByEvent).to.be.true;
      })
    );


    it('should replace event sub processes -> sub process',
      inject(function(elementRegistry) {

        // given
        var eventSubProcess = elementRegistry.get('EventSubProcess');

        openPopup(eventSubProcess);

        // when
        // replacing the expanded sub process with a eventSubProcess
        var subProcess = triggerAction('replace-with-subprocess');

        // then
        expect(subProcess.businessObject.triggeredByEvent).to.be.false;
      })
    );


    it('should retain the loop characteristics and the expanded status for transactions',
      inject(function(elementRegistry) {

        // given
        var transaction = elementRegistry.get('Transaction');

        openPopup(transaction);

        // when
        // replacing the transaction with an expanded sub process
        var subProcess = triggerAction('replace-with-subprocess');

        // then
        expect(isExpanded(subProcess)).to.equal(isExpanded(transaction));
      })
    );


    it('should not retain the loop characteristics morphing to an event sub process',
      inject(function(bpmnFactory, elementRegistry, modeling) {

        // given
        var transaction = elementRegistry.get('Transaction');

        modeling.updateProperties(transaction, {
          loopCharacteristics: bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', {
            isParallel: true
          })
        });

        openPopup(transaction);

        // when
        // replacing the transaction with an event sub process
        var subProcess = triggerAction('replace-with-event-subprocess');

        // then
        expect(isExpanded(subProcess)).to.equal(isExpanded(transaction));
      })
    );


    it('should retain the expanded property morphing to an event sub processes',
      inject(function(elementRegistry) {

        // given
        var transaction = elementRegistry.get('Transaction');

        openPopup(transaction);

        // when
        // replacing the transaction with an expanded sub process
        var eventSubProcess = triggerAction('replace-with-event-subprocess');

        // then
        expect(isExpanded(eventSubProcess)).to.equal(isExpanded(transaction));
      })
    );


    it('should replace sub processes -> ad hoc sub process',
      inject(function(elementRegistry) {

        // given
        var subprocess = elementRegistry.get('SubProcess');

        openPopup(subprocess);

        // when
        var adHocSubProcess = triggerAction('replace-with-ad-hoc-subprocess');

        // then
        expect(adHocSubProcess.type).to.equal('bpmn:AdHocSubProcess');
      })
    );

  });


  describe('replace menu', function() {

    describe('events', function() {

      beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));

      it('should contain all except the current one',
        inject(function(elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1');

          // when
          openPopup(startEvent);

          // then
          expect(queryEntry('replace-with-none-start')).to.be.null;
          expect(queryBodyEntries()).to.have.length(6);
        })
      );


      it('should contain all start events inside event sub process except the current one',
        inject(function(elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3');

          // when
          openPopup(startEvent);

          // then
          expect(queryEntry('replace-with-non-interrupting-message-start')).to.be.null;
          expect(queryEntry('replace-with-message-start')).to.exist;

          expect(queryBodyEntries()).to.have.length(14);
        })
      );


      it('should contain all non interrupting start events inside event sub process except the current one',
        inject(function(bpmnReplace, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3');

          var newElement = bpmnReplace.replaceElement(startEvent, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:ConditionalEventDefinition',
            isInterrupting: false
          });

          // when
          openPopup(newElement);

          // then
          expect(queryEntry('replace-with-conditional-start')).to.exist;
          expect(queryEntry('replace-with-non-interrupting-conditional-start')).to.be.null;

          expect(queryBodyEntries()).to.have.length(12);
        })
      );


      it('should include non-interrupting toggle for non interrupting start event',
        inject(function(elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3');

          // when
          openPopup(startEvent);

          // then
          expect(queryEntry('toggle-non-interrupting')).to.exist;
        })
      );


      it('should include non-interrupting toggle for interrupting start event',
        inject(function(elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_6');

          // when
          openPopup(startEvent);

          // then
          expect(queryEntry('toggle-non-interrupting')).to.exist;
        })
      );


      it('should NOT include non-interrupting toggle for start events that must be interrupting',
        inject(function(bpmnReplace, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3');

          var newElement = bpmnReplace.replaceElement(startEvent, {
            type: 'bpmn:StartEvent'
          });

          // when
          openPopup(newElement);

          // then
          expect(queryEntry('toggle-non-interrupting')).not.to.exist;
        })
      );


      it('should contain only start event, end event and intermediate throw event inside sub process except the current one',
        inject(function(elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_2');

          // when
          openPopup(startEvent);

          // then
          expect(queryEntry('replace-with-message-start')).to.be.null;
          expect(queryEntry('replace-with-none-end')).to.exist;
          expect(queryEntry('replace-with-none-intermediate-throwing')).to.exist;

          expect(queryBodyEntries()).to.have.length(2);
        })
      );


      it('should contain all intermediate events except the current one',
        inject(function(elementRegistry) {

          // given
          var intermediateEvent = elementRegistry.get('IntermediateThrowEvent_1');

          // when
          openPopup(intermediateEvent);

          // then
          expect(queryEntry('replace-with-none-intermediate-throw')).to.be.null;

          expect(queryBodyEntries()).to.have.length(12);
        })
      );


      it('should contain all end events except the current one',
        inject(function(elementRegistry) {

          // given
          var endEvent = elementRegistry.get('EndEvent_1');

          // when
          openPopup(endEvent);

          // then
          expect(queryEntry('replace-with-none-end')).to.be.null;

          expect(queryBodyEntries()).to.have.length(8);
        })
      );


      it('should show corresponding "non-interrupting" event',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('StartEvent_6');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-message-start')).to.be.null;
          expect(queryEntry('replace-with-non-interrupting-message-start')).exist;
        })
      );


      it('should show corresponding variants for a timer event',
        inject(function(elementRegistry) {

          // given
          var timerStartEvent = elementRegistry.get('StartEvent_4');

          // when
          openPopup(timerStartEvent);

          // then
          expect(queryEntry('replace-with-timer-start')).to.be.null;
          expect(queryEntry('replace-with-timer-intermediate-catch')).exist;
        })
      );


      it('should show corresponding variants for a message event',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('StartEvent_5');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-message-start')).to.be.null;
          expect(queryEntry('replace-with-message-intermediate-catch')).exist;
          expect(queryEntry('replace-with-message-intermediate-throw')).exist;
          expect(queryEntry('replace-with-message-end')).exist;
        })
      );


      it('should show corresponding variants for a compensation event',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('CompensationEvent');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-compensation-start')).to.be.null;
          expect(queryEntry('replace-with-compensation-intermediate-throw')).to.be.null;
          expect(queryEntry('replace-with-compensation-end')).exist;
        })
      );


      it('should show corresponding variants for a conditional event',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('ConditionalEvent');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-conditional-start')).exist;
          expect(queryEntry('replace-with-conditional-intermediate-catch')).to.be.null;
        })
      );


      it('should show corresponding variants for an error event',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('ErrorEvent');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-error-start')).exist;
          expect(queryEntry('replace-with-error-end')).to.be.null;
        })
      );


      it('should NOT show corresponding start event variants for a message event in subprocess',
        inject(function(elementRegistry) {

          // given
          var messageStartEvent = elementRegistry.get('IntermediateCatchMessageEvent');

          // when
          openPopup(messageStartEvent);

          // then
          expect(queryEntry('replace-with-message-start')).to.be.null;
          expect(queryEntry('replace-with-message-intermediate-catch')).to.be.null;
          expect(queryEntry('replace-with-message-intermediate-throw')).exist;
          expect(queryEntry('replace-with-message-end')).exist;
        })
      );

    });


    describe('cancel event definition', function() {

      var diagramXML = require('../../../fixtures/bpmn/features/replace/cancel-events.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      describe('for end events', function() {

        it('should contain cancel event replace option in transaction',
          inject(function(elementRegistry) {

            // given
            var endEvent = elementRegistry.get('EndEvent_3');

            // when
            openPopup(endEvent);

            // then
            expect(queryBodyEntries()).to.have.length(11);

            expect(queryEntry('replace-with-cancel-end')).to.exist;
          })
        );


        it('should NOT contain cancel event replace option in transaction when already set',
          inject(function(elementRegistry) {

            // given
            var endEvent = elementRegistry.get('EndEvent_1');

            // when
            openPopup(endEvent);

            // then
            expect(queryBodyEntries()).to.have.length(9);
            expect(queryEntry('replace-with-cancel-end')).to.be.null;
          })
        );


        it('should NOT contain cancel event replace option outside transaction',
          inject(function(elementRegistry) {

            // given
            var endEvent = elementRegistry.get('EndEvent_2');

            // when
            openPopup(endEvent);

            // then
            expect(queryBodyEntries()).to.have.length(8);

            expect(queryEntry('replace-with-cancel-end')).to.be.null;
          })
        );

      });


      describe('for boundary events', function() {

        it('should contain cancel event replace option attachted to Transaction',
          inject(function(elementRegistry) {

            // given
            var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

            // when
            openPopup(boundaryEvent);

            // then
            expect(queryBodyEntries()).to.have.length(13);

            expect(queryEntry('replace-with-cancel-boundary')).to.exist;
          })
        );


        it('should NOT contain cancel event replace option attached to SubProcess',
          inject(function(elementRegistry) {

            // given
            var boundaryEvent = elementRegistry.get('BoundaryEvent_2');

            // when
            openPopup(boundaryEvent);

            // then
            expect(queryBodyEntries()).to.have.length(12);

            expect(queryEntry('replace-with-cancel-boundary')).to.be.null;
          })
        );


        it('should NOT contain cancel event replace option attached to Activity',
          inject(function(elementRegistry) {

            // given
            var boundaryEvent = elementRegistry.get('BoundaryEvent_3');

            // when
            openPopup(boundaryEvent);

            // then
            expect(queryBodyEntries()).to.have.length(12);

            expect(queryEntry('replace-with-cancel-boundary')).to.be.null;
          })
        );

      });

    });


    describe('boundary events', function() {

      beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));

      it('should contain all boundary events (except for cancel and currently active) for an interrupting boundary event',
        inject(function(elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

          // when
          openPopup(boundaryEvent, 40);

          // then
          expect(queryEntry('replace-with-conditional-intermediate-catch')).to.be.null;
          expect(queryEntry('replace-with-cancel-boundary')).to.be.null;
          expect(queryBodyEntries()).to.have.length(11);
        })
      );


      it('should contain all boundary events (except for cancel and currently active) for a non interrupting boundary event',
        inject(function(elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_2');

          // when
          openPopup(boundaryEvent, 40);

          // then
          expect(queryEntry('replace-with-non-interrupting-message-intermediate-catch')).to.be.null;
          expect(queryEntry('replace-with-cancel-boundary')).to.be.null;
          expect(queryBodyEntries()).to.have.length(11);
        })
      );


      it('should contain compensation boundary event',
        inject(function(elementRegistry) {

          // given
          var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

          // when
          openPopup(boundaryEvent, 40);

          // then
          expect(queryEntry('replace-with-compensation-boundary')).to.exist;
        })
      );

    });


    describe('default flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option [gateway]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        // then
        expect(queryBodyEntries()).to.have.length(1);
      }));


      it('should show Default replace option [task]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

        // when
        openPopup(sequenceFlow);

        // then
        expect(queryBodyEntries()).to.have.length(2);
      }));


      it('should NOT show default replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_4');

        // when
        openPopup(sequenceFlow);

        // then
        expect(queryBodyEntries()).to.have.length(0);
      }));

    });


    describe('default flows from inclusive gateways', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlowsFromInclusiveGateways.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry('replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry('replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).not.to.exist;
        expect(defaultFlowEntry).to.exist;
      }));


      it('should NOT show default replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry('replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry('replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.exist;
        expect(defaultFlowEntry).not.to.exist;
      }));

    });


    describe('default flows from complex gateways', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlowsFromComplexGateways.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry('replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry('replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).not.to.exist;
        expect(defaultFlowEntry).to.exist;
      }));


      it('should NOT show default replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry('replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry('replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.exist;
        expect(defaultFlowEntry).not.to.exist;
      }));

    });


    describe('conditional flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show ConditionalFlow replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var conditionalFlowEntry = queryEntry('replace-with-conditional-flow');

        // then
        expect(conditionalFlowEntry).to.exist;

        expect(queryBodyEntries()).to.have.length(2);
      }));


      it('should NOT show ConditionalFlow replace option', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        // then
        expect(queryBodyEntries()).to.have.length(0);
      }));

    });


    describe('compensate activities', function() {

      var diagramXML = require('./ReplaceMenuProvider.compensation-activity.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('options should include subProcesses and callActivity', inject(function(elementRegistry) {

        // given
        var taskElement = elementRegistry.get('Task_1');

        // when
        openPopup(taskElement);

        var callActivityEntry = queryEntry('replace-with-call-activity'),
            subProcessEntry = queryEntry('replace-with-collapsed-subprocess');

        // then
        expect(callActivityEntry).to.exist;
        expect(subProcessEntry).to.exist;
      }));

    });


    describe('subprocesses', function() {

      var diagramXML = require('./ReplaceMenuProvider.subProcesses.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      describe('subprocess', function() {

        it('options do not include subprocess itself', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-subprocess');

          // then
          expect(entry).not.to.exist;
        }));


        it('options include collapsed subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options include ad hoc subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-ad-hoc-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options do not include collapsed ad hoc subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-ad-hoc-subprocess');

          // then
          expect(entry).not.to.exist;
        }));

      });


      describe('ad hoc subprocess', function() {

        it('options do not include ad hoc subprocess itself', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-ad-hoc-subprocess');

          // then
          expect(entry).not.to.exist;
        }));


        it('options include collapsed subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-ad-hoc-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options include subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options do not include collapsed subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-subprocess');

          // then
          expect(entry).not.to.exist;
        }));

      });

    });


    describe('collapsed subprocesses', function() {

      var diagramXML = require('./ReplaceMenuProvider.collapsedSubProcess.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

      describe('collapsed subprocess', function() {

        it('options do not include collapsed subprocess itself', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('Task_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-subprocess');

          // then
          expect(entry).not.to.exist;
        }));


        it('options include collapsed ad hoc subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('Task_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-ad-hoc-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options include expanded subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('Task_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-expanded-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options do not include ad hoc subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('Task_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-ad-hoc-subprocess');

          // then
          expect(entry).not.to.exist;
        }));

      });


      describe('collapsed ad hoc subprocess', function() {

        it('options do not include collapsed ad hoc subprocess itself', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-ad-hoc-subprocess');

          // then
          expect(entry).not.to.exist;
        }));


        it('options include collapsed subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-collapsed-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options include expanded ad hoc subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-ad-hoc-subprocess');

          // then
          expect(entry).to.exist;
        }));


        it('options do not include expanded subprocess', inject(function(elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(collapsedSubProcess);

          var entry = queryEntry('replace-with-subprocess');

          // then
          expect(entry).not.to.exist;
        }));

      });

    });


    describe('pools', function() {

      var diagramXML = require('./ReplaceMenuProvider.pools.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should indicate removing content', inject(function(elementRegistry) {

        // given
        var expandedPool = elementRegistry.get('Participant_1');

        // when
        openPopup(expandedPool);

        var emptyPoolLabel = queryEntryLabel('replace-with-collapsed-pool');

        // then
        expect(emptyPoolLabel).to.exist;
        expect(emptyPoolLabel.textContent).to.eql('Empty pool/participant (removes content)');
      }));


      it('should NOT indicate removing content', inject(function(elementRegistry) {

        // given
        var expandedPool = elementRegistry.get('Participant_2');

        // when
        openPopup(expandedPool);

        var emptyPoolLabel = queryEntryLabel('replace-with-collapsed-pool');

        // then
        expect(emptyPoolLabel).to.exist;
        expect(emptyPoolLabel.textContent).to.eql('Empty pool/participant');
      }));

    });


    describe('data object', function() {

      beforeEach(bootstrapModeler(diagramXMLDataElements, { modules: testModules }));


      it('should only contain data store reference', inject(function(elementRegistry) {

        // given
        var dataObjectReference = elementRegistry.get('DataObjectReference_1');

        // when
        openPopup(dataObjectReference);

        // then
        expect(queryBodyEntries()).to.have.length(1);
        expect(queryEntry('toggle-is-collection')).to.exist;
        expect(queryEntry('replace-with-data-store-reference')).to.exist;
        expect(queryEntry('replace-with-data-object-reference')).to.be.null;
      }));


      it('should handle missing dataObjectRef', inject(function(elementRegistry) {

        // given
        var dataObjectReference = elementRegistry.get('DataObjectReference_NO_DataObject');

        // when
        openPopup(dataObjectReference);

        // then
        expect(queryEntry('toggle-is-collection')).not.to.exist;
      }));

    });


    describe('data store', function() {

      beforeEach(bootstrapModeler(diagramXMLDataElements, { modules: testModules }));


      it('should only contain data object reference', inject(function(elementRegistry) {

        // given
        var dataStoreReference = elementRegistry.get('DataStoreReference_1');

        // when
        openPopup(dataStoreReference);

        // then
        expect(queryBodyEntries()).to.have.length(1);
        expect(queryEntry('toggle-is-collection')).to.be.null;
        expect(queryEntry('replace-with-data-store-reference')).to.be.null;
        expect(queryEntry('replace-with-data-object-reference')).to.exist;
      }));


      it('should handle missing dataStoreRef', inject(function(elementRegistry) {

        // given
        var dataStoreReference = elementRegistry.get('DataStoreReference_NO_DataStore');

        // when
        openPopup(dataStoreReference);

        // then
        expect(queryEntry('toggle-is-collection')).to.be.null;
      }));

    });


    describe('data store positioned against participant', function() {

      beforeEach(bootstrapModeler(diagramXMLDataStoresPositionedAgainstParticipant, { modules: testModules }));


      it('should only contain data object reference', inject(function(elementRegistry) {

        // given
        var dataStoreReferenceWithinParticipant = elementRegistry.get('DataStoreReference_0');

        // when
        openPopup(dataStoreReferenceWithinParticipant);

        // then
        expect(queryBodyEntries()).to.have.length(1);
        expect(queryEntry('replace-with-data-object-reference')).to.exist;
      }));


      it('should contain no reference', inject(function(elementRegistry) {

        // given
        var dataStoreReferenceOutsideParticipant = elementRegistry.get('DataStoreReference_1');

        // when
        openPopup(dataStoreReferenceOutsideParticipant);

        // then
        expect(queryBodyEntries()).to.have.length(0);
        expect(queryEntry('replace-with-data-object-reference')).to.be.null;
      }));

    });

  });


  describe('a11y', function() {

    beforeEach(bootstrapModeler(diagramXMLReplace, { modules: testModules }));


    it('should report no violations', inject(async function(elementRegistry) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      // when
      openPopup(startEvent);

      // then
      const container = getMenuContainer();
      await expectToBeAccessible(container);
    }));
  });


  describe('integration', function() {


    describe('default flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should replace SequenceFlow with DefaultFlow [gateway]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace SequenceFlow with DefaultFlow [task]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        var task = elementRegistry.get('Task_1ei94kl');

        // then
        expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should morph DefaultFlow into a SequenceFlow [task]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-sequence-flow');

        var task = elementRegistry.get('Task_1ei94kl');

        // then
        expect(task.businessObject.default).not.to.exist;
      }));


      it('should morph DefaultFlow into a SequenceFlow [task] -> undo',
        inject(function(elementRegistry, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-sequence-flow');

          commandStack.undo();

          var task = elementRegistry.get('Task_1ei94kl');

          // then
          expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should morph DefaultFlow into a ConditionalFlow [task]', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
            task = elementRegistry.get('Task_1ei94kl');

        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-conditional-flow');

        // then
        expect(task.businessObject.default).not.to.exist;
      }));


      it('should morph DefaultFlow into a ConditionalFlow [task] -> undo',
        inject(function(elementRegistry, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
              task = elementRegistry.get('Task_1ei94kl');

          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-conditional-flow');

          commandStack.undo();

          // then
          expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should replace SequenceFlow with DefaultFlow [gateway] -> undo',
        inject(function(elementRegistry, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              gateway = elementRegistry.get('ExclusiveGateway_1');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          commandStack.undo();

          // then
          expect(gateway.businessObject.default).not.to.exist;
        })
      );


      it('should replace SequenceFlow with DefaultFlow [task] -> undo',
        inject(function(elementRegistry, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          commandStack.undo();

          var task = elementRegistry.get('Task_1ei94kl');

          // then
          expect(task.businessObject.default).not.to.exist;
        })
      );


      it('should only have one DefaultFlow', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow3 = elementRegistry.get('SequenceFlow_3');


        // when
        // trigger morphing sequenceFlow3 to default flow
        openPopup(sequenceFlow3);

        triggerAction('replace-with-default-flow');

        // trigger morphing sequenceFlow to default flow
        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace DefaultFlow with SequenceFlow when changing source',
        inject(function(elementRegistry, modeling) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_2');

          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          // when
          modeling.reconnectStart(sequenceFlow, task, [
            { x: 686, y: 267, original: { x: 686, y: 307 } },
            { x: 686, y: 207, original: { x: 686, y: 187 } }
          ]);

          var gateway = elementRegistry.get('ExclusiveGateway_1');

          // then
          expect(gateway.businessObject.default).not.to.exist;
        })
      );


      it('should replace DefaultFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_2');

          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          // when
          modeling.reconnectStart(sequenceFlow, task, [
            { x: 686, y: 267, original: { x: 686, y: 307 } },
            { x: 686, y: 207, original: { x: 686, y: 187 } }
          ]);

          commandStack.undo();

          var gateway = elementRegistry.get('ExclusiveGateway_1');

          // then
          expect(gateway.businessObject.default).equal(sequenceFlow.businessObject);
        })
      );


      [
        'bpmn:Task',
        'bpmn:EndEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:IntermediateCatchEvent'
      ].forEach(function(type) {

        it('should keep DefaultFlow when changing target to ' + type,
          inject(function(elementRegistry, elementFactory, canvas, modeling) {

            // given
            var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
                root = canvas.getRootElement();

            var intermediateEvent = elementFactory.createShape({ type: type });

            modeling.createShape(intermediateEvent, { x: 686, y: 50 }, root);

            openPopup(sequenceFlow);

            triggerAction('replace-with-default-flow');

            // when
            modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
              { x: 686, y: 267, original: { x: 686, y: 307 } },
              { x: 686, y: 50, original: { x: 686, y: 75 } }
            ]);

            var gateway = elementRegistry.get('ExclusiveGateway_1');

            // then
            expect(gateway.businessObject.default).to.exist;
          })
        );
      });


      it('should replace DefaultFlow with SequenceFlow when changing target -> undo',
        inject(function(elementRegistry, elementFactory, canvas, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              rootElement = canvas.getRootElement();

          var intermediateEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' });

          modeling.createShape(intermediateEvent, { x: 686, y: 50 }, rootElement);

          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          // when
          modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
            { x: 686, y: 267, original: { x: 686, y: 307 } },
            { x: 686, y: 50, original: { x: 686, y: 75 } }
          ]);

          commandStack.undo();

          var gateway = elementRegistry.get('ExclusiveGateway_1');

          // then
          expect(gateway.businessObject.default).equal(sequenceFlow.businessObject);
        })
      );


      it('should keep DefaultFlow when morphing Gateway', inject(function(elementRegistry, bpmnReplace) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-default-flow');

        var inclusiveGateway = bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway' });

        // then
        expect(inclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should keep DefaultFlow when morphing Task', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
              task = elementRegistry.get('Task_1ei94kl');

          // when
          openPopup(sequenceFlow);

          // trigger DefaultFlow replacement
          triggerAction('replace-with-default-flow');

          var sendTask = bpmnReplace.replaceElement(task, { type: 'bpmn:SendTask' });

          // then
          expect(sendTask.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should keep DefaultFlow when morphing Gateway -> undo',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-default-flow');

          bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway' });

          commandStack.undo();

          // then
          expect(exclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should remove any conditionExpression when morphing to DefaultFlow',
        inject(function(elementRegistry, modeling, moddle) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          var conditionExpression = moddle.create('bpmn:FormalExpression', {
            body: ''
          });

          modeling.updateProperties(sequenceFlow, {
            conditionExpression: conditionExpression
          });

          // when
          openPopup(sequenceFlow);

          // trigger DefaultFlow replacement
          triggerAction('replace-with-default-flow');

          // then
          expect(exclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
          expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
        })
      );


      it('should remove any conditionExpression when morphing to DefaultFlow -> undo',
        inject(function(elementRegistry, modeling, moddle, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          var conditionExpression = moddle.create('bpmn:FormalExpression', { body: '' });

          modeling.updateProperties(sequenceFlow, { conditionExpression: conditionExpression });

          // when
          openPopup(sequenceFlow);

          // trigger DefaultFlow replacement
          triggerAction('replace-with-default-flow');

          commandStack.undo();

          // then
          expect(exclusiveGateway.businessObject.default).not.to.exist;
          expect(sequenceFlow.businessObject.conditionExpression).to.equal(conditionExpression);
        })
      );

    });


    describe('conditional flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should morph into a ConditionalFlow', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        triggerAction('replace-with-conditional-flow');

        // then
        expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
      }));


      it('should morph into a ConditionalFlow -> undo', inject(
        function(elementRegistry, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_2');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-conditional-flow');

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
        }
      ));


      it('should morph back into a SequenceFlow', inject(function(elementRegistry) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        // trigger ConditionalFlow replacement
        triggerAction('replace-with-conditional-flow');

        openPopup(sequenceFlow);

        // replace with SequenceFlow
        triggerAction('replace-with-sequence-flow');

        // then
        expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
      }));


      it('should replace ConditionalFlow with SequenceFlow when changing source',
        inject(function(elementRegistry, modeling) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              startEvent = elementRegistry.get('StartEvent_1');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-conditional-flow');

          // when
          modeling.reconnectStart(sequenceFlow, startEvent, [
            { x: 196, y: 197, original: { x: 178, y: 197 } },
            { x: 497, y: 278, original: { x: 547, y: 278 } }
          ]);

          // then
          expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
        })
      );


      it('should replace ConditionalFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              startEvent = elementRegistry.get('StartEvent_1');

          // when
          openPopup(sequenceFlow);

          triggerAction('replace-with-conditional-flow');

          // when
          modeling.reconnectStart(sequenceFlow, startEvent, [
            { x: 196, y: 197, original: { x: 178, y: 197 } },
            { x: 497, y: 278, original: { x: 547, y: 278 } }
          ]);

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
        })
      );


      [
        'bpmn:Task',
        'bpmn:EndEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:IntermediateCatchEvent'
      ].forEach(function(type) {

        it('should keep ConditionalFlow when changing target to ' + type,
          inject(function(elementRegistry, elementFactory, canvas, modeling) {

            // given
            var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
                root = canvas.getRootElement(),
                intermediateEvent = elementFactory.createShape({ type: type });

            modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

            openPopup(sequenceFlow);

            triggerAction('replace-with-conditional-flow');

            // when
            modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
              { x: 389, y: 197, original: { x: 389, y: 197 } },
              { x: 497, y: 197, original: { x: 497, y: 197 } }
            ]);

            // then
            expect(sequenceFlow.businessObject.conditionExpression).to.exist;
          })
        );

      });


      it('should replace ConditionalFlow with SequenceFlow when changing target -> undo',
        inject(function(elementRegistry, elementFactory, canvas, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              root = canvas.getRootElement(),
              intermediateEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' });

          modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

          openPopup(sequenceFlow);

          // trigger ConditionalFlow replacement
          triggerAction('replace-with-conditional-flow');

          // when
          modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
            { x: 389, y: 197, original: { x: 389, y: 197 } },
            { x: 497, y: 197, original: { x: 497, y: 197 } }
          ]);

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
        })
      );

    });


    describe('adhoc sub process', function() {

      var diagramXML = require('./ReplaceMenuProvider.subProcesses.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules.concat(autoResizeModule)
      }));


      describe('sub process -> adhoc', function() {

        it('should not resize', inject(function(elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1');

          // when
          openPopup(subProcess);

          const adHocSubProcess = triggerAction('replace-with-ad-hoc-subprocess');

          // then
          const sizeChanged = didSizeChange(subProcess, adHocSubProcess);
          expect(sizeChanged).to.be.false;
        }));


        it('should not lay out connection', inject(function(elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1');

          var layoutConnectionSpy = sinon.spy(modeling, 'layoutConnection');

          // when
          openPopup(subProcess);

          triggerAction('replace-with-ad-hoc-subprocess');

          // then
          expect(layoutConnectionSpy).not.to.have.been.called;
        }));

      });


      describe('adhoc -> sub process', function() {

        it('should not resize', inject(function(elementRegistry, modeling) {

          // given
          var adhocSubProcess = elementRegistry.get('AdhocSubProcess_1');

          // when
          openPopup(adhocSubProcess);

          const subprocess = triggerAction('replace-with-subprocess');

          // then
          const sizeChanged = didSizeChange(adhocSubProcess, subprocess);
          expect(sizeChanged).to.be.false;
        }));


        it('should not lay out connection', inject(function(elementRegistry, modeling) {

          // given
          var adhocSubProcess = elementRegistry.get('AdhocSubProcess_1');

          var layoutConnectionSpy = sinon.spy(modeling, 'layoutConnection');

          // when
          openPopup(adhocSubProcess);

          triggerAction('replace-with-subprocess');

          // then
          expect(layoutConnectionSpy).not.to.have.been.called;
        }));

      });

    });


    describe('events', function() {

      var diagramXML = require('./ReplaceMenuProvider.events.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should set default link name for a link catch event', inject(function(elementRegistry) {

        // given
        var event = elementRegistry.get('IntermediateEvent');

        // when
        openPopup(event);

        triggerAction('replace-with-link-intermediate-catch');

        // then
        event = elementRegistry.get('IntermediateEvent');

        expect(event).to.exist;
        expect(is(event, 'bpmn:IntermediateCatchEvent'), 'is not a catch event').to.be.true;

        var eventBo = event.businessObject,
            eventDefinitions = eventBo.eventDefinitions;

        expect(eventDefinitions).to.exist;
        expect(eventDefinitions).to.have.length(1);

        var eventDefinition = eventDefinitions[ 0 ];

        expect(is(eventDefinition, 'bpmn:LinkEventDefinition')).to.be.true;
        expect(eventDefinition.name, 'name is not set').to.eql('');
      }));


      it('should set default link name for a link throw event', inject(function(elementRegistry) {

        // given
        var event = elementRegistry.get('IntermediateEvent');

        // when
        openPopup(event);

        triggerAction('replace-with-link-intermediate-throw');

        // then
        event = elementRegistry.get('IntermediateEvent');

        expect(event).to.exist;
        expect(is(event, 'bpmn:IntermediateThrowEvent'), 'is not a throw event').to.be.true;

        var eventBo = event.businessObject,
            eventDefinitions = eventBo.eventDefinitions;

        expect(eventDefinitions).to.exist;
        expect(eventDefinitions).to.have.length(1);

        var eventDefinition = eventDefinitions[ 0 ];

        expect(is(eventDefinition, 'bpmn:LinkEventDefinition')).to.be.true;
        expect(eventDefinition.name, 'name is not set').to.eql('');
      }));
    });

  });


  describe('rules', function() {

    var diagramXML = require('../../../fixtures/bpmn/basic.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat([ customRulesModule ])
    }));


    it('should get entries by default', inject(function(elementRegistry) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');

      // when
      openPopup(startEvent);

      // then
      expect(queryBodyEntries()).to.have.length.above(0);
    }));


    it('should get entries when custom rule returns true',
      inject(function(elementRegistry, customRules) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        customRules.addRule('shape.replace', function() {
          return true;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryBodyEntries()).to.have.length.above(0);
      })
    );


    it('should get no entries when custom rule returns false',
      inject(function(elementRegistry, customRules) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1');

        customRules.addRule('shape.replace', function() {
          return false;
        });

        // when
        openPopup(startEvent);

        // then
        expect(queryBodyEntries()).to.have.length(0);
      })
    );


    it('should provide element to custom rules', inject(function(elementRegistry, customRules) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');
      var actual;

      customRules.addRule('shape.replace', function(context) {
        actual = context.element;
      });

      // when
      openPopup(startEvent);

      // then
      expect(actual).to.equal(startEvent);
    }));


    it('should evaluate rule once', inject(function(elementRegistry, customRules) {

      // given
      var callCount = 0;
      var startEvent = elementRegistry.get('StartEvent_1');

      customRules.addRule('shape.replace', function() {
        callCount++;
      });

      // when
      openPopup(startEvent);

      // then
      expect(callCount).to.equal(1);
    }));

  });

});



// helpers ////////////

function openPopup(element, offset) {
  offset = offset || 100;

  getBpmnJS().invoke(function(popupMenu) {

    popupMenu.open(element, 'bpmn-replace', {
      x: element.x + offset, y: element.y + offset
    });

  });
}

function queryEntry(id) {
  var container = getMenuContainer();

  return domQuery('.djs-popup [data-id="' + id + '"]', container);
}

function queryBodyEntries() {
  var container = getMenuContainer();

  return domQueryAll('.djs-popup .djs-popup-body .entry', container);
}

function queryEntryLabel(id) {
  var entry = queryEntry(id);

  return domQuery('span', entry);
}

function triggerAction(id) {
  var entry = queryEntry(id);

  if (!entry) {
    throw new Error('entry "' + id + '" not found in replace menu');
  }

  var popupMenu = getBpmnJS().get('popupMenu');

  return popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));
}

function getMenuContainer() {
  const popup = getBpmnJS().get('popupMenu');
  return popup._current.container;
}

function didSizeChange(element, newElement) {
  return element.di.bounds.width !== newElement.di.bounds.width ||
          element.di.bounds.height !== newElement.di.bounds.height;
}