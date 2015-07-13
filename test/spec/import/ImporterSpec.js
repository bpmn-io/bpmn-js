'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapViewer, inject */


var TestContainer = require('mocha-test-container-support');

var Diagram = require('diagram-js/lib/Diagram'),
    BpmnModdle = require('bpmn-moddle'),
    Importer = require('../../../lib/import/Importer'),
    Viewer = require('../../../lib/Viewer');


var is = require('../../../lib/util/ModelUtil').is;

describe('import - Importer', function() {

  var moddle = new BpmnModdle();

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function createDiagram() {
    return new Diagram({
      canvas: { container: container },
      modules: Viewer.prototype._modules
    });
  }

  var diagram;

  beforeEach(function() {
    diagram = createDiagram();
  });


  function runImport(diagram, xml, done) {
    moddle.fromXML(xml, function(err, definitions) {
      if (err) {
        return done(err);
      }

      Importer.importBpmnDiagram(diagram, definitions, done);
    });
  }


  describe('event emitter', function() {

    it('should fire <bpmnElement.added> during import', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/process.bpmn');

      var eventCount = 0;

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        eventCount++;
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(eventCount).to.equal(9);

        done(err);
      });
    });

  });


  describe('basics', function() {

    it('should import process', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/process.bpmn');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.businessObject.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

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

        done(err);
      });
    });


    it('should import collaboration', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/collaboration.bpmn');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.businessObject.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: '_Collaboration_2', di: 'BPMNPlane_1', diagramElement: '_Collaboration_2' },
          { type: 'add', semantic: 'Participant_2', di: '_BPMNShape_Participant_2', diagramElement: 'Participant_2' },
          { type: 'add', semantic: 'Lane_1', di: '_BPMNShape_Lane_2', diagramElement: 'Lane_1' },
          { type: 'add', semantic: 'Lane_2', di: '_BPMNShape_Lane_3', diagramElement: 'Lane_2' },
          { type: 'add', semantic: 'Lane_3', di: '_BPMNShape_Lane_4', diagramElement: 'Lane_3' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_3', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'Participant_1', di: '_BPMNShape_Participant_3', diagramElement: 'Participant_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_3', diagramElement: 'StartEvent_1' }
        ]);

        done(err);
      });
    });


    it('should import boundary events', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/boundaryEvent.bpmn');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        events.push({
          type: 'add',
          semantic: e.element.businessObject.id,
          di: e.element.businessObject.di.id,
          diagramElement: e.element && e.element.id
        });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).to.eql([
          { type: 'add', semantic: 'Process_1', di: 'BPMNPlane_1', diagramElement: 'Process_1'},
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1'},
          { type: 'add', semantic: 'Task_2', di: '_BPMNShape_Task_3', diagramElement: 'Task_2'},
          { type: 'add', semantic: 'BoundaryEvent_1', di: '_BPMNShape_BoundaryEvent_2', diagramElement: 'BoundaryEvent_1'},
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1'}
        ]);

        done(err);
      });
    });
  });


  describe('model wiring', function() {

    describe('basics', function() {

      var xml = require('../../fixtures/bpmn/import/process.bpmn');

      beforeEach(bootstrapViewer(xml));


      it('should wire root element', inject(function(elementRegistry, canvas) {

        // when
        var processElement = elementRegistry.get('Process_1');
        var subProcessShape = elementRegistry.get('SubProcess_1');

        // then
        expect(subProcessShape.parent).to.eql(processElement);
        expect(canvas.getRootElement()).to.eql(processElement);

        expect(is(processElement, 'bpmn:Process')).to.be.true;
      }));


      it('should wire parent child relationship', inject(function(elementRegistry) {

        // when
        var subProcessShape = elementRegistry.get('SubProcess_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        // then
        expect(startEventShape.type).to.equal('bpmn:StartEvent');
        expect(startEventShape.parent).to.eql(subProcessShape);

        expect(subProcessShape.children.length).to.equal(5);
      }));


      it('should wire label relationship', inject(function(elementRegistry) {

        // when
        var startEventShape = elementRegistry.get('StartEvent_1');
        var label = startEventShape.label;

        // then
        expect(label).to.be.defined;
        expect(label.id).to.equal(startEventShape.id + '_label');

        expect(label.labelTarget).to.eql(startEventShape);
      }));


      it('should wire businessObject', inject(function(elementRegistry) {

        // when
        var subProcessShape = elementRegistry.get('SubProcess_1');
        var startEventShape = elementRegistry.get('StartEvent_1');

        var subProcess = subProcessShape.businessObject,
            startEvent = startEventShape.businessObject;

        // then
        expect(subProcess).to.be.defined;
        expect(is(subProcess, 'bpmn:SubProcess')).to.be.true;

        expect(startEvent).to.be.defined;
        expect(is(startEvent, 'bpmn:StartEvent')).to.be.true;
      }));


      it('should wire shape di', inject(function(elementRegistry) {

        // when
        var subProcessShape = elementRegistry.get('SubProcess_1');

        var subProcess = subProcessShape.businessObject;
        var subProcessDi = subProcess.di;

        // then
        expect(subProcessDi).to.be.defined;
        expect(subProcessDi.bpmnElement).to.eql(subProcess);
      }));


      it('should wire connection di', inject(function(elementRegistry) {

        // when
        var sequenceFlowElement = elementRegistry.get('SequenceFlow_1');

        var sequenceFlow = sequenceFlowElement.businessObject;
        var sequenceFlowDi = sequenceFlow.di;

        // then
        expect(sequenceFlowDi).to.be.defined;
        expect(sequenceFlowDi.bpmnElement).to.eql(sequenceFlow);
      }));

    });


    describe('boundary events', function() {

      var xml = require('../../fixtures/bpmn/import/boundaryEvent.bpmn');

      beforeEach(bootstrapViewer(xml));


      it('should wire host attacher relationship', inject(function(elementRegistry) {

        // when
        var boundaryEventShape = elementRegistry.get('BoundaryEvent_1'),
            boundaryEvent = boundaryEventShape.businessObject;

        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // assume
        expect(boundaryEvent.attachedToRef).to.eql(task);

        // then
        expect(boundaryEventShape.host).to.eql(taskShape);

        expect(taskShape.attachers).to.exist;
        expect(taskShape.attachers).to.contain(boundaryEventShape);
      }));

    });

  });


  describe('forgiveness', function() {

    it('should import invalid flowElement', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/error/invalid-flow-element.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        expect(warnings.length).to.equal(1);

        done(err);
      });
    });


    it('should import multiple DIs', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/error/multiple-dis.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        var expectedMessage =
          'multiple DI elements defined for <bpmn:InclusiveGateway id="InclusiveGateway_1" />';

        expect(warnings.length).to.equal(1);
        expect(warnings[0].message).to.equal(expectedMessage);

        done(err);
      });
    });


    it('should extend attributes with default value', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/default-attrs.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        var elementRegistry = diagram.get('elementRegistry');

        var element = elementRegistry.get('GATEWAY_1');

        expect(element.businessObject.eventGatewayType).to.equal('Exclusive');

        done();
      });
    });


    describe('boundary events', function() {

      it('should handle missing attachToRef', function(done) {

        // given
        var xml = require('../../fixtures/bpmn/import/error/boundaryEvent-missingAttachToRef.bpmn');

        // when
        runImport(diagram, xml, function(err, warnings) {

          // then
          expect(warnings.length).to.eql(2);

          expect(warnings[0].message).to.eql('missing <bpmn:BoundaryEvent id="BoundaryEvent_1" />#attachedToRef');
          expect(warnings[1].message).to.eql('element <bpmn:BoundaryEvent id="BoundaryEvent_1" /> referenced by <bpmn:SequenceFlow id="SequenceFlow_1" />#sourceRef not yet drawn');

          done(err);
        });
      });


      it('should handle invalid attachToRef', function(done) {

        // given
        var xml = require('../../fixtures/bpmn/import/error/boundaryEvent-invalidAttachToRef.bpmn');

        // when
        runImport(diagram, xml, function(err, warnings) {

          // then
          expect(warnings.length).to.eql(2);

          expect(warnings[0].message).to.eql('missing <bpmn:BoundaryEvent id="BoundaryEvent_1" />#attachedToRef');
          expect(warnings[1].message).to.eql('element <bpmn:BoundaryEvent id="BoundaryEvent_1" /> referenced by <bpmn:SequenceFlow id="SequenceFlow_1" />#sourceRef not yet drawn');

          done(err);
        });
      });

    });

  });


  describe('integration', function() {

    // slightly increase timeout for complex test cases
    this.timeout(4000);


    it('should import complex', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/complex.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(warnings.length).to.equal(0);

        done(err);
      });
    });


    it('should import dangling process message flows', function(done) {

      // given
      var xml = require('../../fixtures/bpmn/import/error/dangling-process-message-flow.bpmn');

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(warnings.length).to.equal(0);

        expect(diagram.get('elementRegistry').get('_b467921a-ef7b-44c5-bf78-fd624c400d17')).to.be.defined;
        expect(diagram.get('elementRegistry').get('_c311cc87-677e-47a4-bdb1-8744c4ec3147')).to.be.defined;

        done(err);
      });
    });

  });


  describe('position', function() {

    var xml = require('../../fixtures/bpmn/import/position/position-testcase.bpmn');

    it('should round shape\'s x and y coordinates', function(done) {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      runImport(diagram, xml, function(err, warnings) {

        //round up
        expect(events.ID_End.x).to.equal(Math.round(340.6));
        expect(events.ID_End.y).to.equal(Math.round(136.6));

        //round down
        expect(events.ID_Start.x).to.equal(Math.round(120.4));
        expect(events.ID_Start.y).to.equal(Math.round(135.4));

        done(err);
      });
    });


    it('should round shape\'s height and width', function(done) {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      runImport(diagram, xml, function(err, warnings) {

        //round down
        expect(events.ID_Start.height).to.equal(Math.round(30.4));
        expect(events.ID_Start.width).to.equal(Math.round(30.4));

        done(err);
      });
    });

  });

});