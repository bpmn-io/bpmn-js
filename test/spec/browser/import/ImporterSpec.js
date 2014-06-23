'use strict';

var Matchers = require('../../Matchers'),
    TestHelper = require('../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var Diagram = require('diagram-js/lib/Diagram'),
    BpmnModel = require('bpmn-moddle'),
    Importer = require('../../../../lib/import/Importer'),
    Viewer = require('../../../../lib/Viewer');


describe('import - importer', function() {

  var bpmnModel = BpmnModel.instance();

  function read(xml, opts, callback) {
    return BpmnModel.fromXML(xml, 'bpmn:Definitions', opts, callback);
  }

  beforeEach(Matchers.add);


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createDiagram() {
    return new Diagram({
      canvas: { container: container },
      modules: Viewer.modules
    });
  }

  var diagram;

  beforeEach(function() {
    diagram = createDiagram();
  });


  function runImport(diagram, xml, done) {
    BpmnModel.fromXML(xml, function(err, definitions) {
      if (err) {
        return done(err);
      }

      Importer.importBpmnDiagram(diagram, definitions, done);
    });
  }


  describe('event emitter', function() {

    it('should fire <bpmn.element.add> during import', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmn.element.add', function(e) {
        events.push({ type: 'add', semantic: e.semantic.id, di: e.di.id, diagramElement: e.diagramElement.id });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).toEqual([
          { type: 'add', semantic: 'SubProcess_1', di: '_BPMNShape_SubProcess_2', diagramElement: 'SubProcess_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_2', diagramElement: 'StartEvent_1' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' }
        ]);

        done(err);
      });
    });

  });


  describe('basics', function() {

    it('should import process', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmn.element.add', function(e) {
        events.push({ type: 'add', semantic: e.semantic.id, di: e.di.id, diagramElement: e.diagramElement.id });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).toEqual([
          { type: 'add', semantic: 'SubProcess_1', di: '_BPMNShape_SubProcess_2', diagramElement: 'SubProcess_1' },
          { type: 'add', semantic: 'StartEvent_1', di: '_BPMNShape_StartEvent_2', diagramElement: 'StartEvent_1' },
          { type: 'add', semantic: 'Task_1', di: '_BPMNShape_Task_2', diagramElement: 'Task_1' },
          { type: 'add', semantic: 'SequenceFlow_1', di: 'BPMNEdge_SequenceFlow_1', diagramElement: 'SequenceFlow_1' }
        ]);

        done(err);
      });
    });


    it('should import collaboration', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/collaboration.bpmn', 'utf8');

      var events = [];

      // log events
      diagram.get('eventBus').on('bpmn.element.add', function(e) {
        events.push({ type: 'add', semantic: e.semantic.id, di: e.di.id, diagramElement: e.diagramElement.id });
      });

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(events).toEqual([
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

  describe('command stack integration', function() {

    it('should clear stack after import', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      var commandStack = diagram.get('commandStack');

      // when
      runImport(diagram, xml, function(err, warnings) {

        // then
        expect(commandStack.getStack()).toEqual([]);

        done(err);
      });
    });

  });


  describe('forgiveness', function() {

    it('should import invalid flowElement', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/error/invalid-flow-element.bpmn', 'utf8');

      var commandStack = diagram.get('commandStack');

      // when
      runImport(diagram, xml, function(err, warnings) {

        expect(warnings.length).toBe(1);

        done(err);
      });
    });

  });

});