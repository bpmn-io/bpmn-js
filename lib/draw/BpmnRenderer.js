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


var TASK_BORDER_RADIUS = 10;
var INNER_OUTER_DIST = 3;

var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px'
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
    return markers[id];
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

      var marker = options.element
                     .attr(attrs)
                     .marker(0, 0, 20, 20, ref.x, ref.y)
                     .attr({
                       markerWidth: 20 * scale,
                       markerHeight: 20 * scale
                     });

      return addMarker(id, marker);
    }


    createMarker('sequenceflow-end', {
      element: svg.path('M 1 5 L 11 10 L 1 15 Z'),
      ref: { x: 11, y: 10 },
      scale: 0.5
    });

    createMarker('messageflow-start', {
      element: svg.circle(6, 6, 3.5),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: 6, y: 6 }
    });

    createMarker('messageflow-end', {
      element: svg.path('m 1 5 l 0 -3 l 7 3 l -7 3 z'),
      attrs: {
        fill: 'white',
        stroke: 'black',
        strokeLinecap: 'butt'
      },
      ref: { x: 8.5, y: 5 }
    });

    createMarker('association-start', {
      element: svg.path('M 11 5 L 1 10 L 11 15'),
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 1, y: 10 },
      scale: 0.5
    });

    createMarker('association-end', {
      element: svg.path('M 1 5 L 11 10 L 1 15'),
      attrs: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 1.5
      },
      ref: { x: 12, y: 10 },
      scale: 0.5
    });

    createMarker('conditional-flow-marker', {
      element: svg.path('M 0 10 L 8 6 L 16 10 L 8 14 Z'),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: -1, y: 10 },
      scale: 0.5
    });

    createMarker('conditional-default-flow-marker', {
      element: svg.path('M 1 4 L 5 16'),
      attrs: {
        stroke: 'black'
      },
      ref: { x: -5, y: 10 },
      scale: 0.5
    });
  }

  function drawCircle(p, width, height, offset, attrs) {

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

    return p.circle(cx, cy, Math.round((width + height) / 4 - offset)).attr(attrs);
  }

  function drawRect(p, width, height, r, offset, attrs) {

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

    return p.rect(offset, offset, width - offset * 2, height - offset * 2, r).attr(attrs);
  }

  function drawDiamond(p, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [x_2, 0, width, y_2, x_2, height, 0, y_2 ];

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    return p.polygon(points).attr(attrs);
  }

  function drawLine(p, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    return createLine(waypoints, attrs).appendTo(p);
  }

  function drawPath(p, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    return p.path(d).attr(attrs);
  }

  function drawMarker(type, p, path, attrs) {
    return drawPath(p, path, assign({ 'data-marker': type }, attrs));
  }

  function as(type) {
    return function(p, element) {
      return handlers[type](p, element);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  function renderEventContent(element, p) {

    var event = getSemantic(element);
    var isThrowing = isThrowEvent(event);

    if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
      return renderer('bpmn:MessageEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
      return renderer('bpmn:TimerEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
      return renderer('bpmn:ConditionalEventDefinition')(p, element);
    }

    if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
      return renderer('bpmn:SignalEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: false })) {
      return renderer('bpmn:MultipleEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: true })) {
      return renderer('bpmn:ParallelMultipleEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
      return renderer('bpmn:EscalationEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
      return renderer('bpmn:LinkEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
      return renderer('bpmn:ErrorEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
      return renderer('bpmn:CancelEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
      return renderer('bpmn:CompensateEventDefinition')(p, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
      return renderer('bpmn:TerminateEventDefinition')(p, element, isThrowing);
    }

    return null;
  }

  function renderLabel(p, label, options) {
    return textUtil.createText(p, label || '', options).addClass('djs-label');
  }

  function renderEmbeddedLabel(p, element, align) {
    var semantic = getSemantic(element);
    return renderLabel(p, semantic.name, { box: element, align: align, padding: 5 });
  }

  function renderExternalLabel(p, element) {
    var semantic = getSemantic(element);
    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(p, semantic.name, { box: box, style: { fontSize: '11px' } });
  }

  function renderLaneLabel(p, text, element) {
    var textBox = renderLabel(p, text, {
      box: { height: 30, width: element.height },
      align: 'center-middle'
    });

    var top = -1 * element.height;
    textBox.transform(
      'rotate(270) ' +
      'translate(' + top + ',' + 0 + ')'
    );
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
    'bpmn:Event': function(p, element, attrs) {
      return drawCircle(p, element.width, element.height,  attrs);
    },
    'bpmn:StartEvent': function(p, element) {
      var attrs = {};
      var semantic = getSemantic(element);

      if (!semantic.isInterrupting) {
        attrs = {
          strokeDasharray: '6',
          strokeLinecap: 'round'
        };
      }

      var circle = renderer('bpmn:Event')(p, element, attrs);

      renderEventContent(element, p);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(p, element, isThrowing) {
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

      var messagePath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(p, element) {

      var circle = drawCircle(p, element.width, element.height, 0.2 * element.height, {
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

      drawPath(p, pathData, {
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

        drawPath(p, linePathData, {
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')'
        });
      }

      return circle;
    },
    'bpmn:EscalationEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ConditionalEventDefinition': function(p, event) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1
      });
    },
    'bpmn:LinkEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ErrorEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:CancelEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      }).transform('rotate(45)');
    },
    'bpmn:CompensateEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:SignalEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:MultipleEventDefinition': function(p, event, isThrowing) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ParallelMultipleEventDefinition': function(p, event) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1
      });
    },
    'bpmn:EndEvent': function(p, element) {
      var circle = renderer('bpmn:Event')(p, element, {
        strokeWidth: 4
      });

      renderEventContent(element, p, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(p, element) {
      var circle = drawCircle(p, element.width, element.height, 8, {
        strokeWidth: 4,
        fill: 'black'
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(p, element) {
      var outer = renderer('bpmn:Event')(p, element, { strokeWidth: 1 });
      /* inner */ drawCircle(p, element.width, element.height, INNER_OUTER_DIST, { strokeWidth: 1, fill: 'none' });

      renderEventContent(element, p);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(p, element, attrs) {
      return drawRect(p, element.width, element.height, TASK_BORDER_RADIUS, attrs);
    },

    'bpmn:Task': function(p, element, attrs) {
      var rect = renderer('bpmn:Activity')(p, element, attrs);
      renderEmbeddedLabel(p, element, 'center-middle');
      attachTaskMarkers(p, element);
      return rect;
    },
    'bpmn:ServiceTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

      var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      /* service bg */ drawPath(p, pathDataBG, {
        strokeWidth: 1,
        fill: 'none'
      });

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      /* service fill */ drawPath(p, fillPathData, {
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

      /* service */ drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'white'
      });

      return task;
    },
    'bpmn:UserTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

      var x = 15;
      var y = 12;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user path */ drawPath(p, pathData, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ drawPath(p, pathData2, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ drawPath(p, pathData3, {
        strokeWidth: 0.5,
        fill: 'black'
      });

      return task;
    },
    'bpmn:ManualTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      /* manual path */ drawPath(p, pathData, {
        strokeWidth: 0.25,
        fill: 'white',
        stroke: 'black'
      });

      return task;
    },
    'bpmn:SendTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

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

      /* send path */ drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black',
        stroke: 'white'
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(p, element) {
      var semantic = getSemantic(element);

      var task = renderer('bpmn:Task')(p, element);
      var pathData;

      if (semantic.instantiate) {
        drawCircle(p, 28, 28, 20 * 0.22, { strokeWidth: 1 });

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

      /* receive path */ drawPath(p, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:ScriptTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      /* script path */ drawPath(p, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:BusinessRuleTask': function(p, element) {
      var task = renderer('bpmn:Task')(p, element);

      var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessHeaderPath = drawPath(p, headerPathData);
      businessHeaderPath.attr({
        strokeWidth: 1,
        fill: 'AAA'
      });

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessPath = drawPath(p, headerData);
      businessPath.attr({
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:SubProcess': function(p, element, attrs) {

      attrs = assign({ fillOpacity: 0.95 }, attrs);

      var rect = renderer('bpmn:Activity')(p, element, attrs);

      var expanded = DiUtil.isExpanded(element);

      var isEventSubProcess = DiUtil.isEventSubProcess(element);

      if (isEventSubProcess) {
        rect.attr({
          strokeDasharray: '1,2'
        });
      }

      renderEmbeddedLabel(p, element, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        attachTaskMarkers(p, element);
      } else {
        attachTaskMarkers(p, element, ['SubProcessMarker']);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(p, element) {
      return renderer('bpmn:SubProcess')(p, element);
    },
    'bpmn:Transaction': function(p, element) {
      var outer = renderer('bpmn:SubProcess')(p, element);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ]);

      /* inner path */ drawRect(p, element.width, element.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, innerAttrs);

      return outer;
    },
    'bpmn:CallActivity': function(p, element) {
      return renderer('bpmn:SubProcess')(p, element, {
        strokeWidth: 5
      });
    },
    'bpmn:Participant': function(p, element) {

      var lane = renderer('bpmn:Lane')(p, element, {
        fillOpacity: 0.95,
        fill: 'White'
      });

      var expandedPool = DiUtil.isExpanded(element);

      if (expandedPool) {
        drawLine(p, [
          { x: 30, y: 0 },
          { x: 30, y: element.height }
        ]);
        var text = getSemantic(element).name;
        renderLaneLabel(p, text, element);
      } else {
        // Collapsed pool draw text inline
        var text2 = getSemantic(element).name;
        renderLabel(p, text2, { box: element, align: 'center-middle' });
      }

      var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

      if (participantMultiplicity) {
        renderer('ParticipantMultiplicityMarker')(p, element);
      }

      return lane;
    },
    'bpmn:Lane': function(p, element, attrs) {
      var rect = drawRect(p, element.width, element.height, 0, attrs || {
        fill: 'none'
      });

      var semantic = getSemantic(element);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        renderLaneLabel(p, text, element);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(p, element) {
      var diamond = drawDiamond(p, element.width, element.height);

      /* circle path */
      drawCircle(p, element.width, element.height, element.height * 0.24, {
        strokeWidth: 2.5,
        fill: 'none'
      });

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(p, element) {
      var diamond = drawDiamond(p, element.width, element.height);

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
        drawPath(p, pathData, {
          strokeWidth: 1,
          fill: 'black'
        });
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(p, element) {
      var diamond = drawDiamond(p, element.width, element.height);

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

      /* complex path */ drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:ParallelGateway': function(p, element) {
      var diamond = drawDiamond(p, element.width, element.height);

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

      /* parallel path */ drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(p, element) {

      var semantic = getSemantic(element);

      var diamond = drawDiamond(p, element.width, element.height);

      /* outer circle path */ drawCircle(p, element.width, element.height, element.height * 0.20, {
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

        /* event path */ drawPath(p, pathData, {
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

        var parallelPath = drawPath(p, pathData);
        parallelPath.attr({
          strokeWidth: 1,
          fill: 'none'
        });
      } else if (type === 'Exclusive') {

        if (!instantiate) {
          var innerCircle = drawCircle(p, element.width, element.height, element.height * 0.26);
          innerCircle.attr({
            strokeWidth: 1,
            fill: 'none'
          });
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(p, element) {
      return drawDiamond(p, element.width, element.height);
    },
    'bpmn:SequenceFlow': function(p, element) {
      var pathData = createPathFromConnection(element);
      var path = drawPath(p, pathData, {
        strokeLinejoin: 'round',
        markerEnd: marker('sequenceflow-end')
      });

      var sequenceFlow = getSemantic(element);
      var source = element.source.businessObject;

      // conditional flow marker
      if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
        path.attr({
          markerStart: marker('conditional-flow-marker')
        });
      }

      // default marker
      if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
          source.default === sequenceFlow) {
        path.attr({
          markerStart: marker('conditional-default-flow-marker')
        });
      }

      return path;
    },
    'bpmn:Association': function(p, element, attrs) {

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

      return drawLine(p, element.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(p, element) {
      return renderer('bpmn:Association')(p, element, {
        markerEnd: marker('association-end')
      });
    },
    'bpmn:DataOutputAssociation': function(p, element) {
      return renderer('bpmn:Association')(p, element, {
        markerEnd: marker('association-end')
      });
    },
    'bpmn:MessageFlow': function(p, element) {

      var semantic = getSemantic(element),
          di = getDi(element);

      var pathData = createPathFromConnection(element);
      var path = drawPath(p, pathData, {
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

        drawPath(p, markerPathData, messageAttrs);
      }

      return path;
    },
    'bpmn:DataObject': function(p, element) {
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

      var elementObject = drawPath(p, pathData, { fill: 'white' });

      var semantic = getSemantic(element);

      if (isCollection(semantic)) {
        renderDataItemCollection(p, element);
      }

      return elementObject;
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataInput': function(p, element) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(p, element);

      /* input arrow path */ drawPath(p, arrowPathData, { strokeWidth: 1 });

      return elementObject;
    },
    'bpmn:DataOutput': function(p, element) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(p, element);

      /* output arrow path */ drawPath(p, arrowPathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return elementObject;
    },
    'bpmn:DataStoreReference': function(p, element) {
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

      var elementStore = drawPath(p, DATA_STORE_PATH, {
        strokeWidth: 2,
        fill: 'white'
      });

      return elementStore;
    },
    'bpmn:BoundaryEvent': function(p, element) {

      var semantic = getSemantic(element),
          cancel = semantic.cancelActivity;

      var attrs = {
        strokeWidth: 1
      };

      if (!cancel) {
        attrs.strokeDasharray = '6';
        attrs.strokeLinecap = 'round';
      }

      var outer = renderer('bpmn:Event')(p, element, attrs);
      /* inner path */ drawCircle(p, element.width, element.height, INNER_OUTER_DIST, assign(attrs, { fill: 'none' }));

      renderEventContent(element, p);

      return outer;
    },
    'bpmn:Group': function(p, element) {
      return drawRect(p, element.width, element.height, TASK_BORDER_RADIUS, {
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      });
    },
    'label': function(p, element) {
      // Update external label size and bounds during rendering when
      // we have the actual rendered bounds anyway.

      var textElement = renderExternalLabel(p, element);

      var textBBox = textElement.getBBox();

      // update element.x so that the layouted text is still
      // center alligned (newX = oldMidX - newWidth / 2)
      element.x = Math.ceil(element.x + element.width / 2) - Math.ceil((textBBox.width / 2));

      // take element width, height from actual bounds
      element.width = Math.ceil(textBBox.width);
      element.height = Math.ceil(textBBox.height);

      // compensate bounding box x
      textElement.attr({
        transform: 'translate(' + (-1 * textBBox.x) + ',0)'
      });

      return textElement;
    },
    'bpmn:TextAnnotation': function(p, element) {
      var style = {
        'fill': 'none',
        'stroke': 'none'
      };
      var textElement = drawRect(p, element.width, element.height, 0, 0, style);
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
      drawPath(p, textPathData);

      var text = getSemantic(element).text || '';
      renderLabel(p, text, { box: element, align: 'left-middle', padding: 5 });

      return textElement;
    },
    'ParticipantMultiplicityMarker': function(p, element) {
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

      drawMarker('participant-multiplicity', p, markerPath);
    },
    'SubProcessMarker': function(p, element) {
      var markerRect = drawRect(p, 14, 14, 0, {
        strokeWidth: 1
      });

      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
      markerRect.transform('translate(' + (element.width / 2 - 7.5) + ',' + (element.height - 20) + ')');

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

      drawMarker('sub-process', p, markerPath);
    },
    'ParallelMarker': function(p, element, position) {
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

      drawMarker('parallel', p, markerPath);
    },
    'SequentialMarker': function(p, element, position) {
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

      drawMarker('sequential', p, markerPath);
    },
    'CompensationMarker': function(p, element, position) {
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

      drawMarker('compensation', p, markerMath, { strokeWidth: 1 });
    },
    'LoopMarker': function(p, element, position) {
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

      drawMarker('loop', p, markerPath, {
        strokeWidth: 1,
        fill: 'none',
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(p, element, position) {
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

      drawMarker('adhoc', p, markerPath, {
        strokeWidth: 1,
        fill: 'black'
      });
    }
  };

  function attachTaskMarkers(p, element, taskMarkers) {
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
      renderer(marker)(p, element, position);
    });

    if (obj.isForCompensation) {
      renderer('CompensationMarker')(p, element, position);
    }

    if (obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(p, element, position);
    }

    var loopCharacteristics = obj.loopCharacteristics,
        isSequential = loopCharacteristics && loopCharacteristics.isSequential;

    if (loopCharacteristics) {

      if (isSequential === undefined) {
        renderer('LoopMarker')(p, element, position);
      }

      if (isSequential === false) {
        renderer('ParallelMarker')(p, element, position);
      }

      if (isSequential === true) {
        renderer('SequentialMarker')(p, element, position);
      }
    }
  }

  function renderDataItemCollection(p, element) {

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

    /* collection path */ drawPath(p, pathData, {
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

BpmnRenderer.prototype.drawShape = function(visuals, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(visuals, element);
};

BpmnRenderer.prototype.drawConnection = function(visuals, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(visuals, element);
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
