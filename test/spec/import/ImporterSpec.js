import TestContainer from 'mocha-test-container-support';

import Diagram from 'diagram-js/lib/Diagram';
import BpmnModdle from 'bpmn-moddle';

import {
  importBpmnDiagram
} from 'lib/import/Importer';

import CoreModule from 'lib/core';

import {
  matches as domMatches
} from 'min-dom';

import {
  getChildren as getChildrenGfx
} from 'diagram-js/lib/util/GraphicsUtil';

import {
  find
} from 'min-dash';

import { is } from 'lib/util/ModelUtil';


describe('import - Importer', function() {

  function createDiagram(container, modules) {
    return new Diagram({
      canvas: { container: container },
      modules: modules
    });
  }

  var diagram;

  beforeEach(function() {
    diagram = createDiagram(TestContainer.get(this), [CoreModule]);
  });


  function runImport(diagram, xml, diagramId) {

    var moddle = new BpmnModdle();

    return moddle.fromXML(xml).then(function(result) {

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
      var xml = require('../../fixtures/bpmn/import/process.bpmn');

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
      return runImport(diagram, xml).then(function() {

        // then
        expect(eventCount).to.equal(2);
      });
    });


    it('should fire <bpmnElement.added> during import', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/process.bpmn');

      var eventCount = 0;

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        eventCount++;
      });

      // when
      return runImport(diagram, xml).then(function() {

        // then
        expect(eventCount).to.equal(9);
      });
    });

  });


  describe('basics', function() {

    it('should import process', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/process.bpmn');

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
      return runImport(diagram, xml).then(function() {

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
      var xml = require('../../fixtures/bpmn/import/collaboration.bpmn');

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
      return runImport(diagram, xml).then(function() {

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

    var xml = require('../../fixtures/bpmn/import/position/position-testcase.bpmn');

    it('should round shape coordinates', function() {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, xml).then(function() {

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

      return runImport(diagram, xml).then(function() {

        // round down
        expect(events.ID_Start.height).to.equal(Math.round(30.4));
        expect(events.ID_Start.width).to.equal(Math.round(30.4));

      });
    });

  });


  describe('order', function() {

    it('should import sequence flows and lanes behind other flow nodes', function() {

      var xml = require('./sequenceFlow-ordering.bpmn');

      // given
      var elementRegistry = diagram.get('elementRegistry');


      return runImport(diagram, xml).then(function() {

        // when
        var processShape = elementRegistry.get('Participant_1jxpy8o');

        var children = processShape.children;

        // lanes
        // connections
        // other elements
        var correctlyOrdered = [].concat(
          children.filter(function(c) { return is(c, 'bpmn:Lane'); }),
          children.filter(function(c) { return c.waypoints; }),
          children.filter(function(c) { return !is(c, 'bpmn:Lane') && !c.waypoints; })
        );

        // then
        expectChildren(diagram, processShape, correctlyOrdered);

      });
    });


    it('should import DataAssociations in root', function() {

      // given
      var xml = require('./data-association.bpmn');

      // given
      var elementRegistry = diagram.get('elementRegistry');


      // when
      return runImport(diagram, xml).then(function() {

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
      var xml = require('../../fixtures/bpmn/import/boundaryEvent.bpmn');

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
      return runImport(diagram, xml).then(function() {

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
      var xml = require('../../fixtures/bpmn/import/data-store.inside-participant.bpmn');

      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, xml).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Participant);

      });

    });


    it('should import data store in participant as child of collaboration', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/data-store.outside-participant.participant.bpmn');

      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, xml).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Collaboration);

      });
    });


    it('should import data store in subprocess as child of collaboration', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/data-store.outside-participant.subprocess.bpmn');

      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      return runImport(diagram, xml).then(function() {
        expect(events.DataStoreReference.parent).to.equal(events.Collaboration);

      });
    });


    it('should import data store outside of participant without warnings', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/data-store.outside-participant.dangling.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.be.empty;

      });
    });


    it('should import single diagram from multiple diagrams 2', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/multiple-diagrams.bpmn');

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
      return runImport(diagram, xml, 'BPMNDiagram_2').then(function() {

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
      var xml = require('../../fixtures/bpmn/import/multiple-diagrams.bpmn');

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
      return runImport(diagram, xml, 'BPMNDiagram_1').then(function() {

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
      var xml = require('../../fixtures/bpmn/import/groups.bpmn');

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
      return runImport(diagram, xml).then(function() {

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

      // given
      var xml = require('../../fixtures/bpmn/import/error/invalid-flow-element.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

      });
    });


    it('should import multiple DIs', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/error/multiple-dis.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        var expectedMessage =
          'multiple DI elements defined for <bpmn:InclusiveGateway id="InclusiveGateway_1" />';

        expect(warnings).to.have.length(1);
        expect(warnings[0].message).to.equal(expectedMessage);

      });
    });


    it('should import sequence flow without waypoints', function() {

      // given
      var xml = require('./sequenceFlow-missingWaypoints.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.be.empty;

      });
    });


    it('should extend attributes with default value', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/default-attrs.bpmn');

      // when
      return runImport(diagram, xml).then(function() {

        var elementRegistry = diagram.get('elementRegistry');

        var element = elementRegistry.get('GATEWAY_1');

        expect(element.businessObject.eventGatewayType).to.equal('Exclusive');

      });
    });


    describe('boundary events', function() {

      it('should handle missing attachToRef', function() {

        // given
        var xml = require('../../fixtures/bpmn/import/error/boundaryEvent-missingAttachToRef.bpmn');

        // when
        return runImport(diagram, xml).then(function(result) {

          var warnings = result.warnings;

          // then
          expect(warnings.length).to.eql(2);

          expect(warnings[0].message).to.eql('missing <bpmn:BoundaryEvent id="BoundaryEvent_1" />#attachedToRef');
          expect(warnings[1].message).to.eql('element <bpmn:BoundaryEvent id="BoundaryEvent_1" /> referenced by <bpmn:SequenceFlow id="SequenceFlow_1" />#sourceRef not yet drawn');

        });
      });


      it('should handle invalid attachToRef', function() {

        // given
        var xml = require('../../fixtures/bpmn/import/error/boundaryEvent-invalidAttachToRef.bpmn');

        // when
        return runImport(diagram, xml).then(function(result) {

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

      // given
      var xml = require('../../fixtures/bpmn/import/error/dangling-process-message-flow.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

        expect(diagram.get('elementRegistry').get('_b467921a-ef7b-44c5-bf78-fd624c400d17')).to.exist;
        expect(diagram.get('elementRegistry').get('_c311cc87-677e-47a4-bdb1-8744c4ec3147')).to.exist;

      });
    });

  });


  describe('hiding', function() {

    it('should hide shapes and connections inside of collapsed subprocess', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/collapsed/processWithChildren.bpmn');

      // when
      return runImport(diagram, xml).then(function() {

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


  describe('multiple-diagrams', function() {

    it('should import first diagrams if none is defined', function() {

      // given
      var xml = require('../../fixtures/bpmn/multiple-diagrams.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

        var warnings = result.warnings;

        // then
        expect(warnings).to.have.length(0);

        diagram.invoke(function(elementRegistry, canvas) {

          expect(elementRegistry.get('Task_A')).to.exist;
          expect(elementRegistry.get('Task_B')).to.not.exist;

          expect(canvas.getRootElement()).to.equal(elementRegistry.get('Process_1'));
        });
      });
    });


    it('should import complete diagram tree', function() {

      // given
      var xml = require('./multiple-nestes-processes.bpmn');
      var selectedDiagram = 'BpmnDiagram_1';

      // when
      return runImport(diagram, xml, selectedDiagram).then(function(result) {

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


    it('should switch to correct plane', function() {

      // given
      var xml = require('./multiple-nestes-processes.bpmn');
      var selectedDiagram = 'SubProcessDiagram_1';

      // when
      return runImport(diagram, xml, selectedDiagram).then(function(result) {

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


    it('should use first diagram for multiple candidates', function() {

      // given
      var xml = require('./multiple-nestes-processes.bpmn');
      var selectedDiagram = 'BpmnDiagram_2';

      // when
      return runImport(diagram, xml, selectedDiagram).then(function(result) {

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


    it('should use use selected diagram for multiple candidates', function() {

      // given
      var xml = require('./multiple-nestes-processes.bpmn');
      var selectedDiagram = 'SubProcess_2_diagram_B';

      // when
      return runImport(diagram, xml, selectedDiagram).then(function(result) {

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


    it('should allow subProcess to have attached plane', function() {

      // given
      var xml = require('../../fixtures/bpmn/import/collapsed-subprocess.bpmn');

      // when
      return runImport(diagram, xml).then(function(result) {

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


    it('should render Tasks on different layers', function() {

      // given
      var xml = require('../../fixtures/bpmn/multiple-diagrams.bpmn');

      // when
      return runImport(diagram, xml).then(function() {

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
