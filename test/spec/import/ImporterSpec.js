import { expect } from 'chai';
import TestContainer from 'mocha-test-container-support';

import Diagram from 'diagram-js/lib/Diagram.js';
import { BpmnModdle } from 'bpmn-moddle';

import {
  importBpmnDiagram
} from 'bpmn-js/lib/import/Importer.js';

import CoreModule from 'bpmn-js/lib/core';

import {
  matches as domMatches
} from 'min-dom';

import {
  getChildren as getChildrenGfx
} from 'diagram-js/lib/util/GraphicsUtil.js';

import {
  find
} from 'min-dash';

import { is } from 'bpmn-js/lib/util/ModelUtil.js';

import processXML from '../../fixtures/bpmn/import/process.bpmn';
import collaborationXML from '../../fixtures/bpmn/import/collaboration.bpmn';
import positionTestcaseXML from '../../fixtures/bpmn/import/position/position-testcase.bpmn';
import sequenceFlowOrderingXML from './sequenceFlow-ordering.bpmn';
import dataAssociationXML from './data-association.bpmn';
import boundaryEventXML from '../../fixtures/bpmn/import/boundaryEvent.bpmn';
import dataStoreInsideParticipantXML from '../../fixtures/bpmn/import/data-store.inside-participant.bpmn';
import dataStoreOutsideParticipantParticipantXML from '../../fixtures/bpmn/import/data-store.outside-participant.participant.bpmn';
import dataStoreOutsideParticipantSubprocessXML from '../../fixtures/bpmn/import/data-store.outside-participant.subprocess.bpmn';
import dataStoreOutsideParticipantDanglingXML from '../../fixtures/bpmn/import/data-store.outside-participant.dangling.bpmn';
import multipleDiagramsXML from '../../fixtures/bpmn/import/multiple-diagrams.bpmn';
import groupsXML from '../../fixtures/bpmn/import/groups.bpmn';
import invalidFlowElementXML from '../../fixtures/bpmn/import/error/invalid-flow-element.bpmn';
import multipleDisXML from '../../fixtures/bpmn/import/error/multiple-dis.bpmn';
import missingDiPlaneXML from './missing-di-plane.bpmn';
import missingDiPlaneRootElementXML from './missing-di-plane-root-element.bpmn';
import sequenceFlowMissingWaypointsXML from './sequenceFlow-missingWaypoints.bpmn';
import defaultAttrsXML from '../../fixtures/bpmn/import/default-attrs.bpmn';
import boundaryEventMissingAttachToRefXML from '../../fixtures/bpmn/import/error/boundaryEvent-missingAttachToRef.bpmn';
import boundaryEventInvalidAttachToRefXML from '../../fixtures/bpmn/import/error/boundaryEvent-invalidAttachToRef.bpmn';
import danglingProcessMessageFlowXML from '../../fixtures/bpmn/import/error/dangling-process-message-flow.bpmn';
import textAnnotationMessageFlowXML from '../../fixtures/bpmn/import/text-annotation-message-flow.bpmn';
import processWithChildrenXML from '../../fixtures/bpmn/import/collapsed/processWithChildren.bpmn';
import multipleDiagrams2XML from '../../fixtures/bpmn/multiple-diagrams.bpmn';
import multipleNestedProcessesXML from '../../fixtures/bpmn/multiple-nested-processes.bpmn';
import collapsedSubprocessXML from '../../fixtures/bpmn/import/collapsed-subprocess.bpmn';


describe('import - Importer', function() {

  function createDiagram(container, modules) {
    return new Diagram({
      canvas: { container: container },
      modules: modules
    });
  }

  var diagram;

  beforeEach(function() {
    diagram = createDiagram(TestContainer.get(this), [ CoreModule ]);
  });


  function runImport(diagram, processXML, diagramId) {

    var moddle = new BpmnModdle();

    return moddle.fromXML(processXML).then(function(result) {

      var definitions = result.rootElement;

      var selectedDiagram = find(definitions.diagrams, function(element) {
        return element.id === diagramId;
      });

      return importBpmnDiagram(diagram, definitions, selectedDiagram);
    }).then(function(result) {

      return result;
    });
  }


  describe('events', function() {

    it('should fire <import.render.start> and <import.render.complete>', function() {

      // given

      var eventCount = 0;

      var eventBus = diagram.get('eventBus');

      // log events
      eventBus.on('import.render.start', function(event) {
        expect(event.definitions).to.exist;

        eventCount++;
      });

      eventBus.on('import.render.complete', function(event) {
        expect(event).to.have.property('error');
        expect(event).to.have.property('warnings');

        eventCount++;
      });

      // when
      return runImport(diagram, processXML).then(function() {

        // then
        expect(eventCount).to.equal(2);
      });
    });


    it('should fire <bpmnElement.added> during import', function() {

      // given

      var eventCount = 0;

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        eventCount++;
      });

      // when
      return runImport(diagram, processXML).then(function() {

        // then
        expect(eventCount).to.equal(9);
      });
    });

  });


  describe('basics', function() {

    it('should import process', function() {

      // given

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      return runImport(diagram, processXML).then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1' },
          { type: 'add', semantic: 'SubProcess_1', di: '_BPMNShape_SubProcess_2', diagramElement: 'SubProcess_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_2', diagramElement: 'StartEvent_1' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'EndEvent_1', di: '_BPMNShape_EndEvent_2', diagramElement: 'EndEvent_1' },
          { type: 'add', semantic: 'StartEvent_2', di: '_BPMNShape_StartEvent_11', diagramElement: 'StartEvent_2' },
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' },
          { type: 'add', semantic: 'SequenceFlow_2', di: 'BPMNEdge_SequenceFlow_2', diagramElement: 'SequenceFlow_2' },
          { type: 'add', semantic: 'SequenceFlow_3', di: 'BPMNEdge_SequenceFlow_3', diagramElement: 'SequenceFlow_3' }
        ]);

        expect(
          diagram.get('canvas').getRootElement()
        ).to.equal(
          diagram.get('elementRegistry').get('Process_1')
        );
      });
    });


    it('should import collaboration', function() {

      // given

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      return runImport(diagram, collaborationXML).then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: '_Collaboration_2', di: 'BPMNPlane_1', diagramElement: '_Collaboration_2' },
          { type: 'add', semantic: 'Participant_2', di: '_BPMNShape_Participant_2', diagramElement: 'Participant_2' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_3', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'Participant_1', di: '_BPMNShape_Participant_3', diagramElement: 'Participant_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_3', diagramElement: 'StartEvent_1' },
          { type: 'add', semantic: 'Lane_1', di: '_BPMNShape_Lane_2', diagramElement: 'Lane_1' },
          { type: 'add', semantic: 'Lane_2', di: '_BPMNShape_Lane_3', diagramElement: 'Lane_2' },
          { type: 'add', semantic: 'Lane_3', di: '_BPMNShape_Lane_4', diagramElement: 'Lane_3' }
        ]);

        expect(
          diagram.get('canvas').getRootElement()
        ).to.equal(
          diagram.get('elementRegistry').get('_Collaboration_2')
        );
      });

    });

  });


  describe('position', function() {

    it('should round shape coordinates', function() {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, positionTestcaseXML).then(function() {

        // round up
        expect(events.ID_End.x).to.equal(Math.round(340.6));
        expect(events.ID_End.y).to.equal(Math.round(136.6));

        // round down
        expect(events.ID_Start.x).to.equal(Math.round(120.4));
        expect(events.ID_Start.y).to.equal(Math.round(135.4));
      });
    });


    it('should round shape dimensions', function() {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, positionTestcaseXML).then(function() {

        // round down
        expect(events.ID_Start.height).to.equal(Math.round(30.4));
        expect(events.ID_Start.width).to.equal(Math.round(30.4));

      });
    });

  });


  describe('order', function() {

    it('should import lanes behind other flow nodes', function() {

      // given
      var elementRegistry = diagram.get('elementRegistry');


      return runImport(diagram, sequenceFlowOrderingXML).then(function() {

        // when
        var processShape = elementRegistry.get('Participant_1jxpy8o');

        var children = processShape.children;

        // lanes
        // other elements
        var correctlyOrdered = [].concat(
          children.filter(function(e) { return is(e, 'bpmn:Lane'); }),
          children.filter(function(e) { return !is(e, 'bpmn:Lane'); })
        );

        // then
        expectChildren(diagram, processShape, correctlyOrdered);
      });
    });


    it('should import sequence flows in front of other flow nodes', function() {

      // given
      var elementRegistry = diagram.get('elementRegistry');

      return runImport(diagram, sequenceFlowOrderingXML).then(function() {

        // when
        var processShape = elementRegistry.get('Participant_1jxpy8o');

        var children = processShape.children;

        // lanes
        // other elements
        // connections
        // labels
        var correctlyOrdered = [].concat(
          children.filter(function(e) { return !e.waypoints && !e.labelTarget; }),
          children.filter(function(e) { return e.waypoints; }),
          children.filter(function(e) { return e.labelTarget; })
        );

        // then
        expectChildren(diagram, processShape, correctlyOrdered);
      });
    });


    it('should import DataAssociations in root', function() {

      // given
      var elementRegistry = diagram.get('elementRegistry');

      // when
      return runImport(diagram, dataAssociationXML).then(function() {

        // then
        var process = elementRegistry.get('Collaboration'),
            association = elementRegistry.get('DataAssociation'),
            dataStore = elementRegistry.get('DataStore');

        expect(association.parent).to.eql(process);
        expect(dataStore.parent).to.eql(process);
      });
    });

  });


  describe('elements', function() {

    it('should import boundary events', function() {

      // given
      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      return runImport(diagram, boundaryEventXML).then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'Task_2', di: '_BPMNShape_Task_3', diagramElement: 'Task_2' },
          { type: 'add', semantic: 'BoundaryEvent_1', di: '_BPMNShape_BoundaryEvent_2', diagramElement: 'BoundaryEvent_1' },
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' }
        ]);
      });
    });


    it('should import data store as child of participant', function() {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, dataStoreInsideParticipantXML).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Participant);
      });
    });


    it('should import data store in participant as child of collaboration', function() {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, dataStoreOutsideParticipantParticipantXML).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Collaboration);

      });
    });


    it('should import data store in subprocess as child of collaboration', function() {

      // given

      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, dataStoreOutsideParticipantSubprocessXML).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Collaboration);

      });
    });


    it('should import data store outside of participant without warnings', function() {

      // when
      return runImport(diagram, dataStoreOutsideParticipantDanglingXML).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.be.empty;
      });
    });


    it('should import single diagram from multiple diagrams 2', function() {

      // given
      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      return runImport(diagram, multipleDiagramsXML, 'BPMNDiagram_2').then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_2', di: 'BPMNPlane_2', diagramElement: 'Process_2' },
          { type: 'add', semantic: 'StartEvent_2', di: '_BPMNShape_StartEvent_2', diagramElement: 'StartEvent_2' },
          { type: 'add', semantic: 'IntermediateThrowEvent_1', di: '_BPMNShape_IntermediateThrowEvent_1', diagramElement: 'IntermediateThrowEvent_1' },
          { type: 'add', semantic: 'EndEvent_2', di: '_BPMNShape_EndEvent_2', diagramElement: 'EndEvent_2' },
          { type: 'add', semantic: 'SequenceFlow_4', di: 'BPMNEdge_SequenceFlow_4', diagramElement: 'SequenceFlow_4' },
          { type: 'add', semantic: 'SequenceFlow_5', di: 'BPMNEdge_SequenceFlow_5', diagramElement: 'SequenceFlow_5' }
        ]);

        expect(
          diagram.get('canvas').getRootElement()
        ).to.equal(
          diagram.get('elementRegistry').get('Process_2')
        );
      });
    });


    it('should import single diagram from multiple diagrams 1', function() {

      // given
      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      return runImport(diagram, multipleDiagramsXML, 'BPMNDiagram_1').then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_1', diagramElement: 'StartEvent_1' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_1', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'Task_2', di: '_BPMNShape_Task_2', diagramElement: 'Task_2' },
          { type: 'add', semantic: 'EndEvent_1', di: '_BPMNShape_EndEvent_1', diagramElement: 'EndEvent_1' },
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' },
          { type: 'add', semantic: 'SequenceFlow_2', di: 'BPMNEdge_SequenceFlow_2', diagramElement: 'SequenceFlow_2' },
          { type: 'add', semantic: 'SequenceFlow_3', di: 'BPMNEdge_SequenceFlow_3', diagramElement: 'SequenceFlow_3' }
        ]);

      });
    });


    it('should import groups', function() {

      // given
      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.di.id,
          diagramElement: e.element && e.element.id,
          isFrame: e.element && e.element.isFrame
        });
      });

      // when
      return runImport(diagram, groupsXML).then(function() {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1', isFrame: undefined },
          { type: 'add', semantic: 'Group_1', di: 'Group_1_di', diagramElement: 'Group_1', isFrame: true }
        ]);

      });
    });

  });


  describe('forgiveness', function() {

    it('should import invalid flowElement', function() {

      // when
      return runImport(diagram, invalidFlowElementXML).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

      });
    });


    it('should import multiple DIs', function() {

      // when
      return runImport(diagram, multipleDisXML).then(function(result) {

        var warnings = result.warnings;

        var expectedMessage =
          'multiple DI elements defined for <bpmn:InclusiveGateway id="InclusiveGateway_1" />';

        expect(warnings).to.have.length(1);
        expect(warnings[0].message).to.equal(expectedMessage);

      });
    });


    it('should import with missing BPMNDiagram#plane DI', function() {

      // when
      return runImport(diagram, missingDiPlaneXML).then(function(result) {

        var {
          error,
          warnings
        } = result;

        // then
        expect(warnings).to.be.empty;
        expect(error).not.to.exist;
      });
    });


    it('should error import with missing BPMNDiagram#plane DI', function() {

      // when
      return runImport(diagram, missingDiPlaneRootElementXML).then(function(result) {

        var {
          error,
          warnings
        } = result;

        // then
        // warning: no bpmnElement referenced in <bpmndi:BPMNPlane />
        // warning: correcting missing bpmnElement on <bpmndi:BPMNPlane />
        expect(warnings).to.have.length(2);
        expect(error).not.to.exist;
      });
    });


    it('should import sequence flow without waypoints', function() {

      // when
      return runImport(diagram, sequenceFlowMissingWaypointsXML).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.be.empty;

      });
    });


    it('should extend attributes with default value', function() {

      // when
      return runImport(diagram, defaultAttrsXML).then(function() {

        var elementRegistry = diagram.get('elementRegistry');

        var element = elementRegistry.get('GATEWAY_1');

        expect(element.businessObject.eventGatewayType).to.equal('Exclusive');

      });
    });


    describe('boundary events', function() {

      it('should handle missing attachToRef', function() {

        // when
        return runImport(diagram, boundaryEventMissingAttachToRefXML).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings.length).to.eql(2);

          expect(warnings[0].message).to.eql('missing <bpmn:BoundaryEvent id="BoundaryEvent_1" />#attachedToRef');
          expect(warnings[1].message).to.eql('element <bpmn:BoundaryEvent id="BoundaryEvent_1" /> referenced by <bpmn:SequenceFlow id="SequenceFlow_1" />#sourceRef not yet drawn');

        });
      });


      it('should handle invalid attachToRef', function() {

        // when
        return runImport(diagram, boundaryEventInvalidAttachToRefXML).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings.length).to.eql(2);

          expect(warnings[0].message).to.eql('missing <bpmn:BoundaryEvent id="BoundaryEvent_1" />#attachedToRef');
          expect(warnings[1].message).to.eql('element <bpmn:BoundaryEvent id="BoundaryEvent_1" /> referenced by <bpmn:SequenceFlow id="SequenceFlow_1" />#sourceRef not yet drawn');

        });
      });

    });

  });


  describe('integration', function() {

    it('should import dangling process message flows', function() {

      // when
      return runImport(diagram, danglingProcessMessageFlowXML).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

        expect(diagram.get('elementRegistry').get('_b467921a-ef7b-44c5-bf78-fd624c400d17')).to.exist;
        expect(diagram.get('elementRegistry').get('_c311cc87-677e-47a4-bdb1-8744c4ec3147')).to.exist;

      });
    });


    it('should import text annotations of message flows', function() {

      // when
      return runImport(diagram, textAnnotationMessageFlowXML).then(function() {

        // then
        var textAnnotation = diagram.get('elementRegistry').get('TextAnnotation_1');
        var messageFlow = diagram.get('elementRegistry').get('MessageFlow_1');
        var association = diagram.get('elementRegistry').get('Association_1');

        expect(textAnnotation).to.exist;
        expect(association.source).to.equal(messageFlow);
        expect(association.target).to.equal(textAnnotation);
      });
    });

  });


  describe('hiding', function() {

    it('should hide shapes and connections inside of collapsed subprocess', function() {

      // when
      return runImport(diagram, processWithChildrenXML).then(function() {

        var elementRegistry = diagram.get('elementRegistry');

        var children = elementRegistry.get('SubProcess_1').children;
        var visible = find(children, function(child) {
          return !child.hidden;
        });

        // then
        expect(visible).to.be.undefined;

      });

    });

  });


  describe('multiple bpmndi:BPMNDiagram elements', function() {

    it('should import first bpmndi:BPMNDiagram (default)', function() {

      // when
      return runImport(diagram, multipleDiagrams2XML).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

        diagram.invoke(function(elementRegistry, canvas) {

          expect(elementRegistry.get('Task_A')).to.exist;
          expect(elementRegistry.get('Task_B')).not.to.exist;

          expect(canvas.getRootElement()).to.equal(elementRegistry.get('Process_1'));
        });
      });
    });


    it('should import second bpmndi:BPMNDiagram (specified)', function() {

      // given
      var selectedDiagram = 'BpmnDiagram_2';

      // when
      return runImport(diagram, multipleDiagrams2XML, selectedDiagram).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

        diagram.invoke(function(elementRegistry, canvas) {

          expect(elementRegistry.get('Task_A')).not.to.exist;
          expect(elementRegistry.get('Task_B')).to.exist;

          expect(canvas.getRootElement()).to.equal(elementRegistry.get('Process_2'));
        });
      });
    });


    it('should add root element for each bpmndi:BPMNDiagram when importing', function() {

      // when
      return runImport(diagram, multipleDiagrams2XML).then(function() {

        var elementRegistry = diagram.get('elementRegistry'),
            canvas = diagram.get('canvas'),
            rootA = elementRegistry.get('Process_1'),
            rootB = elementRegistry.get('Process_2'),
            taskA = elementRegistry.get('Task_A'),
            taskB = elementRegistry.get('Task_B');

        var activeRoot = canvas.getRootElement();

        // then
        expect(canvas.findRoot(taskA)).to.equal(rootA);
        expect(canvas.findRoot(taskB)).to.equal(rootB);
        expect(activeRoot).to.equal(rootA);
      });
    });


    describe('collapsed sub process', function() {

      it('should import collapsed sub process', function() {

        // given
        var selectedDiagram = 'BpmnDiagram_1';

        // when
        return runImport(diagram, multipleNestedProcessesXML, selectedDiagram).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings).to.have.length(0);

          diagram.invoke(function(elementRegistry, canvas) {

            expect(elementRegistry.get('SubProcess_1')).to.exist;
            expect(elementRegistry.get('Task_1A')).to.exist;
            expect(elementRegistry.get('Task_1B')).to.exist;

            expect(elementRegistry.get('SubProcess_2')).to.not.exist;

            expect(canvas.getRootElement()).to.equal(elementRegistry.get('Process_1'));
          });
        });
      });


      it('should import and show collapsed sub process', function() {

        // given
        var selectedDiagram = 'SubProcessDiagram_1';

        // when
        return runImport(diagram, multipleNestedProcessesXML, selectedDiagram).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings).to.have.length(0);

          diagram.invoke(function(elementRegistry, canvas) {

            expect(elementRegistry.get('SubProcess_1')).to.exist;
            expect(elementRegistry.get('Task_1A')).to.exist;
            expect(elementRegistry.get('Task_1B')).to.exist;

            expect(elementRegistry.get('SubProcess_2')).to.not.exist;

            expect(canvas.getRootElement()).to.equal(elementRegistry.get('SubProcess_1_plane'));
          });
        });
      });


      it('should import first bpmndi:BPMNDiagram when importing collapsed sub process', function() {

        // given
        var selectedDiagram = 'BpmnDiagram_2';

        // when
        return runImport(diagram, multipleNestedProcessesXML, selectedDiagram).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings).to.have.length(0);

          diagram.invoke(function(elementRegistry, canvas) {

            expect(elementRegistry.get('SubProcess_2')).to.exist;
            expect(elementRegistry.get('Task_2A')).to.exist;
            expect(elementRegistry.get('Task_2B')).to.not.exist;

            expect(elementRegistry.get('SubProcess_1')).to.not.exist;

            expect(canvas.getRootElement()).to.equal(elementRegistry.get('Process_2'));
          });
        });
      });


      it('should import specified bpmndi:BPMNDiagram when importing collapsed sub process', function() {

        // given
        var selectedDiagram = 'SubProcess_2_diagram_B';

        // when
        return runImport(diagram, multipleNestedProcessesXML, selectedDiagram).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings).to.have.length(0);

          diagram.invoke(function(elementRegistry, canvas) {

            expect(elementRegistry.get('SubProcess_2')).to.exist;
            expect(elementRegistry.get('Task_2A')).to.not.exist;
            expect(elementRegistry.get('Task_2B')).to.exist;

            expect(elementRegistry.get('SubProcess_1')).to.not.exist;

            expect(canvas.getRootElement()).to.equal(elementRegistry.get('SubProcess_2_plane'));
          });
        });
      });


      it('should add root element when importing collapsed sub process', function() {

        // when
        return runImport(diagram, collapsedSubprocessXML).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings).to.have.length(0);

          diagram.invoke(function(elementRegistry, canvas) {

            var subProcessRoot = elementRegistry.get('Subprocess_plane');
            var processRoot = elementRegistry.get('Process_1rjrv55');
            var subProcessElement = elementRegistry.get('Subprocess');
            var taskInSubProcessElement = elementRegistry.get('Task_B');

            expect(subProcessRoot).to.exist;
            expect(subProcessElement).to.exist;
            expect(taskInSubProcessElement).to.exist;

            expect(canvas.getRootElement()).to.equal(processRoot);
            expect(subProcessElement.parent).to.equal(processRoot);
            expect(taskInSubProcessElement.parent).to.equal(subProcessRoot);
          });
        });
      });

    });

  });

});



// helpers //////////////////////

function expectChildren(diagram, parent, children) {

  return diagram.invoke(function(elementRegistry) {

    // verify model is consistent
    expect(parent.children).to.eql(children);

    // verify SVG is consistent
    var parentGfx = elementRegistry.getGraphics(parent);

    var expectedChildrenGfx = children.map(function(c) {
      return elementRegistry.getGraphics(c);
    });

    var childrenContainerGfx =
      domMatches(parentGfx, '[data-element-id="Process_1"]')
        ? parentGfx
        : getChildrenGfx(parentGfx);

    var existingChildrenGfx = Array.prototype.map.call(childrenContainerGfx.childNodes, function(c) {
      return c.querySelector('.djs-element');
    });

    expect(existingChildrenGfx).to.eql(expectedChildrenGfx);
  });

}
