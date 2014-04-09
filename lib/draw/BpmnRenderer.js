var bpmnModule = require('../di').defaultModule;

require('diagram-js/lib/core/EventBus');
require('diagram-js/lib/draw/Styles');

require('../core/BpmnRegistry');


var DefaultRenderer = require('diagram-js/lib/draw/Renderer');


var flattenPoints = DefaultRenderer.flattenPoints;

function BpmnRenderer(events, styles, bpmnRegistry) {

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

    return p.polyline(points).attr(styles.style([ 'no-fill' ], {
      'stroke-width': 2,
      'stroke': 'Black'
    }));
  }

  function drawPath(p, d) {

    var path = p.path(d).attr(styles.style([ 'no-fill' ],{
      'stroke-width': 2,
      'stroke': 'Black'
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
      var DATA_OBJECT_PATH = 'm 0 0 40 0 10 10 0 50-50 0 0-60m 40 0 0 10 10 0';

      var dataObject = drawPath(p, DATA_OBJECT_PATH);
      if(getObjectRef(data.id, 'isCollection') === true ||
         bpmnRegistry.getSemantic(data.id).isCollection === true) {

        var COLLECTION_PATH = 'M  0 0 l 0 15 l 1 0 l  0 -15 z' +
          'M  6 0 l 0 15 l 1 0 l  0 -15 z' +
          'M 12 0 l 0 15 l 1 0 l  0 -15 z';
        var collectionIcon = drawPath(p, COLLECTION_PATH);
        collectionIcon.transform('translate(17.8,42.0)');
      }

      return dataObject;
    },
    'bpmn:DataInput': function(p, data) {

      var DATA_INPUT__ARROW = 'm -1.5357,2.8074 9,0 0,-3 5,5 -5,5 0,-3 -9,0 z';

      //page
      var dataObject = renderer('bpmn:DataObjectReference')(p, data);
      //arrow
      var dataInput = drawPath(p, DATA_INPUT__ARROW);
      dataInput.attr('stroke-width', 1);
      dataInput.transform('matrix(1.00000000,0.00000000,0.00000000,1.00000000,7.00000000,7.00000000)');

      return dataObject;
    },
    'bpmn:DataOutput': function(p, data) {
      var DATA_INPUT__ARROW = 'm -1.5357,2.8074 9,0 0,-3 5,5 -5,5 0,-3 -9,0 z';

      //page
      var dataObject = renderer('bpmn:DataObjectReference')(p, data);
      //arrow
      var dataInput = drawPath(p, DATA_INPUT__ARROW);
      dataInput.attr({
        'stroke-width': 1,
        'fill': 'Black'
      });
      dataInput.transform('matrix(1.00000000,0.00000000,0.00000000,1.00000000,7.00000000,7.00000000)');

      return dataObject;
    },
    'bpmn:DataStoreReference': function(p, data) {
      var DATA_STORE_PATH = 'm 59.5253 15.2984c 0 1.9490-3.4477 6.4288-29.7791 6.4288-26.3304 ' +
                            '0-29.2715-4.5986-29.2715-6.3336m 0-4.5633c 0 1.7360 2.9411 6.3346 29.2715 6.3346 ' +
                            '26.3314 0 29.7791-4.4799 29.7791-6.4288M 0.4747 6.2670c 0 2.3062 2.9411 6.3346 ' +
                            '29.2715 6.3346 26.3314 0 29.7791-3.8390 29.7791-6.4298m 0 9.81V 10.9265M 0.4975 ' +
                            '6.1728V 10.9265M 59.5253 10.7361v 4.7536M 0.4975 10.7361v 4.7536M 29.7224 0.5507c ' +
                            '19.0607 0 29.8029 2.9931 29.8029 5.6221 0 2.6280 0 44.2549 0 47.3441 0 ' +
                            '3.0893-15.6386 6.0844-29.8944 6.0844-14.2557 0-29.1563-2.8999-29.1563-6.1805 ' +
                            '0-3.2797 0-44.8751 0-47.1538 0-2.2787 10.1880-5.7163 29.2477-5.7163z';

      //arrow
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


bpmnModule.type('renderer', [ 'eventBus', 'styles', 'bpmnRegistry', BpmnRenderer ]);

module.exports = BpmnRenderer;