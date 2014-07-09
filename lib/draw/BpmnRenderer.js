'use strict';

var _ = require('lodash');

var DefaultRenderer = require('diagram-js/lib/draw/Renderer');
var LabelUtil = require('diagram-js/lib/util/LabelUtil');

var DiUtil = require('../util/Di');

var flattenPoints = DefaultRenderer.flattenPoints;


function BpmnRenderer(events, styles, bpmnRegistry, pathMap) {

  DefaultRenderer.call(this, styles);

  var TASK_BORDER_RADIUS = 10;
  var INNER_OUTER_DIST = 3;

  var LABEL_STYLE = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px'
  };

  var labelUtil = new LabelUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  });

  var markers = {};

  function addMarker(id, element) {
    markers[id] = element;
  }

  function marker(id) {
    return markers[id];
  }

  function initMarkers(paper) {

    function createMarker(id, options) {
      var attrs = _.extend({
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
      element: paper.path('M 1 5 L 11 10 L 1 15 Z'),
      ref: { x: 11, y: 10 },
      scale: 0.5
    });

    createMarker('messageflow-start', {
      element: paper.circle(6, 6, 5),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: 6, y: 6 }
    });

    createMarker('messageflow-end', {
      element: paper.path('M 1 5 L 11 10 L 1 15 Z'),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: 11, y: 10 }
    });

    createMarker('data-association-end', {
      element: paper.path('M 1 5 L 11 10 L 1 15'),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: 11, y: 10 },
      scale: 0.5
    });

    createMarker('conditional-flow-marker', {
      element: paper.path('M 0 10 L 8 6 L 16 10 L 8 14 Z'),
      attrs: {
        fill: 'white',
        stroke: 'black'
      },
      ref: { x: -1, y: 10 },
      scale: 0.5
    });

    createMarker('conditional-default-flow-marker', {
      element: paper.path('M 1 4 L 5 16'),
      attrs: {
        stroke: 'black'
      },
      ref: { x: -5, y: 10 },
      scale: 0.5
    });
  }

  function computeStyle(custom, traits, defaultStyles) {
    if (!_.isArray(traits)) {
      defaultStyles = traits;
      traits = [];
    }

    return styles.style(traits || [], _.extend(defaultStyles, custom || {}));
  }

  function drawCircle(p, width, height, offset, attrs) {

    if (_.isObject(offset)) {
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

    if (_.isObject(offset)) {
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
    var points = flattenPoints(waypoints);

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    return p.polyline(points).attr(attrs);
  }

  function drawPath(p, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    return p.path(d).attr(attrs);
  }

  function as(type) {
    return function(p, data) {
      return handlers[type](p, data);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  function renderEventContent(data, p) {

    var event = bpmnRegistry.getSemantic(data);
    var isThrowing = isThrowEvent(event);

    if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
      return renderer('bpmn:MessageEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
      return renderer('bpmn:TimerEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
      return renderer('bpmn:ConditionalEventDefinition')(p, data);
    }

    if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
      return renderer('bpmn:SignalEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: false })) {
      return renderer('bpmn:MultipleEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: true })) {
      return renderer('bpmn:ParallelMultipleEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
      return renderer('bpmn:EscalationEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
      return renderer('bpmn:LinkEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
      return renderer('bpmn:ErrorEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
      return renderer('bpmn:CancelEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
      return renderer('bpmn:CompensateEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
      return renderer('bpmn:TerminateEventDefinition')(p, data, isThrowing);
    }

    return null;
  }

  function renderLabel(p, label, options) {
    return labelUtil.createLabel(p, label || '', options).addClass('djs-label');
  }

  function renderEmbeddedLabel(p, data, align) {
    var element = bpmnRegistry.getSemantic(data);

    return renderLabel(p, element.name, { box: data, align: align });
  }

  function renderExternalLabel(p, data, align) {
    var element = bpmnRegistry.getSemantic(data.attachedId);
    return renderLabel(p, element.name, { box: data, align: align, style: { fontSize: '11px' } });
  }

  function renderLaneLabel(p, text, data) {
    var textBox = renderLabel(p, text, {
      box: { height: 30, width: data.height },
      align: 'center-middle'
    });

    var top = -1 * data.height;
    textBox.transform(
      'rotate(270) ' +
      'translate(' + top + ',' + 0 + ')'
    );
  }

  function createPathFromWaypoints(waypoints) {
    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  var handlers = {
    'bpmn:Event': function(p, data, attrs) {
      return drawCircle(p, data.width, data.height,  attrs);
    },
    'bpmn:StartEvent': function(p, data) {
      var attrs = {};
      var semantic = getSemantic(data);

      if (!semantic.isInterrupting) {
        attrs = {
          strokeDasharray: '6',
          strokeLinecap: 'round'
        };
      }

      var circle = renderer('bpmn:Event')(p, data, attrs);

      renderEventContent(data, p);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(p, data, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_MESSAGE', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.235,
          my: 0.315
        }
      });

      var fill = isThrowing ? 'black' : 'none';
      var stroke = isThrowing ? 'white' : 'black';

      var messagePath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(p, data) {

      var circle = drawCircle(p, data.width, data.height, 0.2 * data.height, {
        strokeWidth: 2
      });

      var pathData = pathMap.getScaledPath('EVENT_TIMER_WH', {
        xScaleFactor: 0.75,
        yScaleFactor: 0.75,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.5,
          my: 0.5
        }
      });

      var path = drawPath(p, pathData, {
        strokeWidth: 2
      });

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
          my: 0.555
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
    'bpmn:LinkEventDefinition': function(p, event) {
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

      return drawPath(p, pathData, {
        strokeWidth: 1
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
          mx: 0.201,
          my: 0.472
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
    'bpmn:EndEvent': function(p, data) {
      var circle = renderer('bpmn:Event')(p, data, {
        strokeWidth: 4
      });

      renderEventContent(data, p, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(p, data) {
      var circle = drawCircle(p, data.width, data.height, 8, {
        strokeWidth: 4,
        fill: 'black'
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(p, data) {
      var outer = renderer('bpmn:Event')(p, data, { strokeWidth: 1 });
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST, { strokeWidth: 1 });

      renderEventContent(data, p);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(p, data, attrs) {
      return drawRect(p, data.width, data.height, TASK_BORDER_RADIUS, attrs);
    },

    'bpmn:Task': function(p, data) {
      var rect = renderer('bpmn:Activity')(p, data);
      renderEmbeddedLabel(p, data, 'center-middle');
      attachTaskMarkers(p, data);
      return rect;
    },
    'bpmn:ServiceTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

      var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      var servicePathBG = drawPath(p, pathDataBG, {
        strokeWidth: 1,
        fill: 'none'
      });

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      var serviceFillPath = drawPath(p, fillPathData, {
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

      var servicePath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'white'
      });

      return task;
    },
    'bpmn:UserTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

      var x = 15;
      var y = 12;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userPath = drawPath(p, pathData, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userPath2 = drawPath(p, pathData2, {
        strokeWidth: 0.5,
        fill: 'none'
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userPath3 = drawPath(p, pathData3, {
        strokeWidth: 0.5,
        fill: 'black'
      });

      return task;
    },
    'bpmn:ManualTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

      var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      var userPath = drawPath(p, pathData, {
        strokeWidth: 0.25,
        fill: 'none',
        stroke: 'black'
      });

      return task;
    },
    'bpmn:SendTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

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

      var sendPath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black',
        stroke: 'white'
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(p, data) {
      var semantic = getSemantic(data);

      var task = renderer('bpmn:Task')(p, data);
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

      var sendPath = drawPath(p, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:ScriptTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      var scriptPath = drawPath(p, pathData, {
        strokeWidth: 1
      });

      return task;
    },
    'bpmn:BusinessRuleTask': function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

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
    'bpmn:SubProcess': function(p, data, attrs) {
      var rect = renderer('bpmn:Activity')(p, data, attrs);

      var semantic = getSemantic(data),
          di = getDi(data);

      var expanded = DiUtil.isExpanded(semantic, di);

      var isEventSubProcess = !!(getSemantic(data).triggeredByEvent);
      if (isEventSubProcess) {
        rect.attr({
          strokeDasharray: '1,2'
        });
      }

      renderEmbeddedLabel(p, data, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        attachTaskMarkers(p, data);
      } else {
        attachTaskMarkers(p, data, ['SubProcessMarker']);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(p, data) {
      return renderer('bpmn:SubProcess')(p, data);
    },
    'bpmn:Transaction': function(p, data) {
      var outer = renderer('bpmn:SubProcess')(p, data);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ]);
      var inner = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, innerAttrs);

      return outer;
    },
    'bpmn:CallActivity': function(p, data) {
      return renderer('bpmn:SubProcess')(p, data, {
        strokeWidth: 5
      });
    },
    'bpmn:Participant': function(p, data) {

      var lane = renderer('bpmn:Lane')(p, data);

      var expandedPool = DiUtil.isExpandedPool(getSemantic(data));

      if (expandedPool) {
        drawLine(p, [
          {x: 30, y: 0},
          {x: 30, y: data.height}
        ]);
        var text = getSemantic(data).name;
        renderLaneLabel(p, text, data);
      } else {
        // Collapsed pool draw text inline
        var text2 = getSemantic(data).name;
        renderLabel(p, text2, { box: data, align: 'center-middle' });
      }

      var participantMultiplicity = !!(getSemantic(data).participantMultiplicity);

      if(participantMultiplicity) {
        renderer('ParticipantMultiplicityMarker')(p, data);
      }

      return lane;
    },
    'bpmn:Lane': function(p, data) {
      var rect = drawRect(p, data.width, data.height, 0, {
        fill: 'none'
      });

      var semantic = getSemantic(data);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        renderLaneLabel(p, text, data);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var circle = drawCircle(p, data.width, data.height, data.height * 0.24, {
        strokeWidth: 2.5,
        fill: 'none'
      });

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var pathData = pathMap.getScaledPath('GATEWAY_EXCLUSIVE', {
        xScaleFactor: 0.4,
        yScaleFactor: 0.4,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.32,
          my: 0.3
        }
      });

      if (!!(getDi(data).isMarkerVisible)) {
        drawPath(p, pathData, {
          strokeWidth: 1,
          fill: 'black'
        });
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var pathData = pathMap.getScaledPath('GATEWAY_COMPLEX', {
        xScaleFactor: 0.5,
        yScaleFactor:0.5,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.46,
          my: 0.26
        }
      });

      var complexPath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:ParallelGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
        xScaleFactor: 0.6,
        yScaleFactor:0.6,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.46,
          my: 0.2
        }
      });

      var parallelPath = drawPath(p, pathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(p, data) {

      var semantic = getSemantic(data);

      var diamond = drawDiamond(p, data.width, data.height);

      var outerCircle = drawCircle(p, data.width, data.height, data.height * 0.20, {
        strokeWidth: 1,
        fill: 'none'
      });

      var type = semantic.eventGatewayType;
      var instantiate = !!semantic.instantiate;

      function drawEvent() {

        var pathData = pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
          xScaleFactor: 0.18,
          yScaleFactor: 0.18,
          containerWidth: data.width,
          containerHeight: data.height,
          position: {
            mx: 0.36,
            my: 0.44
          }
        });

        var eventPath = drawPath(p, pathData, {
          strokeWidth: 2,
          fill: 'none'
        });
      }

      if (type === 'Parallel') {

        var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
          xScaleFactor: 0.4,
          yScaleFactor:0.4,
          containerWidth: data.width,
          containerHeight: data.height,
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
          var innerCircle = drawCircle(p, data.width, data.height, data.height * 0.26);
          innerCircle.attr({
            strokeWidth: 1,
            fill: 'none'
          });
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(p, data) {
      return drawDiamond(p, data.width, data.height);
    },
    'bpmn:SequenceFlow': function(p, data) {
      var pathData = createPathFromWaypoints(data.waypoints);
      var path = drawPath(p, pathData, {
        markerEnd: marker('sequenceflow-end')
      });

      var sequenceFlow = bpmnRegistry.getSemantic(data.id);
      var source = sequenceFlow.sourceRef;

      // conditional flow marker
      if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Task')) {
        path.attr({
          markerStart: marker('conditional-flow-marker')
        });
      }

      // default marker
      if (source.default && source.$instanceOf('bpmn:Gateway') && source.default === sequenceFlow) {
        path.attr({
          markerStart: marker('conditional-default-flow-marker')
        });
      }

      return path;
    },
    'bpmn:Association': function(p, data, attrs) {

      attrs = _.extend({
        strokeDasharray: '1,6',
        strokeLinecap: 'round'
      }, attrs || {});

      // TODO(nre): style according to directed state
      return drawLine(p, data.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(p, data) {
      return renderer('bpmn:Association')(p, data, {
        markerEnd: marker('data-association-end')
      });
    },
    'bpmn:DataOutputAssociation': function(p, data) {
      return renderer('bpmn:Association')(p, data, {
        markerEnd: marker('data-association-end')
      });
    },
    'bpmn:MessageFlow': function(p, data) {

      var di = getDi(data);

      var pathData = createPathFromWaypoints(data.waypoints);
      var path = drawPath(p, pathData, {
        markerEnd: marker('messageflow-end'),
        markerStart: marker('messageflow-start'),
        strokeDasharray: '10',
        strokeLinecap: 'round',
        strokeWidth: 1
      });

      if (!!di.messageVisibleKind) {
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
    'bpmn:DataObject': function(p, data) {
      var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.474,
          my: 0.296
        }
      });

      var dataObject = drawPath(p, pathData, { fill: 'white' });

      var semantic = getSemantic(data);

      if (isCollection(semantic)) {
        renderDataItemCollection(p, data);
      }

      return dataObject;
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataInput': function(p, data) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var dataObject = renderer('bpmn:DataObject')(p, data);

      // arrow
      var dataInput = drawPath(p, arrowPathData, { strokeWidth: 1 });

      return dataObject;
    },
    'bpmn:DataOutput': function(p, data) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var dataObject = renderer('bpmn:DataObject')(p, data);

      // arrow
      var dataInput = drawPath(p, arrowPathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return dataObject;
    },
    'bpmn:DataStoreReference': function(p, data) {
      var DATA_STORE_PATH = pathMap.getScaledPath('DATA_STORE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0,
          my: 0.133
        }
      });

      var dataStore = drawPath(p, DATA_STORE_PATH, {
        strokeWidth: 2,
        fill: 'white'
      });

      return dataStore;
    },
    'bpmn:BoundaryEvent': function(p, data) {

      var semantic = getSemantic(data),
          cancel = semantic.cancelActivity;

      var attrs = {
        strokeLinecap: 'round',
        strokeWidth: 1
      };

      if (!cancel) {
        attrs.strokeDasharray = '6';
      }

      var outer = renderer('bpmn:Event')(p, data, attrs);
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST, attrs);

      renderEventContent(data, p);

      return outer;
    },
    'bpmn:Group': function(p, data) {
      return drawRect(p, data.width, data.height, TASK_BORDER_RADIUS, {
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      });
    },
    'label': function(p, data) {
      return renderExternalLabel(p, data, '');
    },
    'bpmn:TextAnnotation': function(p, data) {
      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });
      drawPath(p, textPathData);

      var text = getSemantic(data).text || '';
      var label = renderLabel(p, text, { box: data, align: 'left-middle' });

      return label;
    },
    'ParticipantMultiplicityMarker': function(p, data) {
      var subProcessPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2) / data.width),
          my: (data.height - 15) / data.height
        }
      });

      drawPath(p, subProcessPath);
    },
    'SubProcessMarker': function(p, data) {
      var markerRect = drawRect(p, 14, 14, 0, {
        strokeWidth: 1
      });

      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
      markerRect.transform('translate(' + (data.width / 2 - 7.5) + ',' + (data.height - 20) + ')');

      var subProcessPath = pathMap.getScaledPath('MARKER_SUB_PROCESS', {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: (data.width / 2 - 7.5) / data.width,
          my: (data.height - 20) / data.height
        }
      });

      drawPath(p, subProcessPath);
    },
    'ParallelMarker': function(p, data, position) {
      var subProcessPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2 + position.parallel) / data.width),
          my: (data.height - 20) / data.height
        }
      });
      drawPath(p, subProcessPath);
    },
    'SequentialMarker': function(p, data, position) {
      var sequentialPath = pathMap.getScaledPath('MARKER_SEQUENTIAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2 + position.seq) / data.width),
          my: (data.height - 19) / data.height
        }
      });
      drawPath(p, sequentialPath);
    },
    'CompensationMarker': function(p, data, position) {
      var compensationPath = pathMap.getScaledPath('MARKER_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2 + position.compensation) / data.width),
          my: (data.height - 13) / data.height
        }
      });
      drawPath(p, compensationPath, { strokeWidth: 1 });
    },
    'LoopMarker': function(p, data, position) {
      var loopPath = pathMap.getScaledPath('MARKER_LOOP', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2 + position.loop) / data.width),
          my: (data.height - 7) / data.height
        }
      });

      drawPath(p, loopPath, {
        strokeWidth: 1,
        fill: 'none',
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(p, data, position) {
      var loopPath = pathMap.getScaledPath('MARKER_ADHOC', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: data.width,
        containerHeight: data.height,
        position: {
          mx: ((data.width / 2 + position.adhoc) / data.width),
          my: (data.height - 15) / data.height
        }
      });

      drawPath(p, loopPath, {
        strokeWidth: 1,
        fill: 'black'
      });
    }
  };

  function attachTaskMarkers(p, data, taskMarkers) {
    var obj = getSemantic(data);

    var subprocess = _.contains(taskMarkers, 'SubProcessMarker');
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

    _.forEach(taskMarkers, function(marker) {
      renderer(marker)(p, data, position);
    });

    if (obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(p, data, position);
    }
    if (obj.loopCharacteristics && obj.loopCharacteristics.isSequential === undefined) {
      renderer('LoopMarker')(p, data, position);
      return;
    }
    if (obj.loopCharacteristics &&
      obj.loopCharacteristics.isSequential !== undefined &&
      !obj.loopCharacteristics.isSequential) {
      renderer('ParallelMarker')(p, data, position);
    }
    if (obj.loopCharacteristics && !!obj.loopCharacteristics.isSequential) {
      renderer('SequentialMarker')(p, data, position);
    }
    if (!!obj.isForCompensation) {
      renderer('CompensationMarker')(p, data, position);
    }
  }

  function drawShape(parent, data) {
    var type = data.type;
    var h = handlers[type];

    /* jshint -W040 */
    if (!h) {
      return DefaultRenderer.prototype.drawShape.apply(this, [ parent, data ]);
    } else {
      return h(parent, data);
    }
  }

  function drawConnection(parent, data) {
    var type = data.type;
    var h = handlers[type];

    /* jshint -W040 */
    if (!h) {
      return DefaultRenderer.prototype.drawConnection.apply(this, [ parent, data ]);
    } else {
      return h(parent, data);
    }
  }

  function renderDataItemCollection(p, data) {

    var yPosition = (data.height - 16) / data.height;

    var pathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
      xScaleFactor: 1,
      yScaleFactor: 1,
      containerWidth: data.width,
      containerHeight: data.height,
      position: {
        mx: 0.451,
        my: yPosition
      }
    });

    var collectionPath = drawPath(p, pathData, {
      strokeWidth: 2
    });
  }

  function isCollection(element, filter) {
    return element.isCollection ||
           (element.dataObjectRef && element.dataObjectRef.isCollection);
  }

  function getDi(element) {
    return bpmnRegistry.getDi(_.isString(element) ? element : element.id);
  }

  function getSemantic(element) {
    return bpmnRegistry.getSemantic(_.isString(element) ? element : element.id);
  }

  /**
   * Checks if eventDefinition of the given element matches with semantic type.
   *
   * @return {boolean} true if element is of the given semantic type
   */
  function isTypedEvent(event, eventDefinitionType, filter) {

    function matches(definition, filter) {
      return _.all(filter, function(val, key) {

        // we want a == conversion here, to be able to catch
        // undefined == false and friends
        /* jshint -W116 */
        return definition[key] == val;
      });
    }

    return _.any(event.eventDefinitions, function(definition) {
      return definition.$type === eventDefinitionType && matches(event, filter);
    });
  }

  function isThrowEvent(event) {
    return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
  }

  // hook onto canvas init event to initialize
  // connection start/end markers on paper
  events.on('canvas.init', function(event) {
    var paper = event.paper;

    initMarkers(paper);
  });

  this.drawShape = drawShape;
  this.drawConnection = drawConnection;
}

BpmnRenderer.prototype = Object.create(DefaultRenderer.prototype);


BpmnRenderer.$inject = [ 'eventBus', 'styles', 'bpmnRegistry', 'pathMap' ];

module.exports = BpmnRenderer;