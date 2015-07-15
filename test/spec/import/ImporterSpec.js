'use strict';

var TestHelper = require('../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var fs = require('fs');

var Diagram = require('diagram-js/lib/Diagram'),
    BpmnModdle = require('bpmn-moddle'),
    Importer = require('../../../lib/import/Importer'),
    Viewer = require('../../../lib/Viewer');


describe('import - importer', function() {

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

    it('should fire <shape.added> during import', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

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

    it('should import simple process', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

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
      var xml = fs.readFileSync('test/fixtures/bpmn/collaboration.bpmn', 'utf8');

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
  });


  describe('model wiring', function() {

    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    var elements;

    beforeEach(function(done) {
      elements = [];

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {
        elements.push(e.element);
      });

      runImport(diagram, xml, done);
    });


    it('should wire root element', function() {

      // given
      var canvas = diagram.get('canvas');

      // when
      var root = elements[0];
      var anyChild = elements[1];

      // assume
      expect(root.businessObject.$instanceOf('bpmn:Process')).to.be.true;
      expect(anyChild.parent).to.eql(root);

      // then
      expect(canvas.getRootElement()).to.eql(root);
    });


    it('should wire parent child relationship', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      // then
      expect(startEventShape.type).to.equal('bpmn:StartEvent');
      expect(startEventShape.parent).to.eql(subProcessShape);

      expect(subProcessShape.children.length).to.equal(5);
    });


    it('should wire label relationship', function() {

      // when
      var startEventShape = elements[2];
      var label = startEventShape.label;

      // then
      expect(label).to.be.defined;
      expect(label.id).to.equal(startEventShape.id + '_label');

      expect(label.labelTarget).to.eql(startEventShape);
    });


    it('should wire businessObject', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      var subProcess = subProcessShape.businessObject,
          startEvent = startEventShape.businessObject;

      // then
      expect(subProcess).to.be.defined;
      expect(subProcess.$instanceOf('bpmn:SubProcess')).to.be.true;

      expect(startEvent).to.be.defined;
      expect(startEvent.$instanceOf('bpmn:StartEvent')).to.be.true;
    });


    it('should wire di', function() {

      // when
      var subProcessShape = elements[1];
      var startEventShape = elements[2];

      var subProcess = subProcessShape.businessObject,
          startEvent = startEventShape.businessObject;

      var subProcessDi = subProcess.di,
          startEventDi = startEvent.di;

      // then
      expect(subProcessDi).to.be.defined;
      expect(subProcessDi.bpmnElement).to.eql(subProcess);

      expect(startEventDi).to.be.defined;
      expect(startEventDi.bpmnElement).to.eql(startEvent);
    });

  });


  describe('forgiveness', function() {

    it('should import invalid flowElement', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/error/invalid-flow-element.bpmn', 'utf8');

      // when
      runImport(diagram, xml, function(err, warnings) {

        expect(warnings.length).to.equal(1);

        done(err);
      });
    });


    it('should import multiple dis', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/error/multiple-dis.bpmn', 'utf8');

      // when
      runImport(diagram, xml, function(err, warnings) {

        var expectedMessage =
          'multiple DI elements defined for <bpmn:InclusiveGateway id="InclusiveGateway_1" />';

        expect(warnings.length).to.equal(1);
        expect(warnings[0].message).to.equal(expectedMessage);

        done(err);
      });
    });


    it('should extend missing attribute with default value', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures//bpmn/draw/gateway-type-default.bpmn', 'utf8');

      // when
      runImport(diagram, xml, function(err, warnings) {

        var elementRegistry = diagram.get('elementRegistry');

        var element = elementRegistry.get('GATEWAY_1');

        expect(element.businessObject.eventGatewayType).to.equal('Exclusive');

        done();
      });
    });

  });


  describe('integration', function() {

    it('should import complex', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/complex.bpmn', 'utf8');

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(warnings.length).to.equal(0);

        done(err);
      });
    });


    it('should import dangling process message flows', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/import/dangling-process-message-flow.bpmn', 'utf8');

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

    var xml1 = fs.readFileSync('test/fixtures/bpmn/import/position/position-testcase.bpmn', 'utf8');

    it('should round shape\'s x and y coordinates', function(done) {

      // given
      var events = {};

      // log events
      diagram.get('eventBus').on('bpmnElement.added', function(e) {

        events[e.element.id] = e.element;
      });

      runImport(diagram, xml1, function(err, warnings) {

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

      runImport(diagram, xml1, function(err, warnings) {

        //round down
        expect(events.ID_Start.height).to.equal(Math.round(30.4));
        expect(events.ID_Start.width).to.equal(Math.round(30.4));

        done(err);
      });
    });

  });

});
