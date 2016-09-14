'use strict';

var Modeler = require('../../lib/Modeler');

var TestContainer = require('mocha-test-container-support');

describe('Modeler', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });
  }


  it('should import simple process', function(done) {
    var xml = require('../fixtures/bpmn/simple.bpmn');
    createModeler(xml, done);
  });


  it('should import collaboration', function(done) {
    var xml = require('../fixtures/bpmn/collaboration-message-flows.bpmn');
    createModeler(xml, done);
  });


  it('should import nested lanes', function(done) {
    var xml = require('./features/modeling/lanes/lanes.bpmn');
    createModeler(xml, done);
  });


  it.only('should import complex', function(done) {
    var xml = require('../fixtures/bpmn/complex.bpmn');
    createModeler(xml, done);
  });


  it('should not import empty definitions', function(done) {
    var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

    // given
    createModeler(xml, function(err, warnings, modeler) {

      // when
      modeler.importXML(xml, function(err, warnings) {

        // then
        expect(err.message).to.equal('no diagram to display');

        done();
      });

    });
  });


  it('should re-import simple process', function(done) {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    // given
    createModeler(xml, function(err, warnings, modeler) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      modeler.importXML(xml, function(err, warnings) {

        if (err) {
          return done(err);
        }

        // then
        expect(warnings.length).to.equal(0);

        done();
      });

    });
  });


  describe('defaults', function() {

    it('should use <body> as default parent', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var modeler = new Modeler();

      modeler.importXML(xml, function(err, warnings) {

        expect(modeler.container.parentNode).to.equal(document.body);

        done(err, warnings);
      });
    });

  });


  describe('translate support', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should allow translation of multi-lingual strings', function(done) {

      createModeler(xml, function(err, warnings, modeler) {

        // given
        var translate = modeler.get('translate');

        // assume
        expect(translate).to.exist;

        // when
        var interpolatedString = translate('HELLO {you}!', { you: 'WALT' });

        // then
        expect(interpolatedString).to.eql('HELLO WALT!');

        done(err);
      });

    });

  });


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createModeler(xml, function(err, warnings, modeler) {

        // given
        var overlays = modeler.get('overlays'),
            elementRegistry = modeler.get('elementRegistry');

        // assume
        expect(overlays).to.exist;
        expect(elementRegistry).to.exist;


        // when
        overlays.add('SubProcess_1', 'badge', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        overlays.add('StartEvent_1', 'badge', {
          position: {
            top: 0,
            left: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1', type: 'badge' }).length).to.equal(1);
        expect(overlays.get({ element: 'StartEvent_1', type: 'badge' }).length).to.equal(1);

        done(err);
      });

    });

  });


  describe('bendpoint editing support', function() {

    var createEvent = require('../util/MockEvents').createEvent;


    it('should allow to edit bendpoints', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createModeler(xml, function(err, warnings, modeler) {

        // given
        var bendpointMove = modeler.get('bendpointMove'),
            dragging = modeler.get('dragging'),
            elementRegistry = modeler.get('elementRegistry'),
            canvas = modeler.get('canvas');

        // assume
        expect(bendpointMove).to.exist;

        // when
        bendpointMove.start(createEvent(canvas, { x: 0, y: 0 }), elementRegistry.get('SequenceFlow_1'), 1);
        dragging.move(createEvent(canvas, { x: 200, y: 200 }));

        done(err);
      });

    });

  });


  describe('configuration', function() {

    // given
    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should configure Canvas', function(done) {

      // given
      var modeler = new Modeler({
        container: container,
        canvas: {
          deferUpdate: true
        }
      });

      // when
      modeler.importXML(xml, function(err) {

        var canvasConfig = modeler.get('config.canvas');

        // then
        expect(canvasConfig.deferUpdate).to.be.true;

        done();
      });

    });

  });


  describe('ids', function() {

    it('should provide ids with moddle', function() {

      // given
      var modeler = new Modeler({ container: container });

      // when
      var moddle = modeler.get('moddle');

      // then
      expect(moddle.ids).to.exist;
    });


    it('should populate ids on import', function(done) {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');

      var modeler = new Modeler({ container: container });

      var moddle = modeler.get('moddle');
      var elementRegistry = modeler.get('elementRegistry');

      // when
      modeler.importXML(xml, function(err) {

        var subProcess = elementRegistry.get('SubProcess_1').businessObject;
        var bpmnEdge = elementRegistry.get('SequenceFlow_3').businessObject.di;

        // then
        expect(moddle.ids.assigned('SubProcess_1')).to.eql(subProcess);
        expect(moddle.ids.assigned('BPMNEdge_SequenceFlow_3')).to.eql(bpmnEdge);

        done();
      });

    });


    it('should clear ids before re-import', function(done) {

      // given
      var someXML = require('../fixtures/bpmn/simple.bpmn'),
          otherXML = require('../fixtures/bpmn/basic.bpmn');

      var modeler = new Modeler({ container: container });

      var moddle = modeler.get('moddle');
      var elementRegistry = modeler.get('elementRegistry');

      // when
      modeler.importXML(someXML, function() {

        modeler.importXML(otherXML, function() {

          var task = elementRegistry.get('Task_1').businessObject;

          // then
          // not in other.bpmn
          expect(moddle.ids.assigned('SubProcess_1')).to.be.false;

          // in other.bpmn
          expect(moddle.ids.assigned('Task_1')).to.eql(task);

          done();
        });
      });

    });

  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {

      expect(err).to.exist;

      done();
    });
  });


  it('should create new diagram', function(done) {
    var modeler = new Modeler({ container: container });
    modeler.createDiagram(done);
  });


  describe('dependency injection', function() {

    it('should provide self as <bpmnjs>', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createModeler(xml, function(err, warnings, modeler) {

        expect(modeler.get('bpmnjs')).to.equal(modeler);

        done(err);
      });
    });


    it('should allow Diagram#get before import', function() {

      // when
      var modeler = new Modeler({ container: container });

      // then
      var eventBus = modeler.get('eventBus');

      expect(eventBus).to.exist;
    });


    it('should keep references to services across re-import', function(done) {

      // given
      var someXML = require('../fixtures/bpmn/simple.bpmn'),
          otherXML = require('../fixtures/bpmn/basic.bpmn');

      var modeler = new Modeler({ container: container });

      var eventBus = modeler.get('eventBus'),
          canvas = modeler.get('canvas');

      // when
      modeler.importXML(someXML, function() {

        // then
        expect(modeler.get('canvas')).to.equal(canvas);
        expect(modeler.get('eventBus')).to.equal(eventBus);

        modeler.importXML(otherXML, function() {

          // then
          expect(modeler.get('canvas')).to.equal(canvas);
          expect(modeler.get('eventBus')).to.equal(eventBus);

          done();
        });
      });

    });

  });


  it('should expose Viewer and NavigatedViewer', function() {

    // given
    var Viewer = require('../../lib/Viewer');
    var NavigatedViewer = require('../../lib/NavigatedViewer');

    // then
    expect(Modeler.Viewer).to.equal(Viewer);
    expect(Modeler.NavigatedViewer).to.equal(NavigatedViewer);
  });

});
