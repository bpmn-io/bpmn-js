var bpmnModule = require('../di').defaultModule;

var DefaultRenderer = require('diagram-js/src/draw/Renderer');

function BpmnRenderer() {

  var TASK_BORDER_RADIUS = 8;
  var INNER_OUTER_DIST = 3;

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

  this.drawShape = drawShape;
}

BpmnRenderer.prototype = new DefaultRenderer();


bpmnModule.type('renderer', [ 'snap', BpmnRenderer ]);

module.exports = BpmnRenderer;