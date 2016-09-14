'use strict';

require('../../TestHelper');

var coreModule = require('../../../lib/core'),
    rendererModule = require('../../../lib/draw');

var domQuery = require('min-dom/lib/query');

/* global bootstrapViewer, bootstrapModeler, inject */


describe('draw - bpmn renderer', function() {

  it('should render activity markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render association markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/associations.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render activity markers (combination)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-combination.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional default flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-default.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render NO conditional flow (gateway)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render conditional flow (typed task)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render data objects', function(done) {
    var xml = require('../../fixtures/bpmn/draw/data-objects.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render events', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render events (interrupting)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events-interrupting.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (collapsed)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render event subprocesses (expanded)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render gateways', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateways.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render group', function(done) {
    var xml = require('../../fixtures/bpmn/draw/group.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render message marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/message-marker.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render pools', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render pool collection marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render task types', function(done) {
    var xml = require('../../fixtures/bpmn/draw/task-types.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render text annotations', function(done) {
    var xml = require('../../fixtures/bpmn/draw/text-annotation.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render flow markers', function(done) {
    var xml = require('../../fixtures/bpmn/flow-markers.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render xor gateways blank and with X', function(done) {
    var xml = require('../../fixtures/bpmn/draw/xor.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render boundary events with correct z-index', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-z-index.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render boundary events without flowNodeRef', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render gateway event if attribute is missing in XML', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateway-type-default.bpmn');
    bootstrapViewer(xml)(done);
  });


  it('should render call activity', function(done) {
    var xml = require('../../fixtures/bpmn/draw/call-activity.bpmn');

    bootstrapViewer(xml)(function(err) {

      if (err) {
        return done(err);
      }

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('CallActivity');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=sub-process]', callActivityGfx)).to.exist;

        done();
      })();
    });

  });


  it('should render adhoc sub process', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

    bootstrapViewer(xml)(function(err) {

      if (err) {
        return done(err);
      }

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('AdHocSubProcess');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=adhoc]', callActivityGfx)).to.exist;

        done();
      })();
    });

  });


  describe('path', function() {

    var diagramXML = require('../../fixtures/bpmn/simple-cropping.bpmn');

    var testModules = [ coreModule, rendererModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    describe('circle', function() {

      it('should return a circle path', inject(function(canvas, elementRegistry, graphicsFactory) {

        // given
        var eventElement = elementRegistry.get('StartEvent_1');

        // when
        var startPath = graphicsFactory.getShapePath(eventElement);

        // then
        expect(startPath).to.equal('M247,343m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-36z');
      }));


      it('should return a diamond path', inject(function(canvas, elementRegistry, graphicsFactory) {

        // given
        var gatewayElement = elementRegistry.get('ExclusiveGateway_1');

        // when
        var gatewayPath = graphicsFactory.getShapePath(gatewayElement);

        // then
        expect(gatewayPath).to.equal('M418,318l25,25l-25,25l-25,-25z');
      }));


      it('should return a rounded rectangular path', inject(function(canvas, elementRegistry, graphicsFactory) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');

        // when
        var subProcessPath = graphicsFactory.getShapePath(subProcessElement);

        // then
        expect(subProcessPath).to.equal('M584,243l330,0a10,10,0,0,1,10,10l0,180a10,10,0,0,1,-10,10' +
        'l-330,0a10,10,0,0,1,-10,-10l0,-180a10,10,0,0,1,10,-10z');
      }));


      it('should return a rectangular path', inject(function(canvas, elementRegistry, graphicsFactory) {

        // given
        var TextAnnotationElement = elementRegistry.get('TextAnnotation_1');

        // when
        var TextAnnotationPath = graphicsFactory.getShapePath(TextAnnotationElement);

        // then
        expect(TextAnnotationPath).to.equal('M368,156l100,0l0,80l-100,0z');
      }));

    });

  });

});
