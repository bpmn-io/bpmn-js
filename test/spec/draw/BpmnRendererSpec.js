'use strict';

require('../../TestHelper');

var svgCreate = require('tiny-svg/lib/create');

var coreModule = require('../../../lib/core'),
    rendererModule = require('../../../lib/draw'),
    modelingModule = require('../../../lib/features/modeling');

var domQuery = require('min-dom/lib/query');

/* global bootstrapViewer, bootstrapModeler, inject */

function checkErrors(done) {
  return function(err, warnings) {
    expect(warnings).to.be.empty;
    expect(err).not.to.exist;
    done();
  };
}

describe('draw - bpmn renderer', function() {

  it('should render activity markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render association markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/associations.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render activity markers (combination)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-combination.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render conditional flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render conditional default flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-default.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render NO conditional flow (gateway)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render conditional flow (typed task)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render data objects', function(done) {
    var xml = require('../../fixtures/bpmn/draw/data-objects.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render events', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render events (interrupting)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events-interrupting.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render event subprocesses (collapsed)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render event subprocesses (expanded)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render gateways', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateways.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render group', function(done) {
    var xml = require('../../fixtures/bpmn/draw/group.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render message marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/message-marker.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render pools', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render pool collection marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render task types', function(done) {
    var xml = require('../../fixtures/bpmn/draw/task-types.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render text annotations', function(done) {
    var xml = require('../../fixtures/bpmn/draw/text-annotation.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render flow markers', function(done) {
    var xml = require('../../fixtures/bpmn/flow-markers.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render xor gateways blank and with X', function(done) {
    var xml = require('../../fixtures/bpmn/draw/xor.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render boundary events with correct z-index', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-z-index.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render boundary events without flowNodeRef', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render gateway event if attribute is missing in XML', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateway-type-default.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it.skip('should render colors', function(done) {
    var xml = require('../../fixtures/bpmn/draw/colors.bpmn');
    bootstrapViewer(xml)(checkErrors(done));
  });


  it('should render call activity', function(done) {
    var xml = require('../../fixtures/bpmn/draw/call-activity.bpmn');

    bootstrapViewer(xml)(function(err) {

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('CallActivity');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=sub-process]', callActivityGfx)).to.exist;

        done(err);
      })();
    });

  });


  it('should render adhoc sub process', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

    bootstrapViewer(xml)(function(err) {

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('AdHocSubProcess');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=adhoc]', callActivityGfx)).to.exist;

        done(err);
      })();
    });

  });


  it('should add random ID suffix to marker ID', function(done) {

    var xml = require('../../fixtures/bpmn/simple.bpmn');
    bootstrapViewer(xml)(function(err) {

      inject(function(canvas) {
        var svg = canvas._svg;
        var markers = svg.querySelectorAll('marker');

        expect(markers[0].id).to.match(/^sequenceflow-end-white-black-[A-Za-z0-9]+$/);
      })();

      done(err);
    });
  });


  it('should properly render colored markers', function(done) {

    var xml = require('../../fixtures/bpmn/draw/colors.bpmn');
    bootstrapViewer(xml)(function(err) {

      inject(function(canvas) {
        var svg = canvas._svg;
        var markers = svg.querySelectorAll('marker');

        expect(markers).to.have.length(5);
        expect(markers[0].id).to.match(/^sequenceflow-end-white-black-[A-Za-z0-9]{25}$/);
        expect(markers[4].id).to.match(/^messageflow-start-white-fuchsia-[A-Za-z0-9]{25}$/);
      })();

      done(err);
    });
  });


  it('should render sequenceFlows without source', function(done) {

    var xml = require('../../fixtures/bpmn/draw/colors.bpmn');
    bootstrapModeler(xml, {
      modules: [
        coreModule,
        rendererModule,
        modelingModule
      ]
    })(function(err) {

      inject(function(elementFactory, graphicsFactory) {

        // given
        var g = svgCreate('g');

        var connection = elementFactory.create('connection', {
          type: 'bpmn:SequenceFlow',
          waypoints: [
            { x: 0, y: 0 },
            { x: 10, y: 100 }
          ]
        });

        var gfx = graphicsFactory.drawConnection(g, connection);

        expect(gfx).to.exist;
      })();

      done(err);
    });

  });


  describe('path', function() {

    var diagramXML = require('./BpmnRenderer.simple-cropping.bpmn');

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


  describe('extension API', function() {

    var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        rendererModule
      ]
    }));


    it('should expose helpers', inject(function(bpmnRenderer) {

      // then
      expect(bpmnRenderer._drawPath).to.be.a('function');

    }));

  });

});
