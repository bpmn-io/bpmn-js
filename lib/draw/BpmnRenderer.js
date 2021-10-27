import inherits from 'inherits';

import {
  isObject,
  assign,
  forEach
} from 'min-dash';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  isExpanded,
  isEventSubProcess
} from '../util/DiUtil';

import {
  getLabel
} from '../features/label-editing/LabelUtil';

import { is } from '../util/ModelUtil';

import {
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  isTypedEvent,
  isThrowEvent,
  isCollection,
  getDi,
  getSemantic,
  getCirclePath,
  getRoundRectPath,
  getDiamondPath,
  getRectPath,
  getFillColor,
  getStrokeColor,
  getLabelColor
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
  rotate,
  transform,
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

import Ids from 'ids';

var RENDERER_IDS = new Ids();

var TASK_BORDER_RADIUS = 10;
var INNER_OUTER_DIST = 3;

var DEFAULT_FILL_OPACITY = .95,
    HIGH_FILL_OPACITY = .35;

var ELEMENT_LABEL_DISTANCE = 10;

export default function BpmnRenderer(
    config, eventBus, styles, pathMap,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
      defaultStrokeColor = config && config.defaultStrokeColor,
      defaultLabelColor = config && config.defaultLabelColor;

  var rendererId = RENDERER_IDS.next();

  var markers = {};

  var computeStyle = styles.computeStyle;

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [10000, 1];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

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
    return str.replace(/[^0-9a-zA-z]+/g, '_');
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
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5,
        attrs: {
          fill: stroke,
          stroke: stroke
        }
      });
    }

    if (type === 'messageflow-start') {
      var messageflowStart = svgCreate('circle');
      svgAttr(messageflowStart, { cx: 6, cy: 6, r: 3.5 });

      addMarker(id, {
        element: messageflowStart,
        attrs: {
          fill: fill,
          stroke: stroke
        },
        ref: { x: 6, y: 6 }
      });
    }

    if (type === 'messageflow-end') {
      var messageflowEnd = svgCreate('path');
      svgAttr(messageflowEnd, { d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z' });

      addMarker(id, {
        element: messageflowEnd,
        attrs: {
          fill: fill,
          stroke: stroke,
          strokeLinecap: 'butt'
        },
        ref: { x: 8.5, y: 5 }
      });
    }

    if (type === 'association-start') {
      var associationStart = svgCreate('path');
      svgAttr(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

      addMarker(id, {
        element: associationStart,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'association-end') {
      var associationEnd = svgCreate('path');
      svgAttr(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

      addMarker(id, {
        element: associationEnd,
        attrs: {
          fill: 'none',
          stroke: stroke,
          strokeWidth: 1.5
        },
        ref: { x: 12, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-flow-marker') {
      var conditionalflowMarker = svgCreate('path');
      svgAttr(conditionalflowMarker, { d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z' });

      addMarker(id, {
        element: conditionalflowMarker,
        attrs: {
          fill: fill,
          stroke: stroke
        },
        ref: { x: -1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-default-flow-marker') {
      var conditionaldefaultflowMarker = svgCreate('path');
      svgAttr(conditionaldefaultflowMarker, { d: 'M 6 4 L 10 16' });

      addMarker(id, {
        element: conditionaldefaultflowMarker,
        attrs: {
          stroke: stroke
        },
        ref: { x: 0, y: 10 },
        scale: 0.5
      });
    }
  }

  function drawCircle(parentGfx, width, height, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    var cx = width / 2,
        cy = height / 2;

    var circle = svgCreate('circle');
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset)
    });
    svgAttr(circle, attrs);

    svgAppend(parentGfx, circle);

    return circle;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });
    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawDiamond(parentGfx, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [{ x: x_2, y: 0 }, { x: width, y: y_2 }, { x: x_2, y: height }, { x: 0, y: y_2 }];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var polygon = svgCreate('polygon');
    svgAttr(polygon, {
      points: pointsString
    });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function drawMarker(type, parentGfx, path, attrs) {
    return drawPath(parentGfx, path, assign({ 'data-marker': type }, attrs));
  }

  function as(type) {
    return function(parentGfx, element, attrs) {
      return handlers[type](parentGfx, element, attrs);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  function renderEventContent(element, parentGfx, attrs) {

    var event = getSemantic(element);
    var isThrowing = isThrowEvent(event);

    if (event.eventDefinitions && event.eventDefinitions.length>1) {
      if (event.parallelMultiple) {
        return renderer('bpmn:ParallelMultipleEventDefinition')(parentGfx, element, attrs, isThrowing);
      }
      else {
        return renderer('bpmn:MultipleEventDefinition')(parentGfx, element, attrs, isThrowing);
      }
    }

    if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
      return renderer('bpmn:MessageEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
      return renderer('bpmn:TimerEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
      return renderer('bpmn:ConditionalEventDefinition')(parentGfx, element, attrs);
    }

    if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
      return renderer('bpmn:SignalEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
      return renderer('bpmn:EscalationEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
      return renderer('bpmn:LinkEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
      return renderer('bpmn:ErrorEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
      return renderer('bpmn:CancelEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
      return renderer('bpmn:CompensateEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
      return renderer('bpmn:TerminateEventDefinition')(parentGfx, element, attrs, isThrowing);
    }

    return null;
  }

  function renderLabel(parentGfx, label, options) {

    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, attrs) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: assign({
        fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
      }, attrs)
    });
  }

  function renderExternalLabel(parentGfx, element, attrs) {

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
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
        },
        attrs
      )
    });
  }

  function renderLaneLabel(parentGfx, text, element, attrs) {
    var textBox = renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.height
      },
      align: 'center-middle',
      style: assign({
        fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
      }, attrs)
    });

    var top = -1 * element.height;

    transform(textBox, 0, -top, 270);
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  var handlers = this.handlers = {
    'bpmn:Event': function(parentGfx, element, attrs) {

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      return drawCircle(parentGfx, element.width, element.height, attrs);
    },
    'bpmn:StartEvent': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var semantic = getSemantic(element);

      if (!semantic.isInterrupting) {
        attrs = {
          strokeDasharray: '6',
          strokeLinecap: 'round',
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };
      }

      var circle = renderer('bpmn:Event')(parentGfx, element, attrs);

      renderEventContent(element, parentGfx);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(parentGfx, element, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_MESSAGE', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.235,
          my: 0.315
        }
      });

      var fill = isThrowing ? getStrokeColor(element, defaultStrokeColor) : getFillColor(element, defaultFillColor);
      var stroke = isThrowing ? getFillColor(element, defaultFillColor) : getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: stroke
      }, attrs);

      var messagePath = drawPath(parentGfx, pathData, attrs);

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(parentGfx, element, attrs) {
      var outerAttrs = assign({
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var circle = drawCircle(parentGfx, element.width, element.height, 0.2 * element.height, outerAttrs);

      var pathData = pathMap.getScaledPath('EVENT_TIMER_WH', {
        xScaleFactor: 0.75,
        yScaleFactor: 0.75,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.5,
          my: 0.5
        }
      });

      var innerAttrs = assign({
        strokeWidth: 2,
        strokeLinecap: 'square',
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      drawPath(parentGfx, pathData, innerAttrs);

      for (var i = 0;i < 12; i++) {

        var linePathData = pathMap.getScaledPath('EVENT_TIMER_LINE', {
          xScaleFactor: 0.75,
          yScaleFactor: 0.75,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.5,
            my: 0.5
          }
        });

        var width = element.width / 2;
        var height = element.height / 2;

        var lineAttrs = assign({
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')',
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs);

        drawPath(parentGfx, linePathData, lineAttrs);
      }

      return circle;
    },
    'bpmn:EscalationEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      var pathData = pathMap.getScaledPath('EVENT_ESCALATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:ConditionalEventDefinition': function(parentGfx, event, attrs) {
      attrs = assign({
        strokeWidth: 1,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      var pathData = pathMap.getScaledPath('EVENT_CONDITIONAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.222
        }
      });

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:LinkEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_LINK', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.57,
          my: 0.263
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:ErrorEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_ERROR', {
        xScaleFactor: 1.1,
        yScaleFactor: 1.1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.2,
          my: 0.722
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:CancelEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_CANCEL_45', {
        xScaleFactor: 1.0,
        yScaleFactor: 1.0,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.638,
          my: -0.055
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      var path = drawPath(parentGfx, pathData, attrs);

      rotate(path, 45);

      return path;
    },
    'bpmn:CompensateEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.22,
          my: 0.5
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:SignalEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_SIGNAL', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:MultipleEventDefinition': function(parentGfx, event, attrs, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_MULTIPLE', {
        xScaleFactor: 1.1,
        yScaleFactor: 1.1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.222,
          my: 0.36
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      attrs = assign({
        strokeWidth: 1,
        fill: fill
      }, attrs);

      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:ParallelMultipleEventDefinition': function(parentGfx, event, attrs) {
      var pathData = pathMap.getScaledPath('EVENT_PARALLEL_MULTIPLE', {
        xScaleFactor: 1.2,
        yScaleFactor: 1.2,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.458,
          my: 0.194
        }
      });

      attrs = assign({
        strokeWidth: 1,
        fill: getStrokeColor(event, defaultStrokeColor),
        stroke: getStrokeColor(event, defaultStrokeColor)
      }, attrs);


      return drawPath(parentGfx, pathData, attrs);
    },
    'bpmn:EndEvent': function(parentGfx, element, attrs) {
      var outerAttrs = assign({
        strokeWidth: 4,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
      }, attrs);

      var circle = renderer('bpmn:Event')(parentGfx, element, outerAttrs);

      renderEventContent(element, parentGfx, attrs);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeWidth: 4
      }, attrs);

      var circle = drawCircle(parentGfx, element.width, element.height, 8, attrs);

      return circle;
    },
    'bpmn:IntermediateEvent': function(parentGfx, element, attrs) {
      var outerAttrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var outer = renderer('bpmn:Event')(parentGfx, element, outerAttrs);

      /* inner */
      drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, assign({}, outerAttrs, {
        fill: getFillColor(element, 'none'),
      }));

      renderEventContent(element, parentGfx, attrs);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(parentGfx, element, attrs) {

      attrs = attrs || {};

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs);
    },

    'bpmn:Task': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      attachTaskMarkers(parentGfx, element, attrs);

      return rect;
    },
    'bpmn:ServiceTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      var serviceAttrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* service bg */ drawPath(parentGfx, pathDataBG, serviceAttrs);

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      var fillAttrs = assign({
        strokeWidth: 0,
        fill: getFillColor(element, defaultFillColor)
      }, attrs);
      /* service fill */ drawPath(parentGfx, fillPathData, fillAttrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 17,
          y: 22
        }
      });

      /* service */ drawPath(parentGfx, pathData, serviceAttrs);

      return task;
    },
    'bpmn:UserTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var x = 15;
      var y = 12;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userAttrs = assign({
        strokeWidth: 0.5,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* user path */ drawPath(parentGfx, pathData, userAttrs);

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ drawPath(parentGfx, pathData2, userAttrs);

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ drawPath(parentGfx, pathData3, userAttrs);

      return task;
    },
    'bpmn:ManualTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      var manualAttrs = assign({
        strokeWidth: 0.5, // 0.25,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* manual path */ drawPath(parentGfx, pathData, manualAttrs);

      return task;
    },
    'bpmn:SendTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: 21,
        containerHeight: 14,
        position: {
          mx: 0.285,
          my: 0.357
        }
      });

      /* send path */
      var pathAttrs = assign({
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getFillColor(element, defaultFillColor)
      }, attrs);

      drawPath(parentGfx, pathData, pathAttrs);

      return task;
    },
    'bpmn:ReceiveTask' : function(parentGfx, element, attrs) {
      var semantic = getSemantic(element);

      var task = renderer('bpmn:Task')(parentGfx, element, attrs);
      var pathData;

      if (semantic.instantiate) {
        drawCircle(parentGfx, 28, 28, 20 * 0.22, assign({ strokeWidth: 1 }, attrs));

        pathData = pathMap.getScaledPath('TASK_TYPE_INSTANTIATING_SEND', {
          abspos: {
            x: 7.77,
            y: 9.52
          }
        });
      } else {

        pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
          xScaleFactor: 0.9,
          yScaleFactor: 0.9,
          containerWidth: 21,
          containerHeight: 14,
          position: {
            mx: 0.3,
            my: 0.4
          }
        });
      }

      var receiveAttrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      /* receive path */ drawPath(parentGfx, pathData, receiveAttrs);

      return task;
    },
    'bpmn:ScriptTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      var scriptAttrs = assign({
        strokeWidth: 1,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* script path */ drawPath(parentGfx, pathData, scriptAttrs);

      return task;
    },
    'bpmn:BusinessRuleTask': function(parentGfx, element, attrs) {
      var task = renderer('bpmn:Task')(parentGfx, element, attrs);

      var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var headerAttrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, '#aaaaaa'),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      drawPath(parentGfx, headerPathData, headerAttrs);

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessAttrs = assign({
        strokeWidth: 1,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      drawPath(parentGfx, headerData, businessAttrs);

      return task;
    },
    'bpmn:SubProcess': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

      var expanded = isExpanded(element);

      if (isEventSubProcess(element)) {
        svgAttr(rect, {
          strokeDasharray: '1,2'
        });
      }

      renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        attachTaskMarkers(parentGfx, element, attrs);
      } else {
        attachTaskMarkers(parentGfx, element, attrs, ['SubProcessMarker']);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(parentGfx, element, attrs) {
      return renderer('bpmn:SubProcess')(parentGfx, element, attrs);
    },
    'bpmn:Transaction': function(parentGfx, element, attrs) {
      var outer = renderer('bpmn:SubProcess')(parentGfx, element, attrs);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      /* inner path */ drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, assign(innerAttrs, attrs));

      return outer;
    },
    'bpmn:CallActivity': function(parentGfx, element, attrs) {
      attrs = assign({
        strokeWidth: 5
      }, attrs);

      return renderer('bpmn:SubProcess')(parentGfx, element, attrs);
    },
    'bpmn:Participant': function(parentGfx, element, attrs) {
      var outerAttrs = assign({
        fillOpacity: DEFAULT_FILL_OPACITY,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var lane = renderer('bpmn:Lane')(parentGfx, element, outerAttrs);

      var expandedPool = isExpanded(element);

      if (expandedPool) {
        drawLine(parentGfx, [
          { x: 30, y: 0 },
          { x: 30, y: element.height }
        ], assign({
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs));
        var text = getSemantic(element).name;
        renderLaneLabel(parentGfx, text, element);
      } else {

        // Collapsed pool draw text inline
        var text2 = getSemantic(element).name;
        renderLabel(parentGfx, text2, {
          box: element, align: 'center-middle',
          style: {
            fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
          }
        });
      }

      var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

      if (participantMultiplicity) {
        renderer('ParticipantMultiplicityMarker')(parentGfx, element, attrs);
      }

      return lane;
    },
    'bpmn:Lane': function(parentGfx, element, attrs) {
      var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: HIGH_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs));

      var semantic = getSemantic(element);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        renderLaneLabel(parentGfx, text, element);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(parentGfx, element, attrs) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element, attrs);


      var circleAttrs = assign({
        strokeWidth: 2.5,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      /* circle path */
      drawCircle(parentGfx, element.width, element.height, element.height * 0.24, circleAttrs);

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(parentGfx, element, attrs) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('GATEWAY_EXCLUSIVE', {
        xScaleFactor: 0.4,
        yScaleFactor: 0.4,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.32,
          my: 0.3
        }
      });

      if ((getDi(element).isMarkerVisible)) {
        drawPath(parentGfx, pathData, assign({
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs));
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(parentGfx, element, attrs) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('GATEWAY_COMPLEX', {
        xScaleFactor: 0.5,
        yScaleFactor:0.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.26
        }
      });

      var innerAttrs = assign({
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* complex path */ drawPath(parentGfx, pathData, innerAttrs);

      return diamond;
    },
    'bpmn:ParallelGateway': function(parentGfx, element, attrs) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element, attrs);

      var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
        xScaleFactor: 0.6,
        yScaleFactor:0.6,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.2
        }
      });

      var innerAttrs = assign({
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* parallel path */ drawPath(parentGfx, pathData, innerAttrs);

      return diamond;
    },
    'bpmn:EventBasedGateway': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element);

      var diamond = renderer('bpmn:Gateway')(parentGfx, element, attrs);

      var outerAttrs = assign({
        strokeWidth: 1,
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      /* outer circle path */ drawCircle(parentGfx, element.width, element.height, element.height * 0.20, outerAttrs);

      var type = semantic.eventGatewayType;
      var instantiate = !!semantic.instantiate;

      function drawEvent() {

        var pathData = pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
          xScaleFactor: 0.18,
          yScaleFactor: 0.18,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.36,
            my: 0.44
          }
        });

        var innerAttrs = assign({
          strokeWidth: 2,
          fill: getFillColor(element, 'none'),
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs);
        /* event path */ drawPath(parentGfx, pathData, innerAttrs);
      }

      if (type === 'Parallel') {

        var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
          xScaleFactor: 0.4,
          yScaleFactor:0.4,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.474,
            my: 0.296
          }
        });

        var parallelPath = drawPath(parentGfx, pathData, attrs);
        svgAttr(parallelPath, {
          strokeWidth: 1,
          fill: 'none'
        });
      } else if (type === 'Exclusive') {

        if (!instantiate) {
          var innerCircleAttrs = assign({
            strokeWidth: 1,
            fill: 'none',
            stroke: getStrokeColor(element, defaultStrokeColor)
          }, attrs);
          drawCircle(parentGfx, element.width, element.height, element.height * 0.26, innerCircleAttrs);
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      return drawDiamond(parentGfx, element.width, element.height, attrs);
    },
    'bpmn:SequenceFlow': function(parentGfx, element, attrs) {
      attrs = attrs || {};

      var pathData = createPathFromConnection(element);

      var fill = attrs.fill || getFillColor(element, defaultFillColor),
          stroke = attrs.stroke || getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end', fill, stroke),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs || {});

      var path = drawPath(parentGfx, pathData, attrs);

      var sequenceFlow = getSemantic(element);

      var source;

      if (element.source) {
        source = element.source.businessObject;

        // conditional flow marker
        if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
          svgAttr(path, {
            markerStart: marker('conditional-flow-marker', fill, stroke)
          });
        }

        // default marker
        if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
            source.default === sequenceFlow) {
          svgAttr(path, {
            markerStart: marker('conditional-default-flow-marker', fill, stroke)
          });
        }
      }

      return path;
    },
    'bpmn:Association': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        strokeDasharray: '0.5, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = marker('association-end', fill, stroke);
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = marker('association-start', fill, stroke);
      }

      return drawLine(parentGfx, element.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(parentGfx, element, attrs) {
      attrs = attrs || {};

      var fill = attrs.fill || getFillColor(element, defaultFillColor),
          stroke = attrs.stroke || getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        markerEnd: marker('association-end', fill, stroke)
      }, attrs);

      return renderer('bpmn:Association')(parentGfx, element, attrs);
    },
    'bpmn:DataOutputAssociation': function(parentGfx, element, attrs) {
      attrs = attrs || {};

      var fill = attrs.fill || getFillColor(element, defaultFillColor),
          stroke = attrs.stroke || getStrokeColor(element, defaultStrokeColor);


      attrs = assign({
        markerEnd: marker('association-end', fill, stroke)
      }, attrs);

      return renderer('bpmn:Association')(parentGfx, element, attrs);
    },
    'bpmn:MessageFlow': function(parentGfx, element, attrs) {
      attrs = attrs || {};

      var semantic = getSemantic(element),
          di = getDi(element);

      var fill = attrs.fill || getFillColor(element, defaultFillColor),
          stroke = attrs.stroke || getStrokeColor(element, defaultStrokeColor);

      var pathData = createPathFromConnection(element);


      attrs = assign({
        markerEnd: marker('messageflow-end', fill, stroke),
        markerStart: marker('messageflow-start', fill, stroke),
        strokeDasharray: '10, 12',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '1.5px',
        stroke: stroke
      }, attrs);

      var path = drawPath(parentGfx, pathData, attrs);

      if (semantic.messageRef) {
        var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

        var markerPathData = pathMap.getScaledPath('MESSAGE_FLOW_MARKER', {
          abspos: {
            x: midPoint.x,
            y: midPoint.y
          }
        });

        var messageAttrs = { strokeWidth: 1 };

        if (di.messageVisibleKind === 'initiating') {
          messageAttrs.fill = 'white';
          messageAttrs.stroke = 'black';
        } else {
          messageAttrs.fill = '#888';
          messageAttrs.stroke = 'white';
        }

        var message = drawPath(parentGfx, markerPathData, messageAttrs);

        var labelText = semantic.messageRef.name;
        var label = renderLabel(parentGfx, labelText, {
          align: 'center-top',
          fitBox: true,
          style: {
            fill: getStrokeColor(element, defaultLabelColor, defaultStrokeColor)
          }
        });

        var messageBounds = message.getBBox(),
            labelBounds = label.getBBox();

        var translateX = midPoint.x - labelBounds.width / 2,
            translateY = midPoint.y + messageBounds.height / 2 + ELEMENT_LABEL_DISTANCE;

        transform(label, translateX, translateY, 0);

      }

      return path;
    },
    'bpmn:DataObject': function(parentGfx, element, attrs) {
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

      var outerAttrs = assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      var elementObject = drawPath(parentGfx, pathData, outerAttrs);

      var semantic = getSemantic(element);

      if (isCollection(semantic)) {
        renderDataItemCollection(parentGfx, element, attrs);
      }

      return elementObject;
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataInput': function(parentGfx, element, attrs) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element, attrs);

      var innerAttrs = assign({ strokeWidth: 1 }, attrs);
      /* input arrow path */ drawPath(parentGfx, arrowPathData, innerAttrs);

      return elementObject;
    },
    'bpmn:DataOutput': function(parentGfx, element, attrs) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element, attrs);

      var arrowAttrs = assign({
        strokeWidth: 1,
        fill: 'black'
      }, attrs);
      /* output arrow path */ drawPath(parentGfx, arrowPathData, arrowAttrs);

      return elementObject;
    },
    'bpmn:DataStoreReference': function(parentGfx, element, attrs) {
      attrs = assign({
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var DATA_STORE_PATH = pathMap.getScaledPath('DATA_STORE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0,
          my: 0.133
        }
      });

      var elementStore = drawPath(parentGfx, DATA_STORE_PATH, attrs);

      return elementStore;
    },
    'bpmn:BoundaryEvent': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element),
          cancel = semantic.cancelActivity;

      attrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      if (!cancel) {
        attrs.strokeDasharray = '6';
        attrs.strokeLinecap = 'round';
      }

      // apply fillOpacity
      var outerAttrs = assign({}, attrs, {
        fillOpacity: 1
      });

      // apply no-fill
      var innerAttrs = assign({}, attrs, {
        fill: 'none'
      });

      var outer = renderer('bpmn:Event')(parentGfx, element, outerAttrs);

      /* inner path */ drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, innerAttrs);

      renderEventContent(element, parentGfx, attrs);

      return outer;
    },
    'bpmn:Group': function(parentGfx, element, attrs) {

      attrs = assign({
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      }, attrs);

      var group = drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs);

      return group;
    },
    'label': function(parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    },
    'bpmn:TextAnnotation': function(parentGfx, element, attrs) {
      var style = assign({}, attrs, {
        'fill': 'none',
        'stroke': 'none'
      });

      var textElement = drawRect(parentGfx, element.width, element.height, 0, 0, style);

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      var pathAttrs = assign({
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      drawPath(parentGfx, textPathData, pathAttrs);

      var text = getSemantic(element).text || '';
      renderLabel(parentGfx, text, {
        box: element,
        align: 'left-top',
        padding: 5,
        style: {
          fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
        }
      });

      return textElement;
    },
    'ParticipantMultiplicityMarker': function(parentGfx, element, attrs) {
      attrs = assign({
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      drawMarker('participant-multiplicity', parentGfx, markerPath, attrs);
    },
    'SubProcessMarker': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var markerRect = drawRect(parentGfx, 14, 14, 0, assign({ strokeWidth: 1 }, attrs));

      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
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

      drawMarker('sub-process', parentGfx, markerPath, attrs);
    },
    'ParallelMarker': function(parentGfx, element, attrs, position) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.parallel) / element.width),
          my: (element.height - 20) / element.height
        }
      });

      drawMarker('parallel', parentGfx, markerPath, attrs);
    },
    'SequentialMarker': function(parentGfx, element, attrs, position) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);
      var markerPath = pathMap.getScaledPath('MARKER_SEQUENTIAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.seq) / element.width),
          my: (element.height - 19) / element.height
        }
      });

      drawMarker('sequential', parentGfx, markerPath, attrs);
    },
    'CompensationMarker': function(parentGfx, element, attrs, position) {
      attrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var markerMath = pathMap.getScaledPath('MARKER_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.compensation) / element.width),
          my: (element.height - 13) / element.height
        }
      });

      drawMarker('compensation', parentGfx, markerMath, attrs);
    },
    'LoopMarker': function(parentGfx, element, attrs, position) {
      attrs = assign({
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      }, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_LOOP', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.loop) / element.width),
          my: (element.height - 7) / element.height
        }
      });

      drawMarker('loop', parentGfx, markerPath, attrs);
    },
    'AdhocMarker': function(parentGfx, element, attrs, position) {
      attrs = assign({
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var markerPath = pathMap.getScaledPath('MARKER_ADHOC', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.adhoc) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      drawMarker('adhoc', parentGfx, markerPath, attrs);
    }
  };

  function attachTaskMarkers(parentGfx, element, attrs, taskMarkers) {
    var obj = getSemantic(element);

    var subprocess = taskMarkers && taskMarkers.indexOf('SubProcessMarker') !== -1;
    var position;

    if (subprocess) {
      position = {
        seq: -21,
        parallel: -22,
        compensation: -42,
        loop: -18,
        adhoc: 10
      };
    } else {
      position = {
        seq: -3,
        parallel: -6,
        compensation: -27,
        loop: 0,
        adhoc: 10
      };
    }

    forEach(taskMarkers, function(marker) {
      renderer(marker)(parentGfx, element, attrs, position);
    });

    if (obj.isForCompensation) {
      renderer('CompensationMarker')(parentGfx, element, attrs, position);
    }

    if (obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(parentGfx, element, attrs, position);
    }

    var loopCharacteristics = obj.loopCharacteristics,
        isSequential = loopCharacteristics && loopCharacteristics.isSequential;

    if (loopCharacteristics) {

      if (isSequential === undefined) {
        renderer('LoopMarker')(parentGfx, element, attrs, position);
      }

      if (isSequential === false) {
        renderer('ParallelMarker')(parentGfx, element, attrs, position);
      }

      if (isSequential === true) {
        renderer('SequentialMarker')(parentGfx, element, attrs, position);
      }
    }
  }

  function renderDataItemCollection(parentGfx, element, attrs) {
    attrs = assign({
      strokeWidth: 2
    }, attrs);

    var yPosition = (element.height - 18) / element.height;

    var pathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
      xScaleFactor: 1,
      yScaleFactor: 1,
      containerWidth: element.width,
      containerHeight: element.height,
      position: {
        mx: 0.33,
        my: yPosition
      }
    });

    /* collection path */ drawPath(parentGfx, pathData, attrs);
  }


  // extension API, use at your own risk
  this._drawPath = drawPath;

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


BpmnRenderer.prototype.canRender = function(element) {
  return is(element, 'bpmn:BaseElement');
};

BpmnRenderer.prototype.drawShape = function(parentGfx, element, attrs) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element, attrs);
};

BpmnRenderer.prototype.drawConnection = function(parentGfx, element, attrs) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element, attrs);
};

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
