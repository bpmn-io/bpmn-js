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


  it('should fire <bpmn.element.add> during import', function(done) {

    // given
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    var diagram = createDiagram();

    var events = [];

    // log events
    diagram.get('eventBus').on('bpmn.element.add', function(e) {
      events.push({ type: 'add', semantic: e.semantic.id, di: e.di.id, diagramElement: e.diagramElement.id });
    });

    // when
    BpmnModel.fromXML(xml, function(err, definitions) {
      if (err) {
        return done(err);
      }

      // when
      Importer.importBpmnDiagram(diagram, definitions, function(err) {

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


  it('should clear commandStack after import', function(done) {

    // given
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    var diagram = createDiagram();

    var commandStack = diagram.get('commandStack');

    // when
    BpmnModel.fromXML(xml, function(err, definitions) {
      if (err) {
        return done(err);
      }

      // when
      Importer.importBpmnDiagram(diagram, definitions, function(err) {
        expect(commandStack.getStack()).toEqual([]);

        done(err);
      });
    });
  });

});