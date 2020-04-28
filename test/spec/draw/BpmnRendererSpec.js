import {
  bootstrapModeler,
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import {
  create as svgCreate
} from 'tiny-svg';

import coreModule from 'lib/core';
import rendererModule from 'lib/draw';
import modelingModule from 'lib/features/modeling';

import {
  query as domQuery
} from 'min-dom';

import { isAny } from 'lib/features/modeling/util/ModelingUtil';

import {
  getDi
} from 'lib/draw/BpmnRenderUtil';

function checkErrors(done) {
  return function(err, warnings) {
    expect(warnings).to.be.empty;
    expect(err).not.to.exist;
    done();
  };
}


describe('draw - bpmn renderer', function() {

  it('should render labels', function(done) {
    var xml = require('./BpmnRenderer.labels.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render activity markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render association markers', function(done) {
    var xml = require('../../fixtures/bpmn/draw/associations.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render activity markers (combination)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-combination.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render conditional flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render conditional default flows', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-default.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render NO conditional flow (gateway)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render conditional flow (typed task)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render data objects', function(done) {
    var xml = require('../../fixtures/bpmn/draw/data-objects.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render events', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render events (interrupting)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/events-interrupting.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render event subprocesses (collapsed)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render event subprocesses (expanded)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render gateways', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateways.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render group', function(done) {
    var xml = require('../../fixtures/bpmn/draw/group.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render message marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/message-marker.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render pools', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render pool collection marker', function(done) {
    var xml = require('../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render task types', function(done) {
    var xml = require('../../fixtures/bpmn/draw/task-types.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render text annotations', function(done) {
    var xml = require('../../fixtures/bpmn/draw/text-annotation.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render flow markers', function(done) {
    var xml = require('../../fixtures/bpmn/flow-markers.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render xor gateways blank and with X', function(done) {
    var xml = require('../../fixtures/bpmn/draw/xor.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render boundary events with correct z-index', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-z-index.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render boundary events without flowNodeRef', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function(done) {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render gateway event if attribute is missing in XML', function(done) {
    var xml = require('../../fixtures/bpmn/draw/gateway-type-default.bpmn');
    bootstrapViewer(xml).call(this, checkErrors(done));
  });


  it('should render call activity', function(done) {
    var xml = require('../../fixtures/bpmn/draw/call-activity.bpmn');

    bootstrapViewer(xml).call(this, function(err) {

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

    bootstrapViewer(xml).call(this, function(err) {

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
    bootstrapViewer(xml).call(this, function(err) {

      inject(function(canvas) {
        var svg = canvas._svg;
        var markers = svg.querySelectorAll('marker');

        expect(markers[0].id).to.match(/^sequenceflow-end-white-black-[A-Za-z0-9]+$/);
      })();

      done(err);
    });
  });


  it('should properly render colored markers', function(done) {
    var xml = require('./BpmnRenderer.colors.bpmn');

    bootstrapViewer(xml).call(this, function(err) {
      inject(function(canvas) {
        var svg = canvas._svg,
            markers = svg.querySelectorAll('marker');

        expect(markers).to.have.length(7);
        expect(markers[0].id).to.match(/^sequenceflow-end-rgb_255_224_178_-rgb_251_140_0_-[A-Za-z0-9]{25}$/);
        expect(markers[1].id).to.match(/^sequenceflow-end-yellow-blue-[A-Za-z0-9]{25}$/);
        expect(markers[2].id).to.match(/^sequenceflow-end-white-_3399aa-[A-Za-z0-9]{25}$/);
        expect(markers[3].id).to.match(/^sequenceflow-end-white-rgba_255_0_0_0_9_-[A-Za-z0-9]{25}$/);
        expect(markers[4].id).to.match(/^association-end-_FFE0B2-_FB8C00-[A-Za-z0-9]{25}$/);
        expect(markers[5].id).to.match(/^messageflow-end-_FFE0B2-_FB8C00-[A-Za-z0-9]{25}$/);
        expect(markers[6].id).to.match(/^messageflow-start-_FFE0B2-_FB8C00-[A-Za-z0-9]{25}$/);
      })();

      done(err);
    });
  });


  it('should properly render connection markers (2)', function(done) {
    var xml = require('./BpmnRenderer.connection-colors.bpmn');

    bootstrapViewer(xml).call(this, function(err) {
      inject(function(canvas) {
        var svg = canvas._svg,
            markers = svg.querySelectorAll('marker');

        expect(markers).to.have.length(4);
        expect(markers[0].id).to.match(/^association-end-rgb_23_100_344_-rgb_23_100_344_-[A-Za-z0-9]{25}$/);
        expect(markers[1].id).to.match(/^association-end-_E1BEE7-_8E24AA-[A-Za-z0-9]{25}$/);
        expect(markers[2].id).to.match(/^messageflow-end-rgb_23_100_344_-rgb_23_100_344_-[A-Za-z0-9]{25}$/);
        expect(markers[3].id).to.match(/^messageflow-start-rgb_23_100_344_-rgb_23_100_344_-[A-Za-z0-9]{25}$/);
      })();

      done(err);
    });
  });


  it('should render sequenceFlows without source', function(done) {

    var xml = require('./BpmnRenderer.sequenceFlow-no-source.bpmn');
    bootstrapModeler(xml, {
      modules: [
        coreModule,
        rendererModule,
        modelingModule
      ]
    }).call(this, function(err) {

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


  describe('colors', function() {

    var xml = require('./BpmnRenderer.colors.bpmn');

    var groupXML = require('./BpmnRenderer.group-colors.bpmn');

    it('should render colors without warnings and errors', function(done) {
      bootstrapViewer(xml).call(this, checkErrors(done));
    });


    it('should render group colors', function(done) {
      bootstrapViewer(groupXML).call(this, checkErrors(done));
    });


    describe('default colors', function() {

      var defaultFillColor = 'red',
          defaultStrokeColor = 'lime';

      // TODO(philippfromme): remove once we drop PhantomJS
      function expectedColors(color) {

        var conversionValues = {
          blue: '#0000ff',
          lime: '#00ff00',
          red: '#ff0000',
          yellow: '#ffff00',
          'rgb(251, 140, 0)': '#fb8c00',
          '#FB8C00': 'rgb(251, 140, 0)',
          '#3399aa': 'rgb(51, 153, 170)'
        };

        return [
          color,
          color.toLowerCase(),
          color.toUpperCase(),
          conversionValues[ color ],
          conversionValues[ color ] && conversionValues[ color ].toLowerCase(),
          conversionValues[ color ] && conversionValues[ color ].toUpperCase()
        ];
      }

      beforeEach(bootstrapViewer(xml,{
        bpmnRenderer: {
          defaultFillColor: defaultFillColor,
          defaultStrokeColor: defaultStrokeColor
        }
      }));

      // TODO(philippfromme): remove once we drop PhantomJS
      /**
       * Ensure alpha channel of RGB (rgba) color has one decimal point.
       *
       * @param {string} color
       *
       * @return {string}
       */
      function fixRgba(color) {
        if (color.indexOf('rgba') !== -1) {
          return [
            'rgba(',
            color
              .replace(/rgba\(|\)/g, '')
              .split(',')
              .map(function(string) {
                if (string.indexOf('.') !== -1) {
                  return parseFloat(string).toFixed(1);
                }

                return parseInt(string);
              })
              .join(', '),
            ')'
          ].join('');
        }

        return color;
      }

      function expectFillColor(element, color) {
        expect(expectedColors(color)).to.include(fixRgba(element.style.fill));
      }

      function expectStrokeColor(element, color) {
        expect(expectedColors(color)).to.include(fixRgba(element.style.stroke));
      }

      /**
       * Expect colors depending on element type.
       *
       * @param {djs.model.base} element - Element.
       * @param {SVG} gfx - Graphics of element.
       * @param {string} fillColor - Fill color to expect.
       * @param {string} strokeColor - Stroke color to expect.
       */
      function expectColors(element, gfx, fillColor, strokeColor) {
        var djsVisual = domQuery('.djs-visual', gfx);

        var circle, path, polygon, polyline, rect, text;

        if (element.labelTarget) {
          text = domQuery('text', djsVisual);

          expectFillColor(text, strokeColor);
        } else if (element.waypoints) {
          path = domQuery('path', djsVisual);
          polyline = domQuery('polyline', djsVisual);

          expectStrokeColor(path || polyline, strokeColor);
        } else if (isAny(element, [ 'bpmn:StartEvent', 'bpmn:EndEvent' ])) {
          circle = domQuery('circle', djsVisual);

          expectFillColor(circle, fillColor);
          expectStrokeColor(circle, strokeColor);
        } else if (isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess', 'bpmn:Particpant' ])) {
          rect = domQuery('rect', djsVisual);
          text = domQuery('text', djsVisual);

          expectFillColor(rect, fillColor);
          expectStrokeColor(rect, strokeColor);
          expectFillColor(text, strokeColor);
        } else if (isAny(element, [ 'bpmn:Gateway' ])) {
          polygon = domQuery('polygon', djsVisual);

          expectFillColor(polygon, fillColor);
          expectStrokeColor(polygon, strokeColor);
        }
      }


      it('should render default colors without overriding', inject(function(canvas, elementRegistry) {
        var rootElement = canvas.getRootElement();

        elementRegistry.forEach(function(element) {
          if (element === rootElement) {
            return;
          }

          var gfx = elementRegistry.getGraphics(element),
              di = getDi(element),
              fillColor = di.get('bioc:fill'),
              strokeColor = di.get('bioc:stroke');

          if (fillColor || strokeColor) {
            expectColors(element, gfx, fillColor, strokeColor);
          } else {
            expectColors(element, gfx, defaultFillColor, defaultStrokeColor);
          }
        });
      }));

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
