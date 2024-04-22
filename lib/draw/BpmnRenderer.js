import inherits from 'inherits-browser';

import {
  assign,
  forEach,
  isObject
} from 'min-dash';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  isExpanded,
  isHorizontal,
  isEventSubProcess
} from '../util/DiUtil';

import {
  getLabel
} from '../util/LabelUtil';

import {
  is
} from '../util/ModelUtil';

import {
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  isTypedEvent,
  isThrowEvent,
  isCollection,
  getBounds,
  getDi,
  getSemantic,
  getCirclePath,
  getRoundRectPath,
  getDiamondPath,
  getRectPath,
  getFillColor,
  getStrokeColor,
  getLabelColor,
  getHeight,
  getWidth
} from './BpmnRenderUtil';

import {
  query as domQuery
} from 'min-dom';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';

import {
  transform,
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

import Ids from 'ids';

import { black } from './BpmnRenderUtil';

import { getIcon } from './icons';

var rendererIds = new Ids();

var ELEMENT_LABEL_DISTANCE = 10,
    INNER_OUTER_DIST = 3,
    PARTICIPANT_STROKE_WIDTH = 1.5,
    TASK_BORDER_RADIUS = 10;

var DEFAULT_OPACITY = 0.95,
    FULL_OPACITY = 1,
    LOW_OPACITY = 0.25;

var TASK_ICON_SIZE = 26,
    TASK_ICON_MARGIN_X = 2.5,
    TASK_ICON_MARGIN_Y = 1;

/**
 * @typedef { Partial<{
 *   defaultFillColor: string,
 *   defaultStrokeColor: string,
 *   defaultLabelColor: string
 * }> } BpmnRendererConfig
 *
 * @typedef { Partial<{
 *   fill: string,
 *   stroke: string,
 *   width: string,
 *   height: string
 * }> } Attrs
 */

/**
 * @typedef { import('../model/Types').Element } Element
 */

/**
 * A renderer for BPMN elements
 *
 * @param {BpmnRendererConfig} config
 * @param {import('diagram-js/lib/core/EventBus').default} eventBus
 * @param {import('diagram-js/lib/draw/Styles').default} styles
 * @param {import('./PathMap').default} pathMap
 * @param {import('diagram-js/lib/core/Canvas').default} canvas
 * @param {import('./TextRenderer').default} textRenderer
 * @param {number} [priority]
 */
export default function BpmnRenderer(
    config, eventBus, styles, pathMap,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
      defaultStrokeColor = config && config.defaultStrokeColor,
      defaultLabelColor = config && config.defaultLabelColor;

  var rendererId = rendererIds.next();

  var markers = {};

  function shapeStyle(attrs) {
    return styles.computeStyle(attrs, {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      stroke: black,
      strokeWidth: 2,
      fill: 'white'
    });
  }

  function lineStyle(attrs) {
    return styles.computeStyle(attrs, [ 'no-fill' ], {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      stroke: black,
      strokeWidth: 2
    });
  }

  function addMarker(id, options) {
    var {
      ref = { x: 0, y: 0 },
      scale = 1,
      element
    } = options;

    var marker = svgCreate('marker', {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    svgAppend(marker, element);

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {

    // only allow characters and numbers
    return str.replace(/[^0-9a-zA-Z]+/g, '_');
  }

  function marker(type, fill, stroke) {
    var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(id, type, fill, stroke) {

    if (type === 'sequenceflow-end') {
      var sequenceflowEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15 Z',
        ...shapeStyle({
          fill: stroke,
          stroke: stroke,
          strokeWidth: 1
        })
      });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'messageflow-start') {
      var messageflowStart = svgCreate('circle', {
        cx: 6,
        cy: 6,
        r: 3.5,
        ...shapeStyle({
          fill,
          stroke: stroke,
          strokeWidth: 1,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: messageflowStart,
        ref: { x: 6, y: 6 }
      });
    }

    if (type === 'messageflow-end') {
      var messageflowEnd = svgCreate('path', {
        d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z',
        ...shapeStyle({
          fill,
          stroke: stroke,
          strokeWidth: 1,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: messageflowEnd,
        ref: { x: 8.5, y: 5 }
      });
    }

    if (type === 'association-start') {
      var associationStart = svgCreate('path', {
        d: 'M 11 5 L 1 10 L 11 15',
        ...lineStyle({
          fill: 'none',
          stroke,
          strokeWidth: 1.5,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: associationStart,
        ref: { x: 1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'association-end') {
      var associationEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15',
        ...lineStyle({
          fill: 'none',
          stroke,
          strokeWidth: 1.5,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: associationEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-flow-marker') {
      var conditionalFlowMarker = svgCreate('path', {
        d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z',
        ...shapeStyle({
          fill,
          stroke: stroke
        })
      });

      addMarker(id, {
        element: conditionalFlowMarker,
        ref: { x: -1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-default-flow-marker') {
      var defaultFlowMarker = svgCreate('path', {
        d: 'M 6 4 L 10 16',
        ...shapeStyle({
          stroke: stroke
        })
      });

      addMarker(id, {
        element: defaultFlowMarker,
        ref: { x: 0, y: 10 },
        scale: 0.5
      });
    }
  }

  function drawCircle(parentGfx, width, height, offset, attrs = {}) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = shapeStyle(attrs);

    var cx = width / 2,
        cy = height / 2;

    var circle = svgCreate('circle', {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset),
      ...attrs
    });

    svgAppend(parentGfx, circle);

    return circle;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = shapeStyle(attrs);

    var rect = svgCreate('rect', {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r,
      ...attrs
    });

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawDiamond(parentGfx, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [
      { x: x_2, y: 0 },
      { x: width, y: y_2 },
      { x: x_2, y: height },
      { x: 0, y: y_2 }
    ];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = shapeStyle(attrs);

    var polygon = svgCreate('polygon', {
      ...attrs,
      points: pointsString
    });

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  /**
   * @param {SVGElement} parentGfx
   * @param {Point[]} waypoints
   * @param {any} attrs
   * @param {number} [radius]
   *
   * @return {SVGElement}
   */
  function drawLine(parentGfx, waypoints, attrs, radius) {
    attrs = lineStyle(attrs);

    var line = createLine(waypoints, attrs, radius);

    svgAppend(parentGfx, line);

    return line;
  }

  /**
   * @param {SVGElement} parentGfx
   * @param {Point[]} waypoints
   * @param {any} attrs
   *
   * @return {SVGElement}
   */
  function drawConnectionSegments(parentGfx, waypoints, attrs) {
    return drawLine(parentGfx, waypoints, attrs, 5);
  }

  function drawPath(parentGfx, d, attrs) {
    attrs = lineStyle(attrs);

    var path = svgCreate('path', {
      ...attrs,
      d
    });

    svgAppend(parentGfx, path);

    return path;
  }

  function drawMarker(type, parentGfx, path, attrs) {
    return drawPath(parentGfx, path, assign({ 'data-marker': type }, attrs));
  }

  function renderer(type) {
    return handlers[type];
  }

  function as(type) {
    return function(parentGfx, element, attrs) {
      return renderer(type)(parentGfx, element, attrs);
    };
  }

  var eventIconRenderers = {
    'bpmn:MessageEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'message-filled' : 'message', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: isThrowing ? getStrokeColor(element, defaultStrokeColor, attrs.stroke) : 'none',
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:TimerEventDefinition': function(parentGfx, element, attrs = {}) {
      var icon = getIcon('timer', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:EscalationEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'escalation-filled' : 'escalation', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:ConditionalEventDefinition': function(parentGfx, element, attrs = {}) {
      var icon = getIcon('conditional', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:LinkEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'link-filled' : 'link', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:ErrorEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'error-filled' : 'error', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:CancelEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'cancel-filled' : 'cancel', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:CompensateEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'compensation-filled' : 'compensation', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:SignalEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'signal-filled' : 'signal', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:MultipleEventDefinition': function(parentGfx, element, attrs = {}, isThrowing) {
      var icon = getIcon(isThrowing ? 'multiple-filled' : 'multiple', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: isThrowing
            ? getStrokeColor(element, defaultStrokeColor, attrs.stroke)
            : getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:ParallelMultipleEventDefinition': function(parentGfx, element, attrs = {}) {
      var icon = getIcon('multiple-parallel', {
        width: element.width,
        height: element.height,
        box: {
          width: element.width,
          height: element.height
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);
    },
    'bpmn:TerminateEventDefinition': function(parentGfx, element, attrs = {}) {
      var circle = drawCircle(parentGfx, element.width, element.height, 8, {
        fill: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 4
      });

      return circle;
    }
  };

  function renderEventIcon(element, parentGfx, attrs = {}) {
    var semantic = getSemantic(element),
        isThrowing = isThrowEvent(semantic);

    if (semantic.get('eventDefinitions') && semantic.get('eventDefinitions').length > 1) {
      if (semantic.get('parallelMultiple')) {
        return eventIconRenderers[ 'bpmn:ParallelMultipleEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }
      else {
        return eventIconRenderers[ 'bpmn:MultipleEventDefinition' ](parentGfx, element, attrs, isThrowing);
      }
    }

    if (isTypedEvent(semantic, 'bpmn:MessageEventDefinition')) {
      return eventIconRenderers[ 'bpmn:MessageEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:TimerEventDefinition')) {
      return eventIconRenderers[ 'bpmn:TimerEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:ConditionalEventDefinition')) {
      return eventIconRenderers[ 'bpmn:ConditionalEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:SignalEventDefinition')) {
      return eventIconRenderers[ 'bpmn:SignalEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:EscalationEventDefinition')) {
      return eventIconRenderers[ 'bpmn:EscalationEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:LinkEventDefinition')) {
      return eventIconRenderers[ 'bpmn:LinkEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:ErrorEventDefinition')) {
      return eventIconRenderers[ 'bpmn:ErrorEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:CancelEventDefinition')) {
      return eventIconRenderers[ 'bpmn:CancelEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:CompensateEventDefinition')) {
      return eventIconRenderers[ 'bpmn:CompensateEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(semantic, 'bpmn:TerminateEventDefinition')) {
      return eventIconRenderers[ 'bpmn:TerminateEventDefinition' ](parentGfx, element, attrs, isThrowing);
    }

    return null;
  }

  var taskMarkerRenderers = {
    'ParticipantMultiplicityMarker': function(parentGfx, element, attrs = {}) {
      var width = getWidth(element, attrs),
          height = getHeight(element, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: width,
        containerHeight: height,
        position: {
          mx: ((width / 2 - 6) / width),
          my: (height - 15) / height
        }
      });

      drawMarker('participant-multiplicity', parentGfx, markerPath, {
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    },
    'SubProcessMarker': function(parentGfx, element, attrs = {}) {
      var markerRect = drawRect(parentGfx, 14, 14, 0, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });

      translate(markerRect, element.width / 2 - 7.5, element.height - 20);

      var markerPath = pathMap.getScaledPath('MARKER_SUB_PROCESS', {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: (element.width / 2 - 7.5) / element.width,
          my: (element.height - 20) / element.height
        }
      });

      drawMarker('sub-process', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    },
    'ParallelMarker': function(parentGfx, element, attrs) {
      var width = getWidth(element, attrs),
          height = getHeight(element, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: width,
        containerHeight: height,
        position: {
          mx: ((width / 2 + attrs.parallel) / width),
          my: (height - 20) / height
        }
      });

      drawMarker('parallel', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    },
    'SequentialMarker': function(parentGfx, element, attrs) {
      var markerPath = pathMap.getScaledPath('MARKER_SEQUENTIAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + attrs.seq) / element.width),
          my: (element.height - 19) / element.height
        }
      });

      drawMarker('sequential', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    },
    'CompensationMarker': function(parentGfx, element, attrs) {
      var markerMath = pathMap.getScaledPath('MARKER_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + attrs.compensation) / element.width),
          my: (element.height - 13) / element.height
        }
      });

      drawMarker('compensation', parentGfx, markerMath, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    },
    'LoopMarker': function(parentGfx, element, attrs) {
      var width = getWidth(element, attrs),
          height = getHeight(element, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_LOOP', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: width,
        containerHeight: height,
        position: {
          mx: ((width / 2 + attrs.loop) / width),
          my: (height - 7) / height
        }
      });

      drawMarker('loop', parentGfx, markerPath, {
        strokeWidth: 1.5,
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(parentGfx, element, attrs) {
      var width = getWidth(element, attrs),
          height = getHeight(element, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_ADHOC', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: width,
        containerHeight: height,
        position: {
          mx: ((width / 2 + attrs.adhoc) / width),
          my: (height - 15) / height
        }
      });

      drawMarker('adhoc', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });
    }
  };

  function renderTaskMarker(type, parentGfx, element, attrs) {
    taskMarkerRenderers[ type ](parentGfx, element, attrs);
  }

  function renderTaskMarkers(parentGfx, element, taskMarkers, attrs = {}) {
    console.log('render task markers', taskMarkers);

    attrs = {
      fill: attrs.fill,
      stroke: attrs.stroke,
      width: getWidth(element, attrs),
      height: getHeight(element, attrs)
    };

    var semantic = getSemantic(element);

    var subprocess = taskMarkers && taskMarkers.includes('SubProcessMarker');

    if (subprocess) {
      attrs = {
        ...attrs,
        seq: -21,
        parallel: -22,
        compensation: -42,
        loop: -18,
        adhoc: 10
      };
    } else {
      attrs = {
        ...attrs,
        seq: -5,
        parallel: -6,
        compensation: -27,
        loop: 0,
        adhoc: 10
      };
    }

    forEach(taskMarkers, function(marker) {
      renderTaskMarker(marker, parentGfx, element, attrs);
    });

    if (semantic.get('isForCompensation')) {
      renderTaskMarker('CompensationMarker', parentGfx, element, attrs);
    }

    if (is(semantic, 'bpmn:AdHocSubProcess')) {
      renderTaskMarker('AdhocMarker', parentGfx, element, attrs);
    }

    var loopCharacteristics = semantic.get('loopCharacteristics'),
        isSequential = loopCharacteristics && loopCharacteristics.get('isSequential');

    if (loopCharacteristics) {

      if (isSequential === undefined) {
        renderTaskMarker('LoopMarker', parentGfx, element, attrs);
      }

      if (isSequential === false) {
        renderTaskMarker('ParallelMarker', parentGfx, element, attrs);
      }

      if (isSequential === true) {
        renderTaskMarker('SequentialMarker', parentGfx, element, attrs);
      }
    }
  }

  function renderLabel(parentGfx, label, attrs = {}) {
    attrs = assign({
      size: {
        width: 100
      }
    }, attrs);

    var text = textRenderer.createText(label || '', attrs);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, attrs = {}) {
    var semantic = getSemantic(element);

    var box = getBounds({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    }, attrs);

    return renderLabel(parentGfx, semantic.name, {
      align,
      box,
      padding: 7,
      style: {
        fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
      }
    });
  }

  function renderExternalLabel(parentGfx, element, attrs = {}) {
    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
        }
      )
    });
  }

  function renderLaneLabel(parentGfx, text, element, attrs = {}) {
    var isHorizontalLane = isHorizontal(element);

    var textBox = renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: isHorizontalLane ? getHeight(element, attrs) : getWidth(element, attrs),
      },
      align: 'center-middle',
      style: {
        fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
      }
    });

    if (isHorizontalLane) {
      var top = -1 * getHeight(element, attrs);
      transform(textBox, 0, -top, 270);
    }
  }

  function renderActivity(parentGfx, element, attrs = {}) {
    var {
      width,
      height
    } = getBounds(element, attrs);

    return drawRect(parentGfx, width, height, TASK_BORDER_RADIUS, {
      ...attrs,
      fill: getFillColor(element, defaultFillColor, attrs.fill),
      fillOpacity: DEFAULT_OPACITY,
      stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
    });
  }

  function renderAssociation(parentGfx, element, attrs = {}) {
    var semantic = getSemantic(element);

    var fill = getFillColor(element, defaultFillColor, attrs.fill),
        stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

    if (semantic.get('associationDirection') === 'One' ||
        semantic.get('associationDirection') === 'Both') {
      attrs.markerEnd = marker('association-end', fill, stroke);
    }

    if (semantic.get('associationDirection') === 'Both') {
      attrs.markerStart = marker('association-start', fill, stroke);
    }

    attrs = pickAttrs(attrs, [
      'markerStart',
      'markerEnd'
    ]);

    return drawConnectionSegments(parentGfx, element.waypoints, {
      ...attrs,
      stroke,
      strokeDasharray: '0, 5'
    });
  }

  function renderDataObject(parentGfx, element, attrs = {}) {
    var fill = getFillColor(element, defaultFillColor, attrs.fill),
        stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

    var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
      xScaleFactor: 1,
      yScaleFactor: 1,
      containerWidth: element.width,
      containerHeight: element.height,
      position: {
        mx: 0.474,
        my: 0.296
      }
    });

    var dataObject = drawPath(parentGfx, pathData, {
      fill,
      fillOpacity: DEFAULT_OPACITY,
      stroke
    });

    var semantic = getSemantic(element);

    if (isCollection(semantic)) {
      var collectionPathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.33,
          my: (element.height - 18) / element.height
        }
      });

      drawPath(parentGfx, collectionPathData, {
        strokeWidth: 2,
        fill,
        stroke
      });
    }

    return dataObject;
  }

  function renderEvent(parentGfx, element, attrs = {}) {
    return drawCircle(parentGfx, element.width, element.height, {
      fillOpacity: DEFAULT_OPACITY,
      ...attrs,
      fill: getFillColor(element, defaultFillColor, attrs.fill),
      stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
    });
  }

  function renderGateway(parentGfx, element, attrs = {}) {
    return drawDiamond(parentGfx, element.width, element.height, {
      fill: getFillColor(element, defaultFillColor, attrs.fill),
      fillOpacity: DEFAULT_OPACITY,
      stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
    });
  }

  function renderLane(parentGfx, element, attrs = {}) {
    var lane = drawRect(parentGfx, getWidth(element, attrs), getHeight(element, attrs), 0, {
      fill: getFillColor(element, defaultFillColor, attrs.fill),
      fillOpacity: attrs.fillOpacity || DEFAULT_OPACITY,
      stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
      strokeWidth: 1.5
    });

    var semantic = getSemantic(element);

    if (is(semantic, 'bpmn:Lane')) {
      var text = semantic.get('name');

      renderLaneLabel(parentGfx, text, element, attrs);
    }

    return lane;
  }

  function renderSubProcess(parentGfx, element, attrs = {}) {
    var activity = renderActivity(parentGfx, element, attrs);

    if (isEventSubProcess(element)) {
      svgAttr(activity, {
        strokeDasharray: '0, 5.5',
        strokeWidth: 2.5
      });
    }

    var expanded = isExpanded(element);

    renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle', attrs);

    if (expanded) {
      renderTaskMarkers(parentGfx, element, undefined, attrs);
    } else {
      renderTaskMarkers(parentGfx, element, [ 'SubProcessMarker' ], attrs);
    }

    return activity;
  }

  function renderTask(parentGfx, element, attrs = {}) {
    var activity = renderActivity(parentGfx, element, attrs);

    renderEmbeddedLabel(parentGfx, element, 'center-middle', attrs);

    renderTaskMarkers(parentGfx, element, undefined, attrs);

    return activity;
  }

  var handlers = this.handlers = {
    'bpmn:AdHocSubProcess': function(parentGfx, element, attrs = {}) {
      if (isExpanded(element)) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);
      } else {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);
      }

      return renderSubProcess(parentGfx, element, attrs);
    },
    'bpmn:Association': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderAssociation(parentGfx, element, attrs);
    },
    'bpmn:BoundaryEvent': function(parentGfx, element, attrs = {}) {
      var { renderIcon = true } = attrs;

      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var semantic = getSemantic(element),
          cancelActivity = semantic.get('cancelActivity');

      attrs = {
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        fillOpacity: FULL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      };

      if (!cancelActivity) {
        attrs.strokeDasharray = '6, 4';
        attrs.strokeDashoffset = '2.75';
        attrs.pathLength = '80';
      }

      var event = renderEvent(parentGfx, element, attrs);

      drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, {
        ...attrs,
        fill: 'none'
      });

      if (renderIcon) {
        renderEventIcon(element, parentGfx, attrs);
      }

      return event;
    },
    'bpmn:BusinessRuleTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('business-rule', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:CallActivity': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderSubProcess(parentGfx, element, {
        strokeWidth: 5,
        ...attrs
      });
    },
    'bpmn:ComplexGateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var gateway = renderGateway(parentGfx, element, attrs);

      var icon = getIcon('complex', {
        width: element.width * 0.5,
        height: element.height * 0.5,
        box: {
          width: element.width,
          height: element.width
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return gateway;
    },
    'bpmn:DataInput': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      var dataObject = renderDataObject(parentGfx, element, attrs);

      drawPath(parentGfx, arrowPathData, {
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 1
      });

      return dataObject;
    },
    'bpmn:DataInputAssociation': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderAssociation(parentGfx, element, {
        ...attrs,
        markerEnd: marker('association-end', getFillColor(element, defaultFillColor, attrs.fill), getStrokeColor(element, defaultStrokeColor, attrs.stroke))
      });
    },
    'bpmn:DataObject': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderDataObject(parentGfx, element, attrs);
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataOutput': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      var dataObject = renderDataObject(parentGfx, element, attrs);

      drawPath(parentGfx, arrowPathData, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });

      return dataObject;
    },
    'bpmn:DataOutputAssociation': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderAssociation(parentGfx, element, {
        ...attrs,
        markerEnd: marker('association-end', getFillColor(element, defaultFillColor, attrs.fill), getStrokeColor(element, defaultStrokeColor, attrs.stroke))
      });
    },
    'bpmn:DataStoreReference': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var dataStorePath = pathMap.getScaledPath('DATA_STORE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0,
          my: 0.133
        }
      });

      return drawPath(parentGfx, dataStorePath, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        fillOpacity: DEFAULT_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 2
      });
    },
    'bpmn:EndEvent': function(parentGfx, element, attrs = {}) {
      var { renderIcon = true } = attrs;

      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var event = renderEvent(parentGfx, element, {
        ...attrs,
        strokeWidth: 4
      });

      if (renderIcon) {
        renderEventIcon(element, parentGfx, attrs);
      }

      return event;
    },
    'bpmn:EventBasedGateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var semantic = getSemantic(element);

      var diamond = renderGateway(parentGfx, element, attrs);

      drawCircle(parentGfx, element.width, element.height, element.width * 0.25, {
        fill: getFillColor(element, 'none', attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 1.5
      });

      var type = semantic.get('eventGatewayType'),
          instantiate = !!semantic.get('instantiate');

      var icon;

      if (type === 'Parallel') {
        icon = getIcon('event-based-parallel', {
          width: element.width * 0.3,
          height: element.height * 0.3,
          box: {
            width: element.width,
            height: element.width
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });
      } else if (type === 'Exclusive') {
        if (!instantiate) {
          drawCircle(parentGfx, element.width, element.height, element.width * 0.3, {
            fill: 'none',
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
            strokeWidth: 1.5
          });
        }

        icon = getIcon('event-based', {
          width: element.width * 0.3,
          height: element.height * 0.3,
          box: {
            y: -1,
            width: element.width,
            height: element.width
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });
      }

      parentGfx.appendChild(icon);

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var gateway = renderGateway(parentGfx, element, attrs);

      var icon = getIcon('exclusive', {
        width: element.width * 0.4,
        height: element.height * 0.4,
        box: {
          width: element.width,
          height: element.width
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return gateway;
    },
    'bpmn:Gateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderGateway(parentGfx, element, attrs);
    },
    'bpmn:Group': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke',
        'width',
        'height'
      ]);

      return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 1.5,
        strokeDasharray: '10, 6, 0, 6',
        fill: 'none',
        pointerEvents: 'none',
        width: getWidth(element, attrs),
        height: getHeight(element, attrs)
      });
    },
    'bpmn:InclusiveGateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var gateway = renderGateway(parentGfx, element, attrs);

      drawCircle(parentGfx, element.width, element.height, 12, {
        fill: getFillColor(element, defaultFillColor, attrs.fill),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 2
      });

      return gateway;
    },
    'bpmn:IntermediateEvent': function(parentGfx, element, attrs = {}) {
      var { renderIcon = true } = attrs;

      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var outer = renderEvent(parentGfx, element, {
        ...attrs,
        strokeWidth: 2
      });

      drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, {
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 2
      });

      if (renderIcon) {
        renderEventIcon(element, parentGfx, attrs);
      }

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),
    'bpmn:Lane': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke',
        'width',
        'height'
      ]);

      return renderLane(parentGfx, element, {
        ...attrs,
        fillOpacity: LOW_OPACITY
      });
    },
    'bpmn:ManualTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('manual', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:MessageFlow': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var semantic = getSemantic(element),
          di = getDi(element);

      var fill = getFillColor(element, defaultFillColor, attrs.fill),
          stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

      var path = drawConnectionSegments(parentGfx, element.waypoints, {
        markerEnd: marker('messageflow-end', fill, stroke),
        markerStart: marker('messageflow-start', fill, stroke),
        stroke,
        strokeDasharray: '10, 11',
        strokeWidth: 1.5
      });

      if (semantic.get('messageRef')) {
        var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

        if (di.get('messageVisibleKind') !== 'initiating') {
          fill = stroke;
          stroke = fill;
        }

        var backgroundIcon = getIcon('message-filled', {
          width: 36,
          height: 36,
          box: {
            x: midPoint.x - 18,
            y: midPoint.y - 18,
            width: 36,
            height: 36
          },
          attrs: {
            fill: 'none',
            stroke: fill
          }
        });

        parentGfx.appendChild(backgroundIcon);

        var icon = getIcon('message', {
          width: 36,
          height: 36,
          box: {
            x: midPoint.x - 18,
            y: midPoint.y - 18,
            width: 36,
            height: 36
          },
          attrs: {
            fill,
            stroke
          }
        });

        parentGfx.appendChild(icon);

        var messageRef = semantic.get('messageRef'),
            name = messageRef.get('name');

        var label = renderLabel(parentGfx, name, {
          align: 'center-top',
          fitBox: true,
          style: {
            fill: stroke
          }
        });

        // TODO(philippfromme): getBBox cannot be used here since the element is
        // not part of the DOM at this point
        var messageBounds = icon.getBBox(),
            labelBounds = label.getBBox();

        var translateX = midPoint.x - labelBounds.width / 2,
            translateY = midPoint.y + messageBounds.height / 2 + ELEMENT_LABEL_DISTANCE;

        transform(label, translateX, translateY, 0);
      }

      return path;
    },
    'bpmn:ParallelGateway': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var gateway = renderGateway(parentGfx, element, attrs);

      var icon = getIcon('parallel', {
        width: element.width * 0.5,
        height: element.height * 0.5,
        box: {
          width: element.width,
          height: element.width
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return gateway;
    },
    'bpmn:Participant': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke',
        'width',
        'height'
      ]);

      var participant = renderLane(parentGfx, element, attrs);

      var expandedParticipant = isExpanded(element);
      var horizontalParticipant = isHorizontal(element);

      var semantic = getSemantic(element),
          name = semantic.get('name');

      if (expandedParticipant) {
        var waypoints = horizontalParticipant ? [
          {
            x: 30,
            y: 0
          },
          {
            x: 30,
            y: getHeight(element, attrs)
          }
        ] : [
          {
            x: 0,
            y: 30
          },
          {
            x: getWidth(element, attrs),
            y: 30
          }
        ];

        drawLine(parentGfx, waypoints, {
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: PARTICIPANT_STROKE_WIDTH
        });

        renderLaneLabel(parentGfx, name, element, attrs);
      } else {
        var bounds = getBounds(element, attrs);

        if (!horizontalParticipant) {
          bounds.height = getWidth(element, attrs);
          bounds.width = getHeight(element, attrs);
        }

        var textBox = renderLabel(parentGfx, name, {
          box: bounds,
          align: 'center-middle',
          style: {
            fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
          }
        });

        if (!horizontalParticipant) {
          var top = -1 * getHeight(element, attrs);
          transform(textBox, 0, -top, 270);
        }
      }

      if (semantic.get('participantMultiplicity')) {
        renderTaskMarker('ParticipantMultiplicityMarker', parentGfx, element, attrs);
      }

      return participant;
    },
    'bpmn:ReceiveTask' : function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var semantic = getSemantic(element);

      var task = renderTask(parentGfx, element, attrs);

      var icon;

      if (semantic.get('instantiate')) {
        drawCircle(parentGfx, TASK_ICON_SIZE + 5, TASK_ICON_SIZE + 5, 4, {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
          strokeWidth: 1.5
        });

        icon = getIcon('receive', {
          width: TASK_ICON_SIZE - 6,
          height: TASK_ICON_SIZE - 6,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y + 2,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });
      } else {
        icon = getIcon('receive', {
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE,
          box: {
            x: TASK_ICON_MARGIN_X,
            y: TASK_ICON_MARGIN_Y,
            width: TASK_ICON_SIZE,
            height: TASK_ICON_SIZE
          },
          attrs: {
            fill: getFillColor(element, defaultFillColor, attrs.fill),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
          }
        });
      }

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:ScriptTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('script', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:SendTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('send', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:SequenceFlow': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var fill = getFillColor(element, defaultFillColor, attrs.fill),
          stroke = getStrokeColor(element, defaultStrokeColor, attrs.stroke);

      var connection = drawConnectionSegments(parentGfx, element.waypoints, {
        markerEnd: marker('sequenceflow-end', fill, stroke),
        stroke
      });

      var semantic = getSemantic(element);

      var { source } = element;

      if (source) {
        var sourceSemantic = getSemantic(source);

        // conditional flow marker
        if (semantic.get('conditionExpression') && is(sourceSemantic, 'bpmn:Activity')) {
          svgAttr(connection, {
            markerStart: marker('conditional-flow-marker', fill, stroke)
          });
        }

        // default marker
        if (sourceSemantic.get('default') && (is(sourceSemantic, 'bpmn:Gateway') || is(sourceSemantic, 'bpmn:Activity')) &&
            sourceSemantic.get('default') === semantic) {
          svgAttr(connection, {
            markerStart: marker('conditional-default-flow-marker', fill, stroke)
          });
        }
      }

      return connection;
    },
    'bpmn:ServiceTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('service', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'bpmn:StartEvent': function(parentGfx, element, attrs = {}) {
      var { renderIcon = true } = attrs;

      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var semantic = getSemantic(element);

      if (!semantic.get('isInterrupting')) {
        attrs = {
          ...attrs,
          strokeDasharray: '6, 4',
          strokeDashoffset: '2.75',
          pathLength: '80'
        };
      }

      var event = renderEvent(parentGfx, element, attrs);

      if (renderIcon) {
        renderEventIcon(element, parentGfx, attrs);
      }

      return event;
    },
    'bpmn:SubProcess': function(parentGfx, element, attrs = {}) {
      if (isExpanded(element)) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);
      } else {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);
      }

      return renderSubProcess(parentGfx, element, attrs);
    },
    'bpmn:Task': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      return renderTask(parentGfx, element, attrs);
    },
    'bpmn:TextAnnotation': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke',
        'width',
        'height'
      ]);

      var {
        width,
        height
      } = getBounds(element, attrs);

      var textElement = drawRect(parentGfx, width, height, 0, 0, {
        fill: 'none',
        stroke: 'none'
      });

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: width,
        containerHeight: height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      drawPath(parentGfx, textPathData, {
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
      });

      var semantic = getSemantic(element),
          text = semantic.get('text') || '';

      renderLabel(parentGfx, text, {
        align: 'left-top',
        box: getBounds(element, attrs),
        padding: 7,
        style: {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor, attrs.stroke)
        }
      });

      return textElement;
    },
    'bpmn:Transaction': function(parentGfx, element, attrs = {}) {
      if (isExpanded(element)) {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke',
          'width',
          'height'
        ]);
      } else {
        attrs = pickAttrs(attrs, [
          'fill',
          'stroke'
        ]);
      }

      var outer = renderSubProcess(parentGfx, element, {
        strokeWidth: 1.5,
        ...attrs
      });

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke),
        strokeWidth: 1.5
      });

      var expanded = isExpanded(element);

      if (!expanded) {
        attrs = {};
      }

      drawRect(
        parentGfx,
        getWidth(element, attrs),
        getHeight(element, attrs),
        TASK_BORDER_RADIUS - INNER_OUTER_DIST,
        INNER_OUTER_DIST,
        innerAttrs
      );

      return outer;
    },
    'bpmn:UserTask': function(parentGfx, element, attrs = {}) {
      attrs = pickAttrs(attrs, [
        'fill',
        'stroke'
      ]);

      var task = renderTask(parentGfx, element, attrs);

      var icon = getIcon('user', {
        width: TASK_ICON_SIZE,
        height: TASK_ICON_SIZE,
        box: {
          x: TASK_ICON_MARGIN_X,
          y: TASK_ICON_MARGIN_Y,
          width: TASK_ICON_SIZE,
          height: TASK_ICON_SIZE
        },
        attrs: {
          fill: getFillColor(element, defaultFillColor, attrs.fill),
          stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke)
        }
      });

      parentGfx.appendChild(icon);

      return task;
    },
    'label': function(parentGfx, element, attrs = {}) {
      return renderExternalLabel(parentGfx, element, attrs);
    }
  };

  // extension API, use at your own risk
  this._drawPath = drawPath;

  this._renderer = renderer;
}


inherits(BpmnRenderer, BaseRenderer);

BpmnRenderer.$inject = [
  'config.bpmnRenderer',
  'eventBus',
  'styles',
  'pathMap',
  'canvas',
  'textRenderer'
];


/**
 * @param {Element} element
 *
 * @return {boolean}
 */
BpmnRenderer.prototype.canRender = function(element) {
  return is(element, 'bpmn:BaseElement');
};

/**
 * Draw shape into parentGfx.
 *
 * @param {SVGElement} parentGfx
 * @param {Element} element
 * @param {Attrs} [attrs]
 *
 * @return {SVGElement} mainGfx
 */
BpmnRenderer.prototype.drawShape = function(parentGfx, element, attrs = {}) {
  var { type } = element;

  var handler = this._renderer(type);

  return handler(parentGfx, element, attrs);
};

/**
 * Draw connection into parentGfx.
 *
 * @param {SVGElement} parentGfx
 * @param {Element} element
 * @param {Attrs} [attrs]
 *
 * @return {SVGElement} mainGfx
 */
BpmnRenderer.prototype.drawConnection = function(parentGfx, element, attrs = {}) {
  var { type } = element;

  var handler = this._renderer(type);

  return handler(parentGfx, element, attrs);
};

/**
 * Get shape path.
 *
 * @param {Element} element
 *
 * @return {string} path
 */
BpmnRenderer.prototype.getShapePath = function(element) {
  if (is(element, 'bpmn:Event')) {
    return getCirclePath(element);
  }

  if (is(element, 'bpmn:Activity')) {
    return getRoundRectPath(element, TASK_BORDER_RADIUS);
  }

  if (is(element, 'bpmn:Gateway')) {
    return getDiamondPath(element);
  }

  return getRectPath(element);
};

/**
 * Pick attributes if they exist.
 *
 * @param {Object} attrs
 * @param {string[]} keys
 *
 * @returns {Object}
 */
function pickAttrs(attrs, keys = []) {
  return keys.reduce((pickedAttrs, key) => {
    if (attrs[ key ]) {
      pickedAttrs[ key ] = attrs[ key ];
    }

    return pickedAttrs;
  }, {});
}