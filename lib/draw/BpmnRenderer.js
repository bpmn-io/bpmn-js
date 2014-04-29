var bpmnModule = require('../di').defaultModule;
var _ = require('lodash');

require('diagram-js/lib/core/EventBus');
require('diagram-js/lib/draw/Styles');

require('../core/BpmnRegistry');
require('./PathMap');


var DefaultRenderer = require('diagram-js/lib/draw/Renderer');


var flattenPoints = DefaultRenderer.flattenPoints;

function BpmnRenderer(events, styles, bpmnRegistry, pathMap) {

  DefaultRenderer.apply(this, [ events, styles ]);

  var TASK_BORDER_RADIUS = 8;
  var INNER_OUTER_DIST = 3;

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
              markerWidth: 7,
              markerHeight: 7,
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
              markerWidth: 6,
              markerHeight: 6,
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
          markerWidth: 10,
          markerHeight: 6,
          orient: 'auto',
          overflow: 'visible'
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

    var x, y;

    x = y = offset;

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
      'stroke-width': 2,
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
        isTypedEvent(event, 'bpmn:TerminateEventDefinition') &&
        !bpmnRegistry.getSemantic(data.id).parallelMultiple) {
      return renderer('bpmn:MultipleEventDefinition')(p, data, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
        isTypedEvent(event, 'bpmn:TerminateEventDefinition') &&
        !!bpmnRegistry.getSemantic(data.id).parallelMultiple) {
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
    'bpmn:IntermediateInterruptedEvent': function(p, data) {
      var outer = renderer('bpmn:Event')(p, data);
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST);

      outer.attr('stroke-width', 1);
      outer.attr('stroke-dasharray', '12');
      inner.attr('stroke-width', 1);
      inner.attr('stroke-dasharray', '12');

      renderEventContent(data, p);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(p, data) {
      var rect = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS);
      return rect;
    },

    'bpmn:Task': as('bpmn:Activity'),
    'bpmn:ServiceTask': as('bpmn:Activity'),
    'bpmn:UserTask': as('bpmn:Activity'),
    'bpmn:ManualTask': as('bpmn:Activity'),
    'bpmn:SendTask': as('bpmn:Activity'),
    'bpmn:ReceiveTask': as('bpmn:Activity'),
    'bpmn:ScriptTask': as('bpmn:Activity'),
    'bpmn:BusinessRuleTask': as('bpmn:Activity'),
    'bpmn:SubProcess': as('bpmn:Activity'),
    'bpmn:AdHocSubProcess': as('bpmn:Activity'),
    'bpmn:Transaction': function(p, data) {
      var outer = renderer('bpmn:Activity')(p, data);
      var inner = drawRect(p, data.width, data.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST);

      outer.attr('stroke-width', 1.5);
      inner.attr('stroke-width', 1.5);

      return outer;
    },
    'bpmn:CallActivity': function(p, data) {
      var rect = renderer('bpmn:Activity')(p, data);
      rect.attr('stroke-width', 4);
      return rect;
    },

    'bpmn:Participant': as('bpmn:Lane'),
    'bpmn:Lane': function(p, data) {
      var rect = drawRect(p, data.width, data.height, 0);
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

      var outerCircle = drawCircle(p, data.width, data.height, data.height * 0.21);
      outerCircle.attr({
        'stroke-width': 1,
        'fill': 'None'
      });

      var type = bpmnRegistry.getSemantic(data.id).eventGatewayType;

      function drawEvent() {

        var pathData = pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
          xScaleFactor: 0.20,
          yScaleFactor: 0.20,
          containerWidth: data.width,
          containerHeight: data.height,
          position: {
            mx: 0.34,
            my: 0.43
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
      } else if(type === 'Exclusive') {

        drawEvent();
      } else {

        var innerCircle = drawCircle(p, data.width, data.height, data.height * 0.24);
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
        'stroke-dasharray': '2,4',
        'marker-end': marker('data-association-end')
      });
    },
    'bpmn:DataOutputAssociation': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'stroke-dasharray': '2,4',
        'marker-end': marker('data-association-end')
      });
    },
    'bpmn:MessageFlow': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'marker-end': marker('messageflow-end'),
        'marker-start': marker('messageflow-start'),
        'stroke-dasharray': '1,3'
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
      return renderer('bpmn:IntermediateInterruptedEvent')(p, data);
    },
    'label': function(p, data) {

    }
  };

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

    return _.any(event.eventDefinitions, function(definition) {
      return definition.$type === eventDefinitionType && (!filter || _.all([ definition ], filter));
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