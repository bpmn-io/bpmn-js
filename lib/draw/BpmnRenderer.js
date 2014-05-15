var bpmnModule = require('../di').defaultModule;
var _ = require('lodash');

require('diagram-js/lib/core/EventBus');
require('diagram-js/lib/draw/Styles');

require('../core/BpmnRegistry');
require('./PathMap');


var DefaultRenderer = require('diagram-js/lib/draw/Renderer');
var LabelUtil = require('diagram-js/lib/util/LabelUtil');


var flattenPoints = DefaultRenderer.flattenPoints;

function BpmnRenderer(events, styles, bpmnRegistry, pathMap) {

  DefaultRenderer.apply(this, [ events, styles ]);

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

    addMarker('sequenceflow-end',
      paper
        .path('M 0 0 L 10 5 L 0 10 Z')
          .attr({
            'fill': 'black',
            'stroke': 'none'
          })
          .marker(0, 0, 10, 10, 10, 5)
            .attr({
              markerUnits: 'strokeWidth',
              markerWidth: 10,
              markerHeight: 6,
              orient: 'auto',
              overflow: 'visible'
            }));

    addMarker('messageflow-start',
      paper
        .circle(4, 4, 4)
          .attr({
            fill: 'white',
            stroke: 'black',
            'stroke-width': 1,
            'stroke-dasharray': '1,0'
          })
          .marker(0, 0, 10, 10, 4, 4)
            .attr({
              markerUnits: 'strokeWidth',
              markerWidth: 14,
              markerHeight: 14,
              orient: 'auto',
              overflow: 'visible'
            }));

    addMarker('messageflow-end',
      paper
        .path('M 0 0 L 10 5 L 0 10 Z')
          .attr({
            stroke: 'black',
            fill: 'white',
            'stroke-width': 1,
            'stroke-linecap': 'round',
            'stroke-dasharray': '1,0'
          })
          .marker(0, 0, 10, 10, 11, 5)
            .attr({
              markerUnits: 'strokeWidth',
              markerWidth: 12,
              markerHeight: 12,
              orient: 'auto',
              overflow: 'visible'
            }));

    addMarker('directed-association-end',
      paper
        .path('M 0 0 L 10 5 L 0 10 Z')
          .attr('class', 'djs-connection-marker')
          .marker(0, 0, 10, 10, 10, 5)
            .attr({
              stroke: 'black',
              fill: 'none',
              'stroke-width': 1.5,
              'stroke-linecap': 'round',
              'stroke-dasharray': '1,0'
            }));
    addMarker('data-association-end',
      paper
        .path('M 0 0 L 10 5 L 0 10')
        .attr({
          'fill': 'white',
          'stroke': 'Black'
        })
        .marker(0, 0, 10, 10, 10, 5)
        .attr({
          markerUnits: 'strokeWidth',
          markerWidth: 16,
          markerHeight: 9.6,
          orient: 'auto',
          overflow: 'visible',
          'stroke-width': 1,
          'stroke-dasharray': '1,0'
        }));
  }

  function drawCircle(p, width, height, offset) {

    offset = offset || 0;

    var cx = width / 2,
        cy = height / 2;

    return p.circle(cx, cy, Math.round((width + height) / 4 - offset)).attr({
      'stroke': 'Black',
      'stroke-width': 1,
      'fill': 'White'
    });
  }

  function drawRect(p, width, height, r, offset) {
    offset = offset || 0;

    return p.rect(offset, offset, width - offset * 2, height - offset * 2, r).attr({
      'stroke': 'Black',
      'stroke-width': 2,
      'fill': 'White'
    });
  }

  function drawDiamond(p, width, height) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [x_2, 0, width, y_2, x_2, height, 0, y_2 ];

    return p.polygon(points).attr({
      'stroke': 'Black',
      'stroke-width': 2,
      'fill': 'White'
    });
  }

  function drawLine(p, waypoints) {
    var points = flattenPoints(waypoints);

    return p.polyline(points).attr(styles.style([ 'no-fill' ], {
      'stroke-width': 2,
      'stroke': 'Black'
    }));
  }

  function drawPath(p, d, fill) {

    var fillColor = fill ? 'Black' : 'None';

    var path = p.path(d).attr(styles.style([ 'no-fill' ],{
      'stroke-width': 1,
      'stroke': 'Black',
      'fill': fillColor
    }));

    return path;
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

    var path;

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

    var bbox = textBox.getBBox();
    var top = -1 * data.height;
    textBox.transform(
        'rotate(270) ' +
        'translate(' + top + ',' + 0 + ')'
    );
  }

  var handlers = {
    'bpmn:Event': function(p, data) {
      var circle = drawCircle(p, data.width, data.height);
      return circle;
    },
    'bpmn:StartEvent': function(p, data) {
      var circle = renderer('bpmn:Event')(p, data);

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

      var fill = isThrowing ? 'Black' : 'None';
      var stroke = isThrowing ? 'White' : 'Black';

      var messagePath = drawPath(p, pathData);
      messagePath.attr({
        'stroke-width': 1,
        'fill': fill,
        'stroke': stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(p, data) {

      var circle = drawCircle(p, data.width, data.height, 0.2 * data.height);
      circle.attr({
        'stroke-width': 2
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

      var timerPathWh = drawPath(p, pathData);
      timerPathWh.attr({
        'stroke-width': 2
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

      var fill = isThrowing ? 'Black' : 'None';

      var escalationPath = drawPath(p, pathData);
      escalationPath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      return escalationPath;
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

      var conditionalPath = drawPath(p, pathData);
      conditionalPath.attr({
        'stroke-width': 1
      });

      return conditionalPath;
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

      var linkPath = drawPath(p, pathData);
      linkPath.attr({
        'stroke-width': 1
      });

      return linkPath;
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

      var fill = isThrowing ? 'Black' : 'None';

      var errorPath = drawPath(p, pathData);
      errorPath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      return errorPath;
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

      var fill = isThrowing ? 'Black' : 'None';

      var cancelPath = drawPath(p, pathData);
      cancelPath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      cancelPath.transform('rotate(45)');

      return cancelPath;
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

      var fill = isThrowing ? 'Black' : 'None';

      var compensationPath = drawPath(p, pathData);
      compensationPath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      return compensationPath;
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

      var fill = isThrowing ? 'Black' : 'None';

      var signalPath = drawPath(p, pathData);
      signalPath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      return signalPath;
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

      var fill = isThrowing ? 'Black' : 'None';

      var multiplePath = drawPath(p, pathData);
      multiplePath.attr({
        'stroke-width': 1,
        'fill': fill
      });

      return multiplePath;
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

      var multiplePath = drawPath(p, pathData);

      multiplePath.attr({
        'stroke-width': 1
      });

      return multiplePath;
    },
    'bpmn:EndEvent': function(p, data) {
      var circle = renderer('bpmn:Event')(p, data);

      circle.attr({
        'stroke-width': 4
      });

      renderEventContent(data, p, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(p, data) {
      var circle = drawCircle(p, data.width, data.height, 7);

      circle.attr({
        'stroke-width': 4,
        'fill': 'Black'
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(p, data) {
      var outer = renderer('bpmn:Event')(p, data);
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST);

      outer.attr('stroke-width', 1);
      inner.attr('stroke-width', 1);

      renderEventContent(data, p);

      return outer;
    },
    'bpmn:IntermediateNonInterruptingEvent': function(p, data) {
      var outer = renderer('bpmn:Event')(p, data);
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST);

      outer.attr('stroke-width', 1);
      outer.attr('stroke-dasharray', '4');
      inner.attr('stroke-width', 1);
      inner.attr('stroke-dasharray', '5');

      renderEventContent(data, p);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(p, data) {
      var rect = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS);

      return rect;
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

      var servicePathBG = drawPath(p, pathDataBG);
      servicePathBG.attr({
        'stroke-width': 1,
        'fill': 'None'
      });

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      var serviceFillPath = drawPath(p, fillPathData);
      serviceFillPath.attr({
        'stroke-width': 0,
        'stroke': 'none',
        'fill': 'White'
      });

      var pathData = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 17,
          y: 22
        }
      });

      var servicePath = drawPath(p, pathData);
      servicePath.attr({
        'stroke-width': 1,
        'fill': 'White'
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

      var userPath = drawPath(p, pathData);
      userPath.attr({
        'stroke-width': 0.5,
        'fill': 'None'
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userPath2 = drawPath(p, pathData2);
      userPath2.attr({
        'stroke-width': 0.5,
        'fill': 'None'
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      var userPath3 = drawPath(p, pathData3);
      userPath3.attr({
        'stroke-width': 0.5,
        'fill': 'Black'
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

      var userPath = drawPath(p, pathData);
      userPath.attr({
        'stroke-width': 0.25,
        'fill': 'None',
        'stroke': 'Black'
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

      var sendPath = drawPath(p, pathData);
      sendPath.attr({
        'stroke-width': 1,
        'fill': 'Black',
        'stroke': 'White'
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(p, data) {
      var task = renderer('bpmn:Task')(p, data);

      var pathData;
      if(!!bpmnRegistry.getSemantic(data.id).instantiate) {
        drawCircle(p, 28, 28, 20 * 0.22);

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

      var sendPath = drawPath(p, pathData);
      sendPath.attr({
        'stroke-width': 1
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

      var scriptPath = drawPath(p, pathData);
      scriptPath.attr({
        'stroke-width': 1
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
        'stroke-width': 1,
        'fill': 'AAA'
      });

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessPath = drawPath(p, headerData);
      businessPath.attr({
        'stroke-width': 1
      });
      
      return task;
    },
    'bpmn:SubProcess': function(p, data) {
      var rect = renderer('bpmn:Activity')(p, data);

      var isEventSubProcess = !!(bpmnRegistry.getSemantic(data.id).triggeredByEvent);
      if(isEventSubProcess) {
        rect.attr({
          'stroke-dasharray': '1,2',
          'stroke-width': 1
        });
      }

      var di = bpmnRegistry.getDi(data);

      renderEmbeddedLabel(p, data, di.isExpanded ? 'center-top' : 'center-middle');

      if(di.isExpanded) {
        attachTaskMarkers(p, data);
      } else {
        attachTaskMarkers(p, data, ['SubProcessMarker']);
      }
      
      return rect;
    },
    'bpmn:AdHocSubProcess': function(p, data) {
      var process = renderer('bpmn:SubProcess')(p, data);

      return process;
    },
    'bpmn:Transaction': function(p, data) {
      var outer = renderer('bpmn:SubProcess')(p, data);
      var inner = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST)
                    .attr(styles.style([ 'no-fill', 'no-events' ]));

      outer.attr('stroke-width', 1);
      inner.attr('stroke-width', 1);

      return outer;
    },
    'bpmn:CallActivity': function(p, data) {
      var rect = renderer('bpmn:SubProcess')(p, data);
      rect.attr('stroke-width', 4);
      return rect;
    },

    'bpmn:Participant': function(p, data) {

      var lane = renderer('bpmn:Lane')(p, data);

      var expandedPool = !!(bpmnRegistry.getSemantic(data.id).processRef);

      if (expandedPool) {
        drawLine(p, [
          {x: 30, y: 0},
          {x: 30, y: data.height}
        ]);
        var text = bpmnRegistry.getSemantic(data.id).name;
        renderLaneLabel(p, text, data);
      } else {
        // Collapsed pool draw text inline
        var text2 = bpmnRegistry.getSemantic(data.id).name;
        renderLabel(p, text2, { box: data, align: 'center-middle' });
      }

      return lane;
    },
    'bpmn:Lane': function(p, data) {
      var rect = drawRect(p, data.width, data.height, 0);

      if(bpmnRegistry.getSemantic(data.id).$type === 'bpmn:Lane') {
        var text = bpmnRegistry.getSemantic(data.id).name;
        renderLaneLabel(p, text, data);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var circle = drawCircle(p, data.width, data.height, data.height * 0.24);
      circle.attr({
        'stroke-width': 2.5,
        'fill': 'None'
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

      var exclusivePath = drawPath(p, pathData);
      exclusivePath.attr({
        'stroke-width': 1,
        'fill': 'Black'
      });

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

      var complexPath = drawPath(p, pathData);
      complexPath.attr({
        'stroke-width': 1,
        'fill': 'Black'
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

      var parallelPath = drawPath(p, pathData);
      parallelPath.attr({
        'stroke-width': 1,
        'fill': 'Black'
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(p, data) {
      var diamond = drawDiamond(p, data.width, data.height);

      var outerCircle = drawCircle(p, data.width, data.height, data.height * 0.20);
      outerCircle.attr({
        'stroke-width': 1,
        'fill': 'None'
      });

      var type = bpmnRegistry.getSemantic(data.id).eventGatewayType;
      var instantiate = !!bpmnRegistry.getSemantic(data.id).instantiate;

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

        var eventPath = drawPath(p, pathData);
        eventPath.attr({
          'stroke-width': 2,
          'fill': 'None'
        });
      }

      if(type === 'Parallel') {

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
          'stroke-width': 1,
          'fill': 'None'
        });
      } else if((type === 'Exclusive') && instantiate) {

        drawEvent();
      } else if((type === 'Exclusive') && !instantiate) {

        var innerCircle = drawCircle(p, data.width, data.height, data.height * 0.26);
        innerCircle.attr({
          'stroke-width': 1,
          'fill': 'None'
        });
        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(p, data) {

      var diamond = drawDiamond(p, data.width, data.height);

      return diamond;
    },
    'bpmn:SequenceFlow': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'marker-end': marker('sequenceflow-end')
      });
    },
    'bpmn:Association': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      // TODO(nre): style according to directed state
      return polyline.attr({
        'stroke-dasharray': '3,3'
      });
    },
    'bpmn:DataInputAssociation': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'stroke-dasharray': '1,4',
        'stroke-width': '1',
        'marker-end': marker('data-association-end')
      });
    },
    'bpmn:DataOutputAssociation': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'stroke-dasharray': '1,4',
        'stroke-width': '1',
        'marker-end': marker('data-association-end')
      });
    },
    'bpmn:MessageFlow': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'marker-end': marker('messageflow-end'),
        'marker-start': marker('messageflow-start'),
        'stroke-dasharray': '3',
        'stroke-width' : 1
      });
    },
    'bpmn:DataObjectReference': function(p, data) {
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

      var dataObject = drawPath(p, pathData);
      if(getObjectRef(data.id, 'isCollection') === true ||
         bpmnRegistry.getSemantic(data.id).isCollection === true) {

        var yPosition = (data.height - 16) / data.height;

        var collectionPathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: data.width,
          containerHeight: data.height,
          position: {
            mx: 0.451,
            my: yPosition
          }
        });
        var collectionPath = drawPath(p, collectionPathData);
        collectionPath.attr({
          'stroke-width': 2
        });
      }

      return dataObject;
    },
    'bpmn:DataInput': function(p, data) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      //page
      var dataObject = renderer('bpmn:DataObjectReference')(p, data);
      //arrow
      var dataInput = drawPath(p, arrowPathData);
      dataInput.attr('stroke-width', 1);

      return dataObject;
    },
    'bpmn:DataOutput': function(p, data) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      //page
      var dataObject = renderer('bpmn:DataObjectReference')(p, data);
      //arrow
      var dataInput = drawPath(p, arrowPathData);
      dataInput.attr({
        'stroke-width': 1,
        'fill': 'Black'
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

      var dataStore = drawPath(p, DATA_STORE_PATH);
      dataStore.attr({
        'stroke-width': 1,
        'fill': 'Black',
        'stroke-miterlimit': 4,
        'stroke-linejoin': 'miter',
        'stroke-linecap': 'butt',
        'stroke-opacity': 1,
        'stroke': 'rgb(34, 34, 34)',
        'stroke-dasharray': 'none',
        'fill-opacity': 0
      });

      return dataStore;
    },
    'bpmn:BoundaryEvent': function(p, data) {
      return renderer('bpmn:IntermediateNonInterruptingEvent')(p, data);
    },
    'bpmn:Group': function(p, data) {
      var group = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS);
      group.attr({
        'stroke-width': 1,
        'stroke-dasharray': '8,3,1,3',
        'fill': 'None',
        'pointer-events': 'none'
      });

      return group;
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

      var text = bpmnRegistry.getSemantic(data.id).text || '';
      var label = renderLabel(p, text, { box: data, align: 'left-middle' });

      return label;
    },
    'SubProcessMarker': function(p, data) {
      var markerRect = drawRect(p, 14, 14, 0);
      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
      markerRect.transform('translate(' + (data.width / 2 - 7.5) + ',' + (data.height - 20) + ')');
      markerRect.attr({
        'stroke-width': 1
      });

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
      drawPath(p, compensationPath);
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
      var marker = drawPath(p, loopPath);
      marker.attr({
        'stroke-width': 1,
        'fill': 'None',
        'stroke-linecap':'round',
        'stroke-miterlimit':0.5
      });
    },
    'AdhocMarker': function(p, data, position) {
      console.log(data);
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
      var marker = drawPath(p, loopPath);
      marker.attr({
        'stroke-width': 1,
        'fill': 'Black'
      });
    }
  };

  function attachTaskMarkers(p, data, taskMarkers) {
    var obj = bpmnRegistry.getSemantic(data.id);

    var subprocess = _.contains(taskMarkers, 'SubProcessMarker');
    var position;

    if(subprocess) {
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

    if(obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(p, data, position);
    }
    if(obj.loopCharacteristics && obj.loopCharacteristics.isSequential === undefined) {
      renderer('LoopMarker')(p, data, position);
      return;
    }
    if(obj.loopCharacteristics &&
      obj.loopCharacteristics.isSequential !== undefined &&
      !obj.loopCharacteristics.isSequential) {
      renderer('ParallelMarker')(p, data, position);
    }
    if(obj.loopCharacteristics && !!obj.loopCharacteristics.isSequential) {
      renderer('SequentialMarker')(p, data, position);
    }
    if(!!obj.isForCompensation) {
      renderer('CompensationMarker')(p, data, position);
    }
  }

  function drawShape(parent, data) {
    var type = data.type;
    var h = handlers[type];

    if (!h) {
      return DefaultRenderer.prototype.drawShape.apply(this, [ parent, data ]);
    } else {
      return h(parent, data);
    }
  }

  function drawConnection(parent, data) {
    var type = data.type;
    var h = handlers[type];

    if (!h) {
      return DefaultRenderer.prototype.drawConnection.apply(this, [ parent, data ]);
    } else {
      return h(parent, data);
    }
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
      return definition.$type === eventDefinitionType && matches(definition, filter);
    });
  }

  function isThrowEvent(event) {
    return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
  }

  /**
   *
   * @return {Object} returns a specified objectRef
   */
  function getObjectRef(id, refName) {
    var semantic = bpmnRegistry.getSemantic(id);

    if(!semantic || !semantic.dataObjectRef) {
      return false;
    }

    return semantic.dataObjectRef[refName];
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


bpmnModule.type('renderer', [ 'eventBus', 'styles', 'bpmnRegistry', 'pathMap', BpmnRenderer ]);

module.exports = BpmnRenderer;