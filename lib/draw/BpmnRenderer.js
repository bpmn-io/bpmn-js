var bpmnModule = require('../di').defaultModule;

require('diagram-js/src/core/Events');

var DefaultRenderer = require('diagram-js/src/draw/Renderer');


var flattenPoints = DefaultRenderer.flattenPoints;

function BpmnRenderer(events) {

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
          .marker(0, 0, 10, 10, 10, 5)
            .attr({
              markerUnits: 'strokeWidth',
              markerWidth: 4,
              markerHeight: 4,
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
  }

  function drawCircle(p, width, height, offset) {

    offset = offset || 0;

    var cx = width / 2,
        cy = height / 2;

    return p.circle(cx, cy, Math.round((width + height) / 4 - offset)).attr({
      'stroke': 'Black',
      'stroke-width': 2,
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

    return p.polyline(points).attr({
      'stroke-width': 2,
      'stroke': 'Black'
    });
  }

  function as(type) {
    return function(p, data) {
      return handlers[type](p, data);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  var handlers = {
    'bpmn:Event': function(p, data) {
      var circle = drawCircle(p, data.width, data.height);
      return circle;
    },
    'bpmn:StartEvent': as('bpmn:Event'),
    'bpmn:EndEvent': function(p, data) {
      var circle = renderer('bpmn:Event')(p, data);

      circle.attr({
        'stroke-width': 4
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(p, data) {
      var outer = renderer('bpmn:Event')(p, data);
      var inner = drawCircle(p, data.width, data.height, INNER_OUTER_DIST);

      outer.attr('stroke-width', 1);
      inner.attr('stroke-width', 1);

      return outer;
    },
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),

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

    'bpmn:InclusiveGateway': as('bpmn:Gateway'),
    'bpmn:ExclusiveGateway': as('bpmn:Gateway'),
    'bpmn:ComplexGateway': as('bpmn:Gateway'),
    'bpmn:ParallelGateway': as('bpmn:Gateway'),
    'bpmn:EventBasedGateway': as('bpmn:Gateway'),
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
    'bpmn:MessageFlow': function(p, data) {
      var polyline = drawLine(p, data.waypoints);

      return polyline.attr({
        'marker-end': marker('messageflow-end'),
        'marker-start': marker('messageflow-start'),
        'stroke-dasharray': '3,4'
      });
    }
  };

  function drawShape(parent, data) {

    var type = data.type;
    var h = handlers[type];

    if (!h) {
      return BpmnRenderer.prototype.drawShape(parent, data);
    } else {
      return h(parent, data);
    }
  }

  function drawConnection(parent, data) {

    var type = data.type;
    var h = handlers[type];

    if (!h) {
      return BpmnRenderer.prototype.drawConnection(parent, data);
    } else {
      return h(parent, data);
    }
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

BpmnRenderer.prototype = new DefaultRenderer();


bpmnModule.type('renderer', [ 'events', BpmnRenderer ]);

module.exports = BpmnRenderer;