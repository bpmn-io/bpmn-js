'use strict';

var inherits = require('inherits'),
    isObject = require('lodash/lang/isObject'),
    assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    every = require('lodash/collection/every'),
    includes = require('lodash/collection/includes'),
    some = require('lodash/collection/some');

var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer'),
    TextUtil = require('diagram-js/lib/util/Text'),
    DiUtil = require('../util/DiUtil');

var is = require('../util/ModelUtil').is;

var RenderUtil = require('diagram-js/lib/util/RenderUtil');

var componentsToPath = RenderUtil.componentsToPath,
    createLine = RenderUtil.createLine;

var domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');

var rotate = require('diagram-js/lib/util/SvgTransformUtil').rotate,
    transform = require('diagram-js/lib/util/SvgTransformUtil').transform,
    translate = require('diagram-js/lib/util/SvgTransformUtil').translate;

var TASK_BORDER_RADIUS = 10;
var INNER_OUTER_DIST = 3;

var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12
};


function BpmnRenderer(eventBus, styles, pathMap, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var textUtil = new TextUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  });

  var markers = {};

  var computeStyle = styles.computeStyle;

  function addMarker(id, element) {
    markers[id] = element;
  }

  function marker(id) {
    var marker = markers[id];

    return 'url(#' + marker.id + ')';
  }

  function initMarkers(svg) {

    function createMarker(id, options) {
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

      var defs = domQuery('defs', svg);

      if (!defs) {
        defs = svgCreate('defs');

        svgAppend(svg, defs);
      }

      svgAppend(defs, marker);

      return addMarker(id, marker);
    }

    var sequenceflowEnd = svgCreate('path');
    svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

    createMarker('sequenceflow-end', {
      element: sequenceflowEnd,
      ref: { x: 11, y: 10 },
      scale: 0.5
    });

    var messageflowStart = svgCreate('circle');
    svgAttr(messageflowStart, { cx: 6, cy: 6, r: 3.5 });

    createMarker('messageflow-start', {
      element: messageflowStart,
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: 6, y: 6 }
    });

    var messageflowEnd = svgCreate('path');
    svgAttr(messageflowEnd, { d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z' });

    createMarker('messageflow-end', {
      element: messageflowEnd,
      attrs: {
        fill: 'white',
        stroke: 'black',
        strokeLinecap: 'butt'
      },
      ref: { x: 8.5, y: 5 }
    });

    var associationStart = svgCreate('path');
    svgAttr(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

    createMarker('association-start', {
      element: associationStart,
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 1, y: 10 },
      scale: 0.5
    });

    var associationEnd = svgCreate('path');
    svgAttr(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

    createMarker('association-end', {
      element: associationEnd,
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 12, y: 10 },
      scale: 0.5
    });

    var conditionalflowMarker = svgCreate('path');
    svgAttr(conditionalflowMarker, { d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z' });

    createMarker('conditional-flow-marker', {
      element: conditionalflowMarker,
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: -1, y: 10 },
      scale: 0.5
    });

    var conditionaldefaultflowMarker = svgCreate('path');
    svgAttr(conditionaldefaultflowMarker, { d: 'M 1 4 L 5 16' });

    createMarker('conditional-default-flow-marker', {
      element: conditionaldefaultflowMarker,
      attrs: {
        stroke: 'black'
      },
      ref: { x: -5, y: 10 },
      scale: 0.5
    });
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
    return function(parentGfx, element) {
      return handlers[type](parentGfx, element);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  function renderEventContent(element, parentGfx) {

    var event = getSemantic(element);
    var isThrowing = isThrowEvent(event);

    if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
      return renderer('bpmn:MessageEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
      return renderer('bpmn:TimerEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
      return renderer('bpmn:ConditionalEventDefinition')(parentGfx, element);
    }

    if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
      return renderer('bpmn:SignalEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: false })) {
      return renderer('bpmn:MultipleEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: true })) {
      return renderer('bpmn:ParallelMultipleEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
      return renderer('bpmn:EscalationEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
      return renderer('bpmn:LinkEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
      return renderer('bpmn:ErrorEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
      return renderer('bpmn:CancelEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
      return renderer('bpmn:CompensateEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
      return renderer('bpmn:TerminateEventDefinition')(parentGfx, element, isThrowing);
    }

    return null;
  }

  function renderLabel(parentGfx, label, options) {
    var text = textUtil.createText(parentGfx, label || '', options);
    domClasses(text).add('djs-label');

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align) {
    var semantic = getSemantic(element);
    return renderLabel(parentGfx, semantic.name, { box: element, align: align, padding: 5 });
  }

  function renderExternalLabel(parentGfx, element) {
    var semantic = getSemantic(element);
    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, semantic.name, { box: box, style: { fontSize: '11px' } });
  }

  function renderLaneLabel(parentGfx, text, element) {
    var textBox = renderLabel(parentGfx, text, {
      box: { height: 30, width: element.height },
      align: 'center-middle'
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
      return drawCircle(parentGfx, element.width, element.height,  attrs);
    },
    'bpmn:StartEvent': function(parentGfx, element) {
      var attrs = {};
      var semantic = getSemantic(element);

      if (!semantic.isInterrupting) {
        attrs = {
          strokeDasharray: '6',
          strokeLinecap: 'round'
        };
      }

      var circle = renderer('bpmn:Event')(parentGfx, element, attrs);

      renderEventContent(element, parentGfx);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(parentGfx, element, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'white';
      var stroke = isThrowing ? 'white' : 'black';

      var messagePath = drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(parentGfx, element) {

      var circle = drawCircle(parentGfx, element.width, element.height, 0.2 * element.height, {
        strokeWidth: 2
      });

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

      drawPath(parentGfx, pathData, {
        strokeWidth: 2,
        strokeLinecap: 'square'
      });

      for (var i = 0;i < 12;i++) {

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

        drawPath(parentGfx, linePathData, {
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')'
        });
      }

      return circle;
    },
    'bpmn:EscalationEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ConditionalEventDefinition': function(parentGfx, event) {
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

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1
      });
    },
    'bpmn:LinkEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ErrorEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:CancelEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      var path = drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });

      rotate(path, 45);

      return path;
    },
    'bpmn:CompensateEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:SignalEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:MultipleEventDefinition': function(parentGfx, event, isThrowing) {
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

      var fill = isThrowing ? 'black' : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ParallelMultipleEventDefinition': function(parentGfx, event) {
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

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1
      });
    },
    'bpmn:EndEvent': function(parentGfx, element) {
      var circle = renderer('bpmn:Event')(parentGfx, element, {
        strokeWidth: 4
      });

      renderEventContent(element, parentGfx, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(parentGfx, element) {
      var circle = drawCircle(parentGfx, element.width, element.height, 8, {
        strokeWidth: 4,
        fill: 'black'
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(parentGfx, element) {
      var outer = renderer('bpmn:Event')(parentGfx, element, { strokeWidth: 1 });
      /* inner */ drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, { strokeWidth: 1, fill: 'none' });

      renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(parentGfx, element, attrs) {
      return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs);
    },

    'bpmn:Task': function(parentGfx, element, attrs) {
      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);
      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      attachTaskMarkers(parentGfx, element);
      return rect;
    },
    'bpmn:ServiceTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      /* service bg */ drawPath(parentGfx, pathDataBG, {
        strokeWidth: 1,
        fill: 'none'
      });

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      /* service fill */ drawPath(parentGfx, fillPathData, {
        strokeWidth: 0,
        stroke: 'none',
        fill: 'white'
      });

      var pathData = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 17,
          y: 22
        }
      });

      /* service */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: 'white'
      });

      return task;
    },
    'bpmn:UserTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var x = 15;
      var y = 12;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user path */ drawPath(parentGfx, pathData, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ drawPath(parentGfx, pathData2, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ drawPath(parentGfx, pathData3, {
        strokeWidth: 0.5,
        fill: 'black'
      });

      return task;
    },
    'bpmn:ManualTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      /* manual path */ drawPath(parentGfx, pathData, {
        strokeWidth: 0.25,
        fill: 'white',
        stroke: 'black'
      });

      return task;
    },
    'bpmn:SendTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

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

      /* send path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: 'black',
        stroke: 'white'
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(parentGfx, element) {
      var semantic = getSemantic(element);

      var task = renderer('bpmn:Task')(parentGfx, element);
      var pathData;

      if (semantic.instantiate) {
        drawCircle(28, 28, 20 * 0.22, { strokeWidth: 1 });

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

      /* receive path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:ScriptTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      /* script path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:BusinessRuleTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessHeaderPath = drawPath(parentGfx, headerPathData);
      svgAttr(businessHeaderPath, {
        strokeWidth: 1,
        fill: 'AAA'
      });

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessPath = drawPath(parentGfx, headerData);
      svgAttr(businessPath, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:SubProcess': function(parentGfx, element, attrs) {

      attrs = assign({ fillOpacity: 0.95 }, attrs);

      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

      var expanded = DiUtil.isExpanded(element);

      var isEventSubProcess = DiUtil.isEventSubProcess(element);

      if (isEventSubProcess) {
        svgAttr(rect, {
          strokeDasharray: '1,2'
        });
      }

      renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        attachTaskMarkers(parentGfx, element);
      } else {
        attachTaskMarkers(parentGfx, element, ['SubProcessMarker']);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(parentGfx, element) {
      return renderer('bpmn:SubProcess')(parentGfx, element);
    },
    'bpmn:Transaction': function(parentGfx, element) {
      var outer = renderer('bpmn:SubProcess')(parentGfx, element);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ]);

      /* inner path */ drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, innerAttrs);

      return outer;
    },
    'bpmn:CallActivity': function(parentGfx, element) {
      return renderer('bpmn:SubProcess')(parentGfx, element, {
        strokeWidth: 5
      });
    },
    'bpmn:Participant': function(parentGfx, element) {

      var lane = renderer('bpmn:Lane')(parentGfx, element, {
        fillOpacity: 0.95,
        fill: 'White'
      });

      var expandedPool = DiUtil.isExpanded(element);

      if (expandedPool) {
        drawLine(parentGfx, [
          { x: 30, y: 0 },
          { x: 30, y: element.height }
        ]);
        var text = getSemantic(element).name;
        renderLaneLabel(parentGfx, text, element);
      } else {
        // Collapsed pool draw text inline
        var text2 = getSemantic(element).name;
        renderLabel(parentGfx, text2, { box: element, align: 'center-middle' });
      }

      var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

      if (participantMultiplicity) {
        renderer('ParticipantMultiplicityMarker')(parentGfx, element);
      }

      return lane;
    },
    'bpmn:Lane': function(parentGfx, element, attrs) {
      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs || {
        fill: 'none'
      });

      var semantic = getSemantic(element);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        renderLaneLabel(parentGfx, text, element);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(parentGfx, element) {
      var diamond = drawDiamond(parentGfx, element.width, element.height);

      /* circle path */
      drawCircle(parentGfx, element.width, element.height, element.height * 0.24, {
        strokeWidth: 2.5,
        fill: 'none'
      });

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(parentGfx, element) {
      var diamond = drawDiamond(parentGfx, element.width, element.height);

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
        drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: 'black'
        });
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(parentGfx, element) {
      var diamond = drawDiamond(parentGfx, element.width, element.height);

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

      /* complex path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:ParallelGateway': function(parentGfx, element) {
      var diamond = drawDiamond(parentGfx, element.width, element.height);

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

      /* parallel path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(parentGfx, element) {

      var semantic = getSemantic(element);

      var diamond = drawDiamond(parentGfx, element.width, element.height);

      /* outer circle path */ drawCircle(parentGfx, element.width, element.height, element.height * 0.20, {
        strokeWidth: 1,
        fill: 'none'
      });

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

        /* event path */ drawPath(parentGfx, pathData, {
          strokeWidth: 2,
          fill: 'none'
        });
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

        var parallelPath = drawPath(parentGfx, pathData);
        svgAttr(parallelPath, {
          strokeWidth: 1,
          fill: 'none'
        });
      } else if (type === 'Exclusive') {

        if (!instantiate) {
          var innerCircle = drawCircle(parentGfx, element.width, element.height, element.height * 0.26);
          svgAttr(innerCircle, {
            strokeWidth: 1,
            fill: 'none'
          });
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(parentGfx, element) {
      return drawDiamond(parentGfx, element.width, element.height);
    },
    'bpmn:SequenceFlow': function(parentGfx, element) {
      var pathData = createPathFromConnection(element);
      var path = drawPath(parentGfx, pathData, {
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end')
      });

      var sequenceFlow = getSemantic(element);
      var source = element.source.businessObject;

      // conditional flow marker
      if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
        svgAttr(path, {
          markerStart: marker('conditional-flow-marker')
        });
      }

      // default marker
      if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
          source.default === sequenceFlow) {
        svgAttr(path, {
          markerStart: marker('conditional-default-flow-marker')
        });
      }

      return path;
    },
    'bpmn:Association': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element);

      attrs = assign({
        strokeDasharray: '0.5, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = marker('association-end');
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = marker('association-start');
      }

      return drawLine(parentGfx, element.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(parentGfx, element) {
      return renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: marker('association-end')
      });
    },
    'bpmn:DataOutputAssociation': function(parentGfx, element) {
      return renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: marker('association-end')
      });
    },
    'bpmn:MessageFlow': function(parentGfx, element) {

      var semantic = getSemantic(element),
          di = getDi(element);

      var pathData = createPathFromConnection(element);
      var path = drawPath(parentGfx, pathData, {
        markerEnd: marker('messageflow-end'),
        markerStart: marker('messageflow-start'),
        strokeDasharray: '10, 12',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '1.5px'
      });

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

        drawPath(parentGfx, markerPathData, messageAttrs);
      }

      return path;
    },
    'bpmn:DataObject': function(parentGfx, element) {
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

      var elementObject = drawPath(parentGfx, pathData, { fill: 'white' });

      var semantic = getSemantic(element);

      if (isCollection(semantic)) {
        renderDataItemCollection(parentGfx, element);
      }

      return elementObject;
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataInput': function(parentGfx, element) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

      /* input arrow path */ drawPath(parentGfx, arrowPathData, { strokeWidth: 1 });

      return elementObject;
    },
    'bpmn:DataOutput': function(parentGfx, element) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

      /* output arrow path */ drawPath(parentGfx, arrowPathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return elementObject;
    },
    'bpmn:DataStoreReference': function(parentGfx, element) {
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

      var elementStore = drawPath(parentGfx, DATA_STORE_PATH, {
        strokeWidth: 2,
        fill: 'white'
      });

      return elementStore;
    },
    'bpmn:BoundaryEvent': function(parentGfx, element) {

      var semantic = getSemantic(element),
          cancel = semantic.cancelActivity;

      var attrs = {
        strokeWidth: 1
      };

      if (!cancel) {
        attrs.strokeDasharray = '6';
        attrs.strokeLinecap = 'round';
      }

      var outer = renderer('bpmn:Event')(parentGfx, element, attrs);
      /* inner path */ drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, assign(attrs, { fill: 'none' }));

      renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:Group': function(parentGfx, element) {
      return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      });
    },
    'label': function(parentGfx, element) {
      // Update external label size and bounds during rendering when
      // we have the actual rendered bounds anyway.

      var textElement = renderExternalLabel(parentGfx, element);

      var textBBox;

      try {
        textBBox = textElement.getBBox();
      } catch (e) {
        textBBox = { width: 0, height: 0, x: 0 };
      }

      // update element.x so that the layouted text is still
      // center alligned (newX = oldMidX - newWidth / 2)
      element.x = Math.ceil(element.x + element.width / 2) - Math.ceil((textBBox.width / 2));

      // take element width, height from actual bounds
      element.width = Math.ceil(textBBox.width);
      element.height = Math.ceil(textBBox.height);

      // compensate bounding box x
      svgAttr(textElement, {
        transform: 'translate(' + (-1 * textBBox.x) + ',0)'
      });

      return textElement;
    },
    'bpmn:TextAnnotation': function(parentGfx, element) {
      var style = {
        'fill': 'none',
        'stroke': 'none'
      };
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
      drawPath(parentGfx, textPathData);

      var text = getSemantic(element).text || '';
      renderLabel(parentGfx, text, { box: element, align: 'left-middle', padding: 5 });

      return textElement;
    },
    'ParticipantMultiplicityMarker': function(parentGfx, element) {
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

      drawMarker('participant-multiplicity', parentGfx, markerPath);
    },
    'SubProcessMarker': function(parentGfx, element) {
      var markerRect = drawRect(parentGfx, 14, 14, 0, {
        strokeWidth: 1
      });

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

      drawMarker('sub-process', parentGfx, markerPath);
    },
    'ParallelMarker': function(parentGfx, element, position) {
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

      drawMarker('parallel', parentGfx, markerPath);
    },
    'SequentialMarker': function(parentGfx, element, position) {
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

      drawMarker('sequential', parentGfx, markerPath);
    },
    'CompensationMarker': function(parentGfx, element, position) {
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

      drawMarker('compensation', parentGfx, markerMath, { strokeWidth: 1 });
    },
    'LoopMarker': function(parentGfx, element, position) {
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

      drawMarker('loop', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'none',
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(parentGfx, element, position) {
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

      drawMarker('adhoc', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'black'
      });
    }
  };

  function attachTaskMarkers(parentGfx, element, taskMarkers) {
    var obj = getSemantic(element);

    var subprocess = includes(taskMarkers, 'SubProcessMarker');
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
      renderer(marker)(parentGfx, element, position);
    });

    if (obj.isForCompensation) {
      renderer('CompensationMarker')(parentGfx, element, position);
    }

    if (obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(parentGfx, element, position);
    }

    var loopCharacteristics = obj.loopCharacteristics,
        isSequential = loopCharacteristics && loopCharacteristics.isSequential;

    if (loopCharacteristics) {

      if (isSequential === undefined) {
        renderer('LoopMarker')(parentGfx, element, position);
      }

      if (isSequential === false) {
        renderer('ParallelMarker')(parentGfx, element, position);
      }

      if (isSequential === true) {
        renderer('SequentialMarker')(parentGfx, element, position);
      }
    }
  }

  function renderDataItemCollection(parentGfx, element) {

    var yPosition = (element.height - 16) / element.height;

    var pathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
      xScaleFactor: 1,
      yScaleFactor: 1,
      containerWidth: element.width,
      containerHeight: element.height,
      position: {
        mx: 0.451,
        my: yPosition
      }
    });

    /* collection path */ drawPath(parentGfx, pathData, {
      strokeWidth: 2
    });
  }

  // hook onto canvas init event to initialize
  // connection start/end markers on svg
  eventBus.on('canvas.init', function(event) {
    initMarkers(event.svg);
  });
}


inherits(BpmnRenderer, BaseRenderer);

BpmnRenderer.$inject = [ 'eventBus', 'styles', 'pathMap' ];

module.exports = BpmnRenderer;


BpmnRenderer.prototype.canRender = function(element) {
  return is(element, 'bpmn:BaseElement');
};

BpmnRenderer.prototype.drawShape = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

BpmnRenderer.prototype.drawConnection = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
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


///////// helper functions /////////////////////////////

/**
 * Checks if eventDefinition of the given element matches with semantic type.
 *
 * @return {boolean} true if element is of the given semantic type
 */
function isTypedEvent(event, eventDefinitionType, filter) {

  function matches(definition, filter) {
    return every(filter, function(val, key) {

      // we want a == conversion here, to be able to catch
      // undefined == false and friends
      /* jshint -W116 */
      return definition[key] == val;
    });
  }

  return some(event.eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType && matches(event, filter);
  });
}

function isThrowEvent(event) {
  return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
}

function isCollection(element) {
  return element.isCollection ||
        (element.elementObjectRef && element.elementObjectRef.isCollection);
}

function getDi(element) {
  return element.businessObject.di;
}

function getSemantic(element) {
  return element.businessObject;
}



/////// cropping path customizations /////////////////////////

function getCirclePath(shape) {

  var cx = shape.x + shape.width / 2,
      cy = shape.y + shape.height / 2,
      radius = shape.width / 2;

  var circlePath = [
    ['M', cx, cy],
    ['m', 0, -radius],
    ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
    ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
    ['z']
  ];

  return componentsToPath(circlePath);
}

function getRoundRectPath(shape, borderRadius) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var roundRectPath = [
    ['M', x + borderRadius, y],
    ['l', width - borderRadius * 2, 0],
    ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
    ['l', 0, height - borderRadius * 2],
    ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
    ['l', borderRadius * 2 - width, 0],
    ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
    ['l', 0, borderRadius * 2 - height],
    ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
    ['z']
  ];

  return componentsToPath(roundRectPath);
}

function getDiamondPath(shape) {

  var width = shape.width,
      height = shape.height,
      x = shape.x,
      y = shape.y,
      halfWidth = width / 2,
      halfHeight = height / 2;

  var diamondPath = [
    ['M', x + halfWidth, y],
    ['l', halfWidth, halfHeight],
    ['l', -halfWidth, halfHeight],
    ['l', -halfWidth, -halfHeight],
    ['z']
  ];

  return componentsToPath(diamondPath);
}

function getRectPath(shape) {
  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return componentsToPath(rectPath);
}
