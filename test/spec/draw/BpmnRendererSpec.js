import { expect } from 'chai';
import {
  bootstrapModeler,
  bootstrapViewer,
  inject
} from 'bpmn-js/test/TestHelper.js';

import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import coreModule from 'bpmn-js/lib/core';
import rendererModule from 'bpmn-js/lib/draw';
import modelingModule from 'bpmn-js/lib/features/modeling';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { getVisual } from 'diagram-js/lib/util/GraphicsUtil.js';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil.js';

import { isExpanded } from 'bpmn-js/lib/util/DiUtil.js';

import { isPlane } from 'bpmn-js/lib/util/DrilldownUtil.js';

import {
  getDi,
  black,
  white
} from 'bpmn-js/lib/draw/BpmnRenderUtil.js';

import customRendererModule from './custom-renderer/index.js';

import { expectSvgPath } from '../../util/svgHelpers.js';

import labelsXML from './BpmnRenderer.labels.bpmn';
import activityMarkersXML from '../../fixtures/bpmn/draw/activity-markers.bpmn';
import associationsXML from '../../fixtures/bpmn/draw/associations.bpmn';
import activityMarkersCombinationXML from '../../fixtures/bpmn/draw/activity-markers-combination.bpmn';
import conditionalFlowXML from '../../fixtures/bpmn/draw/conditional-flow.bpmn';
import conditionalFlowDefaultXML from '../../fixtures/bpmn/draw/conditional-flow-default.bpmn';
import conditionalFlowGatewaysXML from '../../fixtures/bpmn/draw/conditional-flow-gateways.bpmn';
import conditionalFlowTypedTaskXML from '../../fixtures/bpmn/draw/conditional-flow-typed-task.bpmn';
import dataObjectsXML from '../../fixtures/bpmn/draw/data-objects.bpmn';
import eventsXML from '../../fixtures/bpmn/draw/events.bpmn';
import eventsInterruptingXML from '../../fixtures/bpmn/draw/events-interrupting.bpmn';
import eventSubprocessesCollapsedXML from '../../fixtures/bpmn/draw/event-subprocesses-collapsed.bpmn';
import eventSubprocessesExpandedXML from '../../fixtures/bpmn/draw/event-subprocesses-expanded.bpmn';
import eventSubprocessIconsXML from '../../fixtures/bpmn/draw/event-subprocess-icons.bpmn';
import gatewaysXML from '../../fixtures/bpmn/draw/gateways.bpmn';
import groupXML from '../../fixtures/bpmn/draw/group.bpmn';
import messageMarkerXML from '../../fixtures/bpmn/draw/message-marker.bpmn';
import messageLabelXML from '../../fixtures/bpmn/draw/message-label.bpmn';
import poolsXML from '../../fixtures/bpmn/draw/pools.bpmn';
import verticalPoolsXML from '../../fixtures/bpmn/draw/vertical-pools.bpmn';
import poolsWithCollectionMarkerXML from '../../fixtures/bpmn/draw/pools-with-collection-marker.bpmn';
import taskTypesXML from '../../fixtures/bpmn/draw/task-types.bpmn';
import textAnnotationXML from '../../fixtures/bpmn/draw/text-annotation.bpmn';
import flowMarkersXML from '../../fixtures/bpmn/flow-markers.bpmn';
import xorXML from '../../fixtures/bpmn/draw/xor.bpmn';
import boundaryEventZIndexXML from '../../fixtures/bpmn/draw/boundary-event-z-index.bpmn';
import boundaryEventWithoutRefnodeXML from '../../fixtures/bpmn/draw/boundary-event-without-refnode.bpmn';
import boundaryEventWithRefnodeXML from '../../fixtures/bpmn/draw/boundary-event-with-refnode.bpmn';
import gatewayTypeDefaultXML from '../../fixtures/bpmn/draw/gateway-type-default.bpmn';
import callActivityXML from '../../fixtures/bpmn/draw/call-activity.bpmn';
import activityMarkersSimpleXML from '../../fixtures/bpmn/draw/activity-markers-simple.bpmn';
import simpleXML from '../../fixtures/bpmn/simple.bpmn';
import colorsXML from './BpmnRenderer.colors.bpmn';
import connectionColorsXML from './BpmnRenderer.connection-colors.bpmn';
import sequenceFlowNoSourceXML from './BpmnRenderer.sequenceFlow-no-source.bpmn';
import groupColorsXML from './BpmnRenderer.group-colors.bpmn';
import croppingXML from './BpmnRenderer.simple-cropping.bpmn';
import kitchenSinkXML from '../../fixtures/bpmn/kitchen-sink.bpmn';
import noEventIconsXML from './BpmnRenderer.no-event-icons.bpmn';


/**
 * @typedef {import('../../../lib/model/Types').Element} Element
 */

function checkErrors(err, warnings) {
  expect(warnings).to.be.empty;
  expect(err).not.to.exist;
}


describe('draw - bpmn renderer', function() {

  it('should render labels', function() {
    return bootstrapViewer(labelsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render activity markers', function() {
    return bootstrapViewer(activityMarkersXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render association markers', function() {
    return bootstrapViewer(associationsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render activity markers (combination)', function() {
    return bootstrapViewer(activityMarkersCombinationXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional flows', function() {
    return bootstrapViewer(conditionalFlowXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional default flows', function() {
    return bootstrapViewer(conditionalFlowDefaultXML).call(this).then(function(result) {

      return checkErrors(result.error, result.warnings);
    });
  });


  it('should render NO conditional flow (gateway)', function() {
    return bootstrapViewer(conditionalFlowGatewaysXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render conditional flow (typed task)', function() {
    return bootstrapViewer(conditionalFlowTypedTaskXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render data objects with correct markers', function() {
    return bootstrapViewer(dataObjectsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);

      inject(function(elementRegistry) {
        [
          [ 'DataInput_1' , 'rgb(34, 36, 42)' , 'none' ],
          [ 'DataOutput_1' , 'rgb(34, 36, 42)', 'rgb(34, 36, 42)' ],
        ].forEach(([ id, stroke, fill ]) => {
          var dataObjectGfx = elementRegistry.getGraphics(id);
          var allPaths = domQueryAll('.djs-visual path', dataObjectGfx);

          expect(allPaths).to.have.lengthOf(2);

          var marker = allPaths[1];
          stroke && expect(marker.style.stroke, `expected stroke of ${id} to be ${stroke}`).to.eql(stroke);
          fill && expect(marker.style.fill, `expected fill of ${id} to be ${fill}`).to.eql(fill);
        });
      })();
    });
  });


  it('should render data objects with collection markers', function() {
    return bootstrapViewer(dataObjectsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);

      inject(function(elementRegistry) {
        [
          'DataInput_2_collection',
          'DataOutput_2_collection'
        ].forEach(id => {
          var dataObjectGfx = elementRegistry.getGraphics(id);
          var allPaths = domQueryAll('.djs-visual path', dataObjectGfx);

          expect(allPaths).to.have.lengthOf(3);
        });
      })();
    });
  });


  it('should render events', function() {
    return bootstrapViewer(eventsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render events (interrupting)', function() {
    return bootstrapViewer(eventsInterruptingXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render event subprocesses (collapsed)', function() {
    return bootstrapViewer(eventSubprocessesCollapsedXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render event subprocesses (expanded)', function() {
    return bootstrapViewer(eventSubprocessesExpandedXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render event subprocess icons', function() {
    return bootstrapViewer(eventSubprocessIconsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render gateways', function() {
    return bootstrapViewer(gatewaysXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render group', function() {
    return bootstrapViewer(groupXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render message marker', function() {
    return bootstrapViewer(messageMarkerXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render message label', function() {
    return bootstrapViewer(messageLabelXML).call(this).then(function(result) {
      checkErrors(result.error, result.warnings);
      inject(function(elementRegistry) {

        var dataFlow = elementRegistry.getGraphics('dataFlow');

        expect(domQuery('.djs-label', dataFlow)).to.exist;
      })();
    });
  });


  it('should render pools', function() {
    return bootstrapViewer(poolsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render vertical pools', function() {
    return bootstrapViewer(verticalPoolsXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render pool collection marker', function() {
    return bootstrapViewer(poolsWithCollectionMarkerXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render task types', function() {
    return bootstrapViewer(taskTypesXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render text annotations', function() {
    return bootstrapViewer(textAnnotationXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render flow markers', function() {
    return bootstrapViewer(flowMarkersXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render xor gateways blank and with X', function() {
    return bootstrapViewer(xorXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary events with correct z-index', function() {
    return bootstrapViewer(boundaryEventZIndexXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary events without flowNodeRef', function() {
    return bootstrapViewer(boundaryEventWithoutRefnodeXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render boundary event only once if referenced incorrectly via flowNodeRef (robustness)', function() {
    return bootstrapViewer(boundaryEventWithRefnodeXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render gateway event if attribute is missing in XML', function() {
    return bootstrapViewer(gatewayTypeDefaultXML).call(this).then(function(result) {

      checkErrors(result.error, result.warnings);
    });
  });


  it('should render call activity', function() {

    return bootstrapViewer(callActivityXML).call(this).then(function(result) {

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

    return bootstrapViewer(activityMarkersSimpleXML).call(this).then(function(result) {

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

    return bootstrapViewer(simpleXML).call(this).then(function(result) {

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

    return bootstrapViewer(colorsXML).call(this).then(function(result) {

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


  it('should render collapsed subprocess marker centered', function() {

    return bootstrapViewer(activityMarkersSimpleXML).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(elementRegistry) {

        var task = elementRegistry.getGraphics('SubProcessCollapsed');

        const marker = domQuery('[data-marker=sub-process]', task);

        expectDistance(task, marker, { x: 0 });
      })();
    });
  });


  it('should render compensation marker centered', function() {

    return bootstrapViewer(activityMarkersSimpleXML).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(elementRegistry) {

        var task = elementRegistry.getGraphics('TaskCompensation');

        const marker = domQuery('[data-marker=compensation]', task);

        expectDistance(task, marker, { x: 0 });
      })();
    });
  });

  it('should render ad-hoc marker centered on expanded subprocess', function() {

    return bootstrapViewer(activityMarkersSimpleXML).call(this).then(function(result) {

      var err = result.error;

      expect(err).not.to.exist;

      inject(function(elementRegistry) {

        var task = elementRegistry.getGraphics('AdHocSubProcessExpanded');

        const marker = domQuery('[data-marker=adhoc]', task);

        expectDistance(task, marker, { x: 0 });
      })();
    });
  });


  it('should properly render connection markers (2)', function() {

    return bootstrapViewer(connectionColorsXML).call(this).then(function(result) {

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

          expect(markerPath).to.exist;

          stroke && expect(markerPath.style.stroke).to.eql(stroke);
          fill && expect(markerPath.style.fill).to.eql(fill);

        });
      })();
    });
  });


  it('should render sequenceFlows without source', function() {

    return bootstrapModeler(sequenceFlowNoSourceXML, {
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



    it('should render colors without warnings and errors', function() {
      return bootstrapViewer(colorsXML).call(this).then(function(result) {

        checkErrors(result.error, result.warnings);
      });
    });


    it('should render group colors', function() {
      return bootstrapViewer(groupColorsXML).call(this).then(function(result) {

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

      beforeEach(bootstrapViewer(colorsXML,{
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


        beforeEach(bootstrapModeler(eventsXML, {
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


    var testModules = [ coreModule, rendererModule ];

    beforeEach(bootstrapModeler(croppingXML, { modules: testModules }));

    describe('circle', function() {

      it('should return a circle path', inject(function(elementRegistry, graphicsFactory) {

        // given
        var eventElement = elementRegistry.get('StartEvent_1');

        // when
        var startPath = graphicsFactory.getShapePath(eventElement);

        // then
        expect(startPath).to.equal('M187,263m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-36z');
      }));


      it('should return a diamond path', inject(function(elementRegistry, graphicsFactory) {

        // given
        var gatewayElement = elementRegistry.get('ExclusiveGateway_1');

        // when
        var gatewayPath = graphicsFactory.getShapePath(gatewayElement);

        // then
        expect(gatewayPath).to.equal('M358,238l25,25l-25,25l-25,-25z');
      }));


      it('should return a rounded rectangular path', inject(function(elementRegistry, graphicsFactory) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess_1');

        // when
        var subProcessPath = graphicsFactory.getShapePath(subProcessElement);

        // then
        expect(subProcessPath).to.equal('M524,163l330,0a10,10,0,0,1,10,10l0,180a10,10,0,0,1,' +
          '-10,10l-330,0a10,10,0,0,1,-10,-10l0,-180a10,10,0,0,1,10,-10z');
      }));


      it('should return a rectangular path', inject(function(elementRegistry, graphicsFactory) {

        // given
        var TextAnnotationElement = elementRegistry.get('TextAnnotation_1');

        // when
        var TextAnnotationPath = graphicsFactory.getShapePath(TextAnnotationElement);

        // then
        expect(TextAnnotationPath).to.equal('M308,76l100,0l0,80l-100,0z');
      }));


      it('should return a rounded rectangular path for external label', inject(function(elementRegistry, graphicsFactory) {

        // given
        const event = elementRegistry.get('StartEvent_1');
        const label = event.labels[0];

        // when
        const labelPath = graphicsFactory.getShapePath(label);

        // then
        expectSvgPath(
          labelPath,
          'M163,303l47,0a4,4,0,0,1,4,4l0,6a4,4,0,0,1,-4,4l-47,0a4,4,0,0,1,-4,-4l0,-6a4,4,0,0,1,4,-4z'
        );
      }));

    });

  });


  describe('extension API', function() {


    beforeEach(bootstrapModeler(simpleXML, {
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

      beforeEach(bootstrapModeler(kitchenSinkXML, {
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

      beforeEach(bootstrapModeler(kitchenSinkXML, {
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
            } else if (element.type === 'bpmn:TextAnnotation') {
              expect(+svgAttr(rect, 'width')).to.be.closeTo(100, 1);
              expect(+svgAttr(rect, 'height')).to.be.closeTo(30, 1);
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


    beforeEach(bootstrapViewer(noEventIconsXML, {
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

/**
 * Expect distance between two elements.
 *
 * @param {SVGAElement} element1
 * @param {SVGAElement} element2
 * @param { { x: number; y: number } } distance
 * @param {number} [tolerance=3]
 *
 * @returns {void}
 */
function expectDistance(element1, element2, distance, tolerance = 3) {
  const {
    x = Infinity,
    y = Infinity
  } = distance;

  const bbox1 = element1.getBoundingClientRect();
  const bbox2 = element2.getBoundingClientRect();

  const center1 = {
    x: bbox1.left + (bbox1.width / 2),
    y: bbox1.top + (bbox1.height / 2)
  };

  const center2 = {
    x: bbox2.left + (bbox2.width / 2),
    y: bbox2.top + (bbox2.height / 2)
  };

  expect(Math.abs(center1.x - center2.x)).to.be.lessThan(x + tolerance);
  expect(Math.abs(center1.y - center2.y)).to.be.lessThan(y + tolerance);
}