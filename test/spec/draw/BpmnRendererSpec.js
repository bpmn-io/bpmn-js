import {
  bootstrapModeler,
  bootstrapViewer,
  inject
} from 'test/TestHelper';

import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import coreModule from 'lib/core';
import rendererModule from 'lib/draw';
import modelingModule from 'lib/features/modeling';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { getVisual } from 'diagram-js/lib/util/GraphicsUtil';

import { isAny } from 'lib/features/modeling/util/ModelingUtil';

import { isExpanded } from 'lib/util/DiUtil';

import { isPlane } from 'lib/util/DrilldownUtil';

import {
  getDi,
  black,
  white
} from 'lib/draw/BpmnRenderUtil';

import customRendererModule from './custom-renderer';


/**
 * @typedef {import('../../../lib/model/Types').Element} Element
 */

function checkErrors(err, warnings) {
  expect(warnings).to.be.empty;
  expect(err).not.to.exist;
}


describe('draw - bpmn renderer', function() {

  it('should render labels', function() {
    var xml = require('./BpmnRenderer.labels.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render activity markers', function() {
    var xml = require('../../fixtures/bpmn/draw/activity-markers.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render association markers', function() {
    var xml = require('../../fixtures/bpmn/draw/associations.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render activity markers (combination)', function() {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-combination.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional flows', function() {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional default flows', function() {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-default.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      return checkErrors(result.error, result.warnings);
    });
  });


  it('should render NO conditional flow (gateway)', function() {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional flow (typed task)', function() {
    var xml = require('../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render data objects', function() {
    var xml = require('../../fixtures/bpmn/draw/data-objects.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render events', function() {
    var xml = require('../../fixtures/bpmn/draw/events.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render events (interrupting)', function() {
    var xml = require('../../fixtures/bpmn/draw/events-interrupting.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render event subprocesses (collapsed)', function() {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render event subprocesses (expanded)', function() {
    var xml = require('../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render gateways', function() {
    var xml = require('../../fixtures/bpmn/draw/gateways.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render group', function() {
    var xml = require('../../fixtures/bpmn/draw/group.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render message marker', function() {
    var xml = require('../../fixtures/bpmn/draw/message-marker.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render message label', function() {
    var xml = require('../../fixtures/bpmn/draw/message-label.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {
      checkErrors(result.error, result.warnings);
      inject(function(elementRegistry) {

        var dataFlow = elementRegistry.getGraphics('dataFlow');

        expect(domQuery('.djs-label', dataFlow)).to.exist;
      })();
    });
  });


  it('should render pools', function() {
    var xml = require('../../fixtures/bpmn/draw/pools.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render vertical pools', function() {
    var xml = require('../../fixtures/bpmn/draw/vertical-pools.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render pool collection marker', function() {
    var xml = require('../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render task types', function() {
    var xml = require('../../fixtures/bpmn/draw/task-types.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render text annotations', function() {
    var xml = require('../../fixtures/bpmn/draw/text-annotation.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render flow markers', function() {
    var xml = require('../../fixtures/bpmn/flow-markers.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render xor gateways blank and with X', function() {
    var xml = require('../../fixtures/bpmn/draw/xor.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary events with correct z-index', function() {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-z-index.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary events without flowNodeRef', function() {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function() {
    var xml = require('../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render gateway event if attribute is missing in XML', function() {
    var xml = require('../../fixtures/bpmn/draw/gateway-type-default.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render call activity', function() {
    var xml = require('../../fixtures/bpmn/draw/call-activity.bpmn');

    return bootstrapViewer(xml).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('CallActivity');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=sub-process]', callActivityGfx)).to.exist;
      })();
    });

  });


  it('should render adhoc sub process', function() {
    var xml = require('../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

    return bootstrapViewer(xml).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(elementRegistry) {

        var callActivityGfx = elementRegistry.getGraphics('AdHocSubProcess');

        // make sure the + marker is shown
        expect(domQuery('[data-marker=adhoc]', callActivityGfx)).to.exist;
      })();
    });

  });


  it('should add random ID suffix to marker ID', function() {

    var xml = require('../../fixtures/bpmn/simple.bpmn');
    return bootstrapViewer(xml).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(canvas) {
        var svg = canvas._svg;
        var markers = svg.querySelectorAll('marker');

        expect(markers[0].id).to.match(/^marker-[A-Za-z0-9]+$/);
      })();
    });
  });


  it('should properly render colored markers', function() {
    var xml = require('./BpmnRenderer.colors.bpmn');

    return bootstrapViewer(xml).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(canvas) {

        [
          [ 'SequenceFlow_1jrsqqc' , 'blue' , 'blue' ],
          [ 'SequenceFlow_0h9s0mp' , 'rgba(255, 0, 0, 0.9)' ],
          [ 'SequenceFlow_0pqo7zt' , 'rgb(251, 140, 0)' , 'rgb(251, 140, 0)' ],
          [ 'SequenceFlow_1qt82pt' , 'blue' , 'blue' ],
          [ 'SequenceFlow_17ohrlh' , 'rgb(251, 140, 0)' , 'rgb(251, 140, 0)' ],
          [ 'MessageFlow_11bysyp' , 'rgb(251, 140, 0)' , 'rgb(255, 224, 178)' ],
          [ 'MessageFlow_1qyovto' , 'rgb(251, 140, 0)' , 'rgb(255, 224, 178)' ],
          [ 'DataInputAssociation_1ncouqr' , 'rgb(251, 140, 0)' , 'none' ],
          [ 'DataOutputAssociation_1i89wkc' , 'rgb(251, 140, 0)' , 'none' ]
        ].forEach(([ id, stroke, fill ]) => {
          var svg = canvas._svg,
              markerPath = svg.querySelector(`[data-element-id="${id}"] marker path`);

          expect(markerPath).to.exist;

          stroke && expect(markerPath.style.stroke).to.eql(stroke);
          fill && expect(markerPath.style.fill).to.eql(fill);
        });
      })();
    });
  });


  it('should properly render connection markers (2)', function() {
    var xml = require('./BpmnRenderer.connection-colors.bpmn');

    return bootstrapViewer(xml).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(canvas) {

        [
          [ 'MessageFlow_1facuin', 'rgb(23, 100, 255)', 'rgb(23, 100, 255)' ],
          [ 'MessageFlow_1vmbq3n', 'rgb(23, 100, 255)', 'rgb(23, 100, 255)' ],
          [ 'DataInputAssociation', 'rgb(23, 100, 255)', 'none' ],
          [ 'DataOutputAssociation_0ixhole', 'rgb(142, 36, 170)', 'none' ],
        ].forEach(([ id, stroke, fill ]) => {
          var svg = canvas._svg,
              markerPath = svg.querySelector(`[data-element-id="${id}"] marker path`);

          console.log(id, markerPath);
          expect(markerPath).to.exist;

          stroke && expect(markerPath.style.stroke).to.eql(stroke);
          fill && expect(markerPath.style.fill).to.eql(fill);

        });
      })();
    });
  });


  it('should render sequenceFlows without source', function() {

    var xml = require('./BpmnRenderer.sequenceFlow-no-source.bpmn');
    return bootstrapModeler(xml, {
      modules: [
        coreModule,
        rendererModule,
        modelingModule
      ]
    }).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

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
    });

  });


  describe('colors', function() {

    var xml = require('./BpmnRenderer.colors.bpmn');

    var groupXML = require('./BpmnRenderer.group-colors.bpmn');

    it('should render colors without warnings and errors', function() {
      return bootstrapViewer(xml).call(this).then(function(result) {

        checkErrors(result.error, result.warnings);
      });
    });


    it('should render group colors', function() {
      return bootstrapViewer(groupXML).call(this).then(function(result) {

        checkErrors(result.error, result.warnings);
      });
    });


    describe('default colors', function() {

      var defaultFillColor = 'red',
          defaultStrokeColor = 'lime',
          defaultLabelColor = 'blue';

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
          defaultStrokeColor: defaultStrokeColor,
          defaultLabelColor: defaultLabelColor
        }
      }));

      function expectFillColor(element, color) {
        expect(expectedColors(color)).to.include(element.style.fill);
      }

      function expectStrokeColor(element, color) {
        expect(expectedColors(color)).to.include(element.style.stroke);
      }

      /**
       * Expect colors depending on element type.
       *
       * @param {Element} element - Element.
       * @param {SVGElement} gfx - Graphics of element.
       * @param {string} fillColor - Fill color to expect.
       * @param {string} strokeColor - Stroke color to expect.
       */
      function expectColors(element, gfx, fillColor, strokeColor, labelColor) {
        var djsVisual = domQuery('.djs-visual', gfx);

        var circle, path, polygon, polyline, rect, text;

        if (element.labelTarget) {
          text = domQuery('text', djsVisual);

          expectFillColor(text, labelColor);
        } else if (element.waypoints) {
          path = domQuery('path', djsVisual);
          polyline = domQuery('polyline', djsVisual);

          expectStrokeColor(path || polyline, strokeColor);
        } else if (isAny(element, [ 'bpmn:StartEvent', 'bpmn:EndEvent' ])) {
          circle = domQuery('circle', djsVisual);

          expectFillColor(circle, fillColor);
          expectStrokeColor(circle, strokeColor);
        } else if (isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess', 'bpmn:Participant' ])) {
          rect = domQuery('rect', djsVisual);
          text = domQuery('text', djsVisual);

          expectFillColor(rect, fillColor);
          expectStrokeColor(rect, strokeColor);
          expectFillColor(text, labelColor);
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
              fillColor = di.get('color:background-color') || di.get('bioc:fill') || defaultFillColor,
              strokeColor = di.get('color:border-color') || di.get('bioc:stroke') || defaultStrokeColor,
              labelDi = di.get('label'),
              labelColor = labelDi && labelDi.get('color:color') || defaultLabelColor;

          expectColors(element, gfx, fillColor, strokeColor, labelColor);
        });
      }));


      describe('events', function() {

        const diagramXML = require('../../fixtures/bpmn/draw/events.bpmn');

        beforeEach(bootstrapModeler(diagramXML, {
          bpmnRenderer: {
            defaultFillColor: defaultFillColor,
            defaultStrokeColor: defaultStrokeColor,
            defaultLabelColor: defaultLabelColor
          }
        }));

        it('should not fill multiple parallel events', inject(function(elementRegistry) {

          // given
          var parallelMultiple = elementRegistry.get('StartEvent_multiple_parallel_1');
          var visual = getVisual(elementRegistry.getGraphics(parallelMultiple));
          var path = domQuery('path', visual);

          // then
          expectFillColor(path, defaultFillColor);
          expectStrokeColor(path, defaultStrokeColor);

        }));

      });

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

      // unsafe to use render APIs
      expect(bpmnRenderer._drawPath).to.be.a('function');
      expect(bpmnRenderer._renderer).to.be.a('function');

      // very unsafe to use internal state
      expect(bpmnRenderer.handlers).to.exist;
    }));

  });


  describe('attrs', function() {

    describe('colors', function() {

      const diagramXML = require('../../fixtures/bpmn/kitchen-sink.bpmn');

      class CustomColors {
        constructor(eventBus) {
          eventBus.on([ 'render.shape', 'render.connection' ], 100000, (_, context) => {
            context.attrs = {
              fill: 'yellow',
              fillOpacity: 0.1, // should be ignored
              stroke: 'blue',
              strokeDasharray: '0, 10', // should be ignored
              strokeWidth: 10 // should be ignored
            };
          });
        }
      }

      CustomColors.$inject = [ 'eventBus' ];

      beforeEach(bootstrapModeler(diagramXML, {
        bpmnRenderer: {
          defaultFillColor: 'cyan',
          defaultStrokeColor: 'red'
        },
        additionalModules: [
          {
            __init__: [ 'customColors' ],
            customColors: [ 'type', CustomColors ]
          }
        ]
      }));


      it('should override colors', inject(function(canvas) {

        // then
        var container = canvas.getContainer();

        // expect fill and stroke overridden
        domQueryAll('.djs-visual *', container).forEach(element => {
          expect(svgAttr(element, 'fill')).not.to.equal('cyan');
          expect(svgAttr(element, 'fill')).not.to.equal(white);
          expect(svgAttr(element, 'stroke')).not.to.equal('red');
          expect(svgAttr(element, 'stroke')).not.to.equal(black);
        });

        // expect all others not overridden
        domQueryAll('.djs-visual *', container).forEach(element => {
          expect(svgAttr(element, 'stroke-dasharray')).not.to.equal('0, 9000');
          expect(svgAttr(element, 'stroke-width')).not.to.equal('9000');
        });
      }));

    });


    describe('bounds', function() {

      const diagramXML = require('../../fixtures/bpmn/kitchen-sink.bpmn');

      class CustomBounds {
        constructor(eventBus) {
          eventBus.on('render.shape', 100000, (_, context) => {
            context.attrs = {
              width: 200,
              height: 100,
              fillOpacity: 0.1, // should be ignored
              strokeDasharray: '0, 9000', // should be ignored
              strokeWidth: 9000 // should be ignored
            };
          });
        }
      }

      CustomBounds.$inject = [ 'eventBus' ];

      beforeEach(bootstrapModeler(diagramXML, {
        additionalModules: [
          {
            __init__: [ 'customBounds' ],
            customBounds: [ 'type', CustomBounds ]
          }
        ]
      }));


      it('should override bounds', inject(function(canvas, elementRegistry) {

        // then
        var container = canvas.getContainer();

        // expect width and height overridden
        elementRegistry.filter(element => {
          return isAny(element, [
            'bpmn:AdHocSubProcess',
            'bpmn:Group',
            'bpmn:Lane',
            'bpmn:Participant',
            'bpmn:SubProcess',
            'bpmn:TextAnnotation',
            'bpmn:Transaction'
          ]);
        }).forEach(element => {
          if (isPlane(element)) {
            return;
          }

          var visual = getVisual(elementRegistry.getGraphics(element));

          var rect = domQuery('rect', visual);

          if (rect) {

            if (isCollapsedSubProcess(element)) {
              expect(svgAttr(rect, 'width')).to.equal('100');
              expect(svgAttr(rect, 'height')).to.equal('80');
            } else {
              expect(svgAttr(rect, 'width')).to.equal('200');
              expect(svgAttr(rect, 'height')).to.equal('100');
            }
          }
        });

        // expect all others not overridden
        domQueryAll('.djs-visual *', container).forEach(element => {
          expect(svgAttr(element, 'stroke-dasharray')).not.to.equal('0, 9000');
          expect(svgAttr(element, 'stroke-width')).not.to.equal('9000');
        });
      }));
    });

  });


  describe('custom icons', function() {

    var xml = require('./BpmnRenderer.no-event-icons.bpmn');

    beforeEach(bootstrapViewer(xml, {
      additionalModules: [ customRendererModule ]
    }));


    it('should render blank', inject(function(elementRegistry) {

      // given
      var events = [
        'START_EVENT',
        'THROW_EVENT',
        'CATCH_EVENT',
        'END_EVENT',
        'BOUNDARY_EVENT'
      ];

      for (var elementId of events) {

        var gfx = elementRegistry.getGraphics(elementId);
        var iconGfx = domQuery('path', gfx);

        expect(iconGfx, `icon on element <#${ elementId }>`).not.to.exist;
      }
    }));

  });

});

function isCollapsedSubProcess(element) {
  return isAny(element, [
    'bpmn:SubProcess',
    'bpmn:AdHocSubProcess',
    'bpmn:Transaction'
  ]) && !isExpanded(element);
}