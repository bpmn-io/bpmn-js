'use strict';

var inherits = require('inherits'),
    isObject = require('lodash/lang/isObject'),
    assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    every = require('lodash/collection/every'),
    some = require('lodash/collection/some');

var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer'),
    TextUtil = require('diagram-js/lib/util/Text'),
    DiUtil = require('../util/DiUtil');

var getBusinessObject = require('../util/ModelUtil').getBusinessObject,
    is = require('../util/ModelUtil').is;

var RenderUtil = require('diagram-js/lib/util/RenderUtil');

var componentsToPath = RenderUtil.componentsToPath,
    createLine = RenderUtil.createLine;

var domQuery = require('min-dom/lib/query');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create'),
    svgClasses = require('tiny-svg/lib/classes');

var rotate = require('diagram-js/lib/util/SvgTransformUtil').rotate,
    transform = require('diagram-js/lib/util/SvgTransformUtil').transform,
    translate = require('diagram-js/lib/util/SvgTransformUtil').translate;

var Ids = require('ids'),
    RENDERER_IDS = new Ids();

var TASK_BORDER_RADIUS = 10;
var INNER_OUTER_DIST = 3;

var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12
};


function BpmnRenderer(eventBus, styles, pathMap, canvas, priority) {

  BaseRenderer.call(this, eventBus, priority);

  this.canvas = canvas;
  this.pathMap = pathMap;

  this.rendererId = RENDERER_IDS.next();

  this.textUtil = new TextUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  });

  this.markers = {};

  this.computeStyle = styles.computeStyle;

  var self = this;

  this.handlers = {
    'bpmn:Event': function(parentGfx, element, attrs) {
      return self.drawCircle(parentGfx, element.width, element.height, attrs);
    },
    'bpmn:StartEvent': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var semantic = getSemantic(element);

      if (!semantic.isInterrupting) {
        attrs = {
          strokeDasharray: '6',
          strokeLinecap: 'round'
        };
      }

      var circle = self.renderer('bpmn:Event')(parentGfx, element, attrs);

      self.renderEventContent(element, parentGfx);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(parentGfx, element, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_MESSAGE', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.235,
          my: 0.315
        }
      });

      var fill = isThrowing ? getStrokeColor(element) : getFillColor(element);
      var stroke = isThrowing ? getFillColor(element) : getStrokeColor(element);

      var messagePath = self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(parentGfx, element) {
      var circle = self.drawCircle(parentGfx, element.width, element.height, 0.2 * element.height, {
        strokeWidth: 2,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      var pathData = self.pathMap.getScaledPath('EVENT_TIMER_WH', {
        xScaleFactor: 0.75,
        yScaleFactor: 0.75,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.5,
          my: 0.5
        }
      });

      self.drawPath(parentGfx, pathData, {
        strokeWidth: 2,
        strokeLinecap: 'square',
        stroke: getStrokeColor(element)
      });

      for (var i = 0;i < 12;i++) {

        var linePathData = self.pathMap.getScaledPath('EVENT_TIMER_LINE', {
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

        self.drawPath(parentGfx, linePathData, {
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')',
          stroke: getStrokeColor(element)
        });
      }

      return circle;
    },
    'bpmn:EscalationEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_ESCALATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event) : 'none';

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:ConditionalEventDefinition': function(parentGfx, event) {
      var pathData = self.pathMap.getScaledPath('EVENT_CONDITIONAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.222
        }
      });

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:LinkEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_LINK', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.57,
          my: 0.263
        }
      });

      var fill = isThrowing ? getStrokeColor(event) : 'none';

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:ErrorEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_ERROR', {
        xScaleFactor: 1.1,
        yScaleFactor: 1.1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.2,
          my: 0.722
        }
      });

      var fill = isThrowing ? getStrokeColor(event) : 'none';

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:CancelEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_CANCEL_45', {
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

      var path = self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });

      rotate(path, 45);

      return path;
    },
    'bpmn:CompensateEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.22,
          my: 0.5
        }
      });

      var fill = isThrowing ? getStrokeColor(event) : 'none';

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:SignalEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_SIGNAL', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event) : 'none';

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:MultipleEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = self.pathMap.getScaledPath('EVENT_MULTIPLE', {
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

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ParallelMultipleEventDefinition': function(parentGfx, event) {
      var pathData = self.pathMap.getScaledPath('EVENT_PARALLEL_MULTIPLE', {
        xScaleFactor: 1.2,
        yScaleFactor: 1.2,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.458,
          my: 0.194
        }
      });

      return self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(event),
        stroke: getStrokeColor(event)
      });
    },
    'bpmn:EndEvent': function(parentGfx, element) {
      var circle = self.renderer('bpmn:Event')(parentGfx, element, {
        strokeWidth: 4,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      self.renderEventContent(element, parentGfx, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(parentGfx, element) {
      var circle = self.drawCircle(parentGfx, element.width, element.height, 8, {
        strokeWidth: 4,
        fill: getStrokeColor(element),
        stroke: getStrokeColor(element)
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(parentGfx, element) {
      var outer = self.renderer('bpmn:Event')(parentGfx, element, {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      /* inner */ self.drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, {
        strokeWidth: 1,
        fill: getFillColor(element, 'none'),
        stroke: getStrokeColor(element)
      });

      self.renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': self.as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': self.as('bpmn:IntermediateEvent'),
    'bpmn:Activity': function(parentGfx, element, attrs) {
      return self.drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs);
    },
    'bpmn:Task': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var rect = self.renderer('bpmn:Activity')(parentGfx, element, attrs);

      self.renderEmbeddedLabel(parentGfx, element, 'center-middle');
      self.attachTaskMarkers(parentGfx, element);

      return rect;
    },
    'bpmn:ServiceTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var pathDataBG = self.pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      /* service bg */ self.drawPath(parentGfx, pathDataBG, {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      var fillPathData = self.pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      /* service fill */ self.drawPath(parentGfx, fillPathData, {
        strokeWidth: 0,
        fill: getFillColor(element)
      });

      var pathData = self.pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 17,
          y: 22
        }
      });

      /* service */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:UserTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var x = 15;
      var y = 12;

      var pathData = self.pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 0.5,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      var pathData2 = self.pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ self.drawPath(parentGfx, pathData2, {
        strokeWidth: 0.5,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      var pathData3 = self.pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ self.drawPath(parentGfx, pathData3, {
        strokeWidth: 0.5,
        fill: getStrokeColor(element),
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:ManualTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var pathData = self.pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      /* manual path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 0.5, // 0.25,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:SendTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var pathData = self.pathMap.getScaledPath('TASK_TYPE_SEND', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: 21,
        containerHeight: 14,
        position: {
          mx: 0.285,
          my: 0.357
        }
      });

      /* send path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element),
        stroke: getFillColor(element)
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(parentGfx, element) {
      var semantic = getSemantic(element);

      var task = self.renderer('bpmn:Task')(parentGfx, element);
      var pathData;

      if (semantic.instantiate) {
        self.drawCircle(parentGfx, 28, 28, 20 * 0.22, { strokeWidth: 1 });

        pathData = self.pathMap.getScaledPath('TASK_TYPE_INSTANTIATING_SEND', {
          abspos: {
            x: 7.77,
            y: 9.52
          }
        });
      } else {

        pathData = self.pathMap.getScaledPath('TASK_TYPE_SEND', {
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

      /* receive path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:ScriptTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var pathData = self.pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      /* script path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:BusinessRuleTask': function(parentGfx, element) {
      var task = self.renderer('bpmn:Task')(parentGfx, element);

      var headerPathData = self.pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessHeaderPath = self.drawPath(parentGfx, headerPathData);
      svgAttr(businessHeaderPath, {
        strokeWidth: 1,
        fill: getFillColor(element, '#aaaaaa'),
        stroke: getStrokeColor(element)
      });

      var headerData = self.pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      var businessPath = self.drawPath(parentGfx, headerData);
      svgAttr(businessPath, {
        strokeWidth: 1,
        stroke: getStrokeColor(element)
      });

      return task;
    },
    'bpmn:SubProcess': function(parentGfx, element, attrs) {
      attrs = assign({
        fillOpacity: 0.95,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      }, attrs);

      var rect = self.renderer('bpmn:Activity')(parentGfx, element, attrs);

      var expanded = DiUtil.isExpanded(element);

      var isEventSubProcess = DiUtil.isEventSubProcess(element);

      if (isEventSubProcess) {
        svgAttr(rect, {
          strokeDasharray: '1,2'
        });
      }

      self.renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        self.attachTaskMarkers(parentGfx, element);
      } else {
        self.attachTaskMarkers(parentGfx, element, ['SubProcessMarker']);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(parentGfx, element) {
      return self.renderer('bpmn:SubProcess')(parentGfx, element);
    },
    'bpmn:Transaction': function(parentGfx, element) {
      var outer = self.renderer('bpmn:SubProcess')(parentGfx, element);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
        stroke: getStrokeColor(element)
      });

      /* inner path */ self.drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, innerAttrs);

      return outer;
    },
    'bpmn:CallActivity': function(parentGfx, element) {
      return self.renderer('bpmn:SubProcess')(parentGfx, element, {
        strokeWidth: 5
      });
    },
    'bpmn:Participant': function(parentGfx, element) {

      var attrs = {
        fillOpacity: 0.95,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var lane = self.renderer('bpmn:Lane')(parentGfx, element, attrs);

      var expandedPool = DiUtil.isExpanded(element);

      if (expandedPool) {
        self.drawLine(parentGfx, [
          { x: 30, y: 0 },
          { x: 30, y: element.height }
        ], {
          stroke: getStrokeColor(element)
        });
        var text = getSemantic(element).name;
        self.renderLaneLabel(parentGfx, text, element);
      } else {
        // Collapsed pool draw text inline
        var text2 = getSemantic(element).name;
        self.renderLabel(parentGfx, text2, {
          box: element, align: 'center-middle',
          style: {
            fill: getStrokeColor(element)
          }
        });
      }

      var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

      if (participantMultiplicity) {
        self.renderer('ParticipantMultiplicityMarker')(parentGfx, element);
      }

      return lane;
    },
    'bpmn:Lane': function(parentGfx, element, attrs) {
      var rect = self.drawRect(parentGfx, element.width, element.height, 0, assign({
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      }, attrs));

      var semantic = getSemantic(element);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        self.renderLaneLabel(parentGfx, text, element);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var diamond = self.drawDiamond(parentGfx, element.width, element.height, attrs);

      /* circle path */
      self.drawCircle(parentGfx, element.width, element.height, element.height * 0.24, {
        strokeWidth: 2.5,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var diamond = self.drawDiamond(parentGfx, element.width, element.height, attrs);

      var pathData = self.pathMap.getScaledPath('GATEWAY_EXCLUSIVE', {
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
        self.drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(element),
          stroke: getStrokeColor(element)
        });
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var diamond = self.drawDiamond(parentGfx, element.width, element.height, attrs);

      var pathData = self.pathMap.getScaledPath('GATEWAY_COMPLEX', {
        xScaleFactor: 0.5,
        yScaleFactor:0.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.26
        }
      });

      /* complex path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element),
        stroke: getStrokeColor(element)
      });

      return diamond;
    },
    'bpmn:ParallelGateway': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var diamond = self.drawDiamond(parentGfx, element.width, element.height, attrs);

      var pathData = self.pathMap.getScaledPath('GATEWAY_PARALLEL', {
        xScaleFactor: 0.6,
        yScaleFactor:0.6,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.2
        }
      });

      /* parallel path */ self.drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element),
        stroke: getStrokeColor(element)
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(parentGfx, element) {

      var semantic = getSemantic(element);

      var attrs = {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      var diamond = self.drawDiamond(parentGfx, element.width, element.height, attrs);

      /* outer circle path */ self.drawCircle(parentGfx, element.width, element.height, element.height * 0.20, {
        strokeWidth: 1,
        fill: 'none',
        stroke: getStrokeColor(element)
      });

      var type = semantic.eventGatewayType;
      var instantiate = !!semantic.instantiate;

      function drawEvent() {

        var pathData = self.pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
          xScaleFactor: 0.18,
          yScaleFactor: 0.18,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.36,
            my: 0.44
          }
        });

        var attrs = {
          strokeWidth: 2,
          fill: getFillColor(element, 'none'),
          stroke: getStrokeColor(element)
        };

        /* event path */ self.drawPath(parentGfx, pathData, attrs);
      }

      if (type === 'Parallel') {

        var pathData = self.pathMap.getScaledPath('GATEWAY_PARALLEL', {
          xScaleFactor: 0.4,
          yScaleFactor:0.4,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.474,
            my: 0.296
          }
        });

        var parallelPath = self.drawPath(parentGfx, pathData);
        svgAttr(parallelPath, {
          strokeWidth: 1,
          fill: 'none'
        });
      } else if (type === 'Exclusive') {

        if (!instantiate) {
          var innerCircle = self.drawCircle(parentGfx, element.width, element.height, element.height * 0.26);
          svgAttr(innerCircle, {
            strokeWidth: 1,
            fill: 'none',
            stroke: getStrokeColor(element)
          });
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(parentGfx, element) {
      return self.drawDiamond(parentGfx, element.width, element.height);
    },
    'bpmn:SequenceFlow': function(parentGfx, element) {
      var pathData = self.createPathFromConnection(element);

      var fill = getFillColor(element),
          stroke = getStrokeColor(element);

      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: self.marker('sequenceflow-end', fill, stroke),
        stroke: getStrokeColor(element)
      };

      var path = self.drawPath(parentGfx, pathData, attrs);

      var sequenceFlow = getSemantic(element);
      var source = element.source.businessObject;

      // conditional flow marker
      if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
        svgAttr(path, {
          markerStart: self.marker('conditional-flow-marker', fill, stroke)
        });
      }

      // default marker
      if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
          source.default === sequenceFlow) {
        svgAttr(path, {
          markerStart: self.marker('conditional-default-flow-marker', fill, stroke)
        });
      }

      return path;
    },
    'bpmn:Association': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element);

      var fill = getFillColor(element),
          stroke = getStrokeColor(element);

      attrs = assign({
        strokeDasharray: '0.5, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: getStrokeColor(element)
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = self.marker('association-end', fill, stroke);
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = self.marker('association-start', fill, stroke);
      }

      return self.drawLine(parentGfx, element.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(parentGfx, element) {
      var fill = getFillColor(element),
          stroke = getStrokeColor(element);

      return self.renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: self.marker('association-end', fill, stroke)
      });
    },
    'bpmn:DataOutputAssociation': function(parentGfx, element) {
      var fill = getFillColor(element),
          stroke = getStrokeColor(element);

      return self.renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: self.marker('association-end', fill, stroke)
      });
    },
    'bpmn:MessageFlow': function(parentGfx, element) {

      var semantic = getSemantic(element),
          di = getDi(element);

      var fill = getFillColor(element),
          stroke = getStrokeColor(element);

      var pathData = self.createPathFromConnection(element);

      var attrs = {
        markerEnd: self.marker('messageflow-end', fill, stroke),
        markerStart: self.marker('messageflow-start', fill, stroke),
        strokeDasharray: '10, 12',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '1.5px',
        stroke: getStrokeColor(element)
      };

      var path = self.drawPath(parentGfx, pathData, attrs);

      if (semantic.messageRef) {
        var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

        var markerPathData = self.pathMap.getScaledPath('MESSAGE_FLOW_MARKER', {
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

        self.drawPath(parentGfx, markerPathData, messageAttrs);
      }

      return path;
    },
    'bpmn:DataObject': function(parentGfx, element) {
      var pathData = self.pathMap.getScaledPath('DATA_OBJECT_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.474,
          my: 0.296
        }
      });

      var elementObject = self.drawPath(parentGfx, pathData, {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      var semantic = getSemantic(element);

      if (isCollection(semantic)) {
        self.renderDataItemCollection(parentGfx, element);
      }

      return elementObject;
    },
    'bpmn:DataObjectReference': self.as('bpmn:DataObject'),
    'bpmn:DataInput': function(parentGfx, element) {

      var arrowPathData = self.pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = self.renderer('bpmn:DataObject')(parentGfx, element);

      /* input arrow path */ self.drawPath(parentGfx, arrowPathData, { strokeWidth: 1 });

      return elementObject;
    },
    'bpmn:DataOutput': function(parentGfx, element) {
      var arrowPathData = self.pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = self.renderer('bpmn:DataObject')(parentGfx, element);

      /* output arrow path */ self.drawPath(parentGfx, arrowPathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return elementObject;
    },
    'bpmn:DataStoreReference': function(parentGfx, element) {
      var DATA_STORE_PATH = self.pathMap.getScaledPath('DATA_STORE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0,
          my: 0.133
        }
      });

      var elementStore = self.drawPath(parentGfx, DATA_STORE_PATH, {
        strokeWidth: 2,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      return elementStore;
    },
    'bpmn:BoundaryEvent': function(parentGfx, element) {

      var semantic = getSemantic(element),
          cancel = semantic.cancelActivity;

      var attrs = {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      };

      if (!cancel) {
        attrs.strokeDasharray = '6';
        attrs.strokeLinecap = 'round';
      }

      var outer = self.renderer('bpmn:Event')(parentGfx, element, attrs);
      /* inner path */ self.drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, assign(attrs, { fill: 'none' }));

      self.renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:Group': function(parentGfx, element) {
      return self.drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      });
    },
    'label': function(parentGfx, element) {
      return self.renderExternalLabel(parentGfx, element);
    },
    'bpmn:TextAnnotation': function(parentGfx, element) {
      var style = {
        'fill': 'none',
        'stroke': 'none'
      };

      var textElement = self.drawRect(parentGfx, element.width, element.height, 0, 0, style);

      var textPathData = self.pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });
      self.drawPath(parentGfx, textPathData, {
        stroke: getStrokeColor(element)
      });

      var text = getSemantic(element).text || '';
      self.renderLabel(parentGfx, text, { box: element, align: 'left-top', padding: 5 });

      return textElement;
    },
    'ParticipantMultiplicityMarker': function(parentGfx, element) {
      var markerPath = self.pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      self.drawMarker('participant-multiplicity', parentGfx, markerPath);
    },
    'SubProcessMarker': function(parentGfx, element) {
      var markerRect = self.drawRect(parentGfx, 14, 14, 0, {
        strokeWidth: 1,
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });

      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
      translate(markerRect, element.width / 2 - 7.5, element.height - 20);

      var markerPath = self.pathMap.getScaledPath('MARKER_SUB_PROCESS', {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: (element.width / 2 - 7.5) / element.width,
          my: (element.height - 20) / element.height
        }
      });

      self.drawMarker('sub-process', parentGfx, markerPath, {
        fill: getFillColor(element),
        stroke: getStrokeColor(element)
      });
    },
    'ParallelMarker': function(parentGfx, element, position) {
      var markerPath = self.pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.parallel) / element.width),
          my: (element.height - 20) / element.height
        }
      });

      self.drawMarker('parallel', parentGfx, markerPath);
    },
    'SequentialMarker': function(parentGfx, element, position) {
      var markerPath = self.pathMap.getScaledPath('MARKER_SEQUENTIAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.seq) / element.width),
          my: (element.height - 19) / element.height
        }
      });

      self.drawMarker('sequential', parentGfx, markerPath);
    },
    'CompensationMarker': function(parentGfx, element, position) {
      var markerMath = self.pathMap.getScaledPath('MARKER_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.compensation) / element.width),
          my: (element.height - 13) / element.height
        }
      });

      self.drawMarker('compensation', parentGfx, markerMath, { strokeWidth: 1 });
    },
    'LoopMarker': function(parentGfx, element, position) {
      var markerPath = self.pathMap.getScaledPath('MARKER_LOOP', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.loop) / element.width),
          my: (element.height - 7) / element.height
        }
      });

      self.drawMarker('loop', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'none',
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(parentGfx, element, position) {
      var markerPath = self.pathMap.getScaledPath('MARKER_ADHOC', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.adhoc) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      self.drawMarker('adhoc', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'black'
      });
    }
  };
}


inherits(BpmnRenderer, BaseRenderer);

BpmnRenderer.$inject = [ 'eventBus', 'styles', 'pathMap', 'canvas' ];

module.exports = BpmnRenderer;


BpmnRenderer.prototype.addMarker = function(id, options) {
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

  var defs = domQuery('defs', this.canvas._svg);

  if (!defs) {
    defs = svgCreate('defs');

    svgAppend(this.canvas._svg, defs);
  }

  svgAppend(defs, marker);

  this.markers[id] = marker;
};

BpmnRenderer.prototype.marker = function(type, fill, stroke) {
  var id = type + '-' + fill + '-' + stroke + '-' + this.rendererId;

  if (!this.markers[id]) {
    this.createMarker(type, fill, stroke);
  }

  return 'url(#' + id +  ')';
};

BpmnRenderer.prototype.createMarker = function(type, fill, stroke) {
  var id = type + '-' + fill + '-' + stroke + '-' + this.rendererId;

  if (type === 'sequenceflow-end') {
    var sequenceflowEnd = svgCreate('path');
    svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

    this.addMarker(id, {
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

    this.addMarker(id, {
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

    this.addMarker(id, {
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

    this.addMarker(id, {
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

    this.addMarker(id, {
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

    this.addMarker(id, {
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

    this.addMarker(id, {
      element: conditionaldefaultflowMarker,
      attrs: {
        stroke: stroke
      },
      ref: { x: 0, y: 10 },
      scale: 0.5
    });
  }
};

BpmnRenderer.prototype.drawCircle = function(parentGfx, width, height, offset, attrs) {

  if (isObject(offset)) {
    attrs = offset;
    offset = 0;
  }

  offset = offset || 0;

  attrs = this.computeStyle(attrs, {
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
};

BpmnRenderer.prototype.drawRect = function(parentGfx, width, height, r, offset, attrs) {

  if (isObject(offset)) {
    attrs = offset;
    offset = 0;
  }

  offset = offset || 0;

  attrs = this.computeStyle(attrs, {
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
};

BpmnRenderer.prototype.drawDiamond = function(parentGfx, width, height, attrs) {

  var x_2 = width / 2;
  var y_2 = height / 2;

  var points = [{ x: x_2, y: 0 }, { x: width, y: y_2 }, { x: x_2, y: height }, { x: 0, y: y_2 }];

  var pointsString = points.map(function(point) {
    return point.x + ',' + point.y;
  }).join(' ');

  attrs = this.computeStyle(attrs, {
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
};

BpmnRenderer.prototype.drawLine = function(parentGfx, waypoints, attrs) {
  attrs = this.computeStyle(attrs, [ 'no-fill' ], {
    stroke: 'black',
    strokeWidth: 2,
    fill: 'none'
  });

  var line = createLine(waypoints, attrs);

  svgAppend(parentGfx, line);

  return line;
};

BpmnRenderer.prototype.drawPath = function(parentGfx, d, attrs) {

  attrs = this.computeStyle(attrs, [ 'no-fill' ], {
    strokeWidth: 2,
    stroke: 'black'
  });

  var path = svgCreate('path');
  svgAttr(path, { d: d });
  svgAttr(path, attrs);

  svgAppend(parentGfx, path);

  return path;
};

BpmnRenderer.prototype.drawMarker = function(type, parentGfx, path, attrs) {
  return this.drawPath(parentGfx, path, assign({ 'data-marker': type }, attrs));
};

BpmnRenderer.prototype.as = function(type) {
  var self = this;
  return function(parentGfx, element) {
    return self.handlers[type](parentGfx, element);
  };
};

BpmnRenderer.prototype.renderer = function(type) {
  return this.handlers[type];
};

BpmnRenderer.prototype.renderEventContent = function(element, parentGfx) {

  var event = getSemantic(element);
  var isThrowing = isThrowEvent(event);

  if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
    return this.renderer('bpmn:MessageEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
    return this.renderer('bpmn:TimerEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
    return this.renderer('bpmn:ConditionalEventDefinition')(parentGfx, element);
  }

  if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
    return this.renderer('bpmn:SignalEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
    isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: false })) {
    return this.renderer('bpmn:MultipleEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
    isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: true })) {
    return this.renderer('bpmn:ParallelMultipleEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
    return this.renderer('bpmn:EscalationEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
    return this.renderer('bpmn:LinkEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
    return this.renderer('bpmn:ErrorEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
    return this.renderer('bpmn:CancelEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
    return this.renderer('bpmn:CompensateEventDefinition')(parentGfx, element, isThrowing);
  }

  if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
    return this.renderer('bpmn:TerminateEventDefinition')(parentGfx, element, isThrowing);
  }

  return null;
};

BpmnRenderer.prototype.renderLabel = function(parentGfx, label, options) {
  var text = this.textUtil.createText(label || '', options);
  svgClasses(text).add('djs-label');
  svgAppend(parentGfx, text);

  return text;
};

BpmnRenderer.prototype.renderEmbeddedLabel = function(parentGfx, element, align) {
  var semantic = getSemantic(element);

  return this.renderLabel(parentGfx, semantic.name, {
    box: element,
    align: align,
    padding: 5,
    style: {
      fill: getStrokeColor(element)
    }
  });
};

BpmnRenderer.prototype.renderExternalLabel = function(parentGfx, element) {
  var semantic = getSemantic(element);
  var box = {
    width: 90,
    height: 30,
    x: element.width / 2 + element.x,
    y: element.height / 2 + element.y
  };

  return this.renderLabel(parentGfx, semantic.name, {
    box: box,
    fitBox: true,
    style: { fontSize: '11px' }
  });
};

BpmnRenderer.prototype.renderLaneLabel = function(parentGfx, text, element) {
  var textBox = this.renderLabel(parentGfx, text, {
    box: { height: 30, width: element.height },
    align: 'center-middle',
    style: {
      fill: getStrokeColor(element)
    }
  });

  var top = -1 * element.height;

  transform(textBox, 0, -top, 270);
};

BpmnRenderer.prototype.createPathFromConnection = function(connection) {
  var waypoints = connection.waypoints;

  var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
  for (var i = 1; i < waypoints.length; i++) {
    pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
  }
  return pathData;
};

BpmnRenderer.prototype.attachTaskMarkers = function(parentGfx, element, taskMarkers) {
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

  var self = this;
  forEach(taskMarkers, function(marker) {
    self.renderer(marker)(parentGfx, element, position);
  });

  if (obj.isForCompensation) {
    this.renderer('CompensationMarker')(parentGfx, element, position);
  }

  if (obj.$type === 'bpmn:AdHocSubProcess') {
    this.renderer('AdhocMarker')(parentGfx, element, position);
  }

  var loopCharacteristics = obj.loopCharacteristics,
      isSequential = loopCharacteristics && loopCharacteristics.isSequential;

  if (loopCharacteristics) {

    if (isSequential === undefined) {
      this.renderer('LoopMarker')(parentGfx, element, position);
    }

    if (isSequential === false) {
      this.renderer('ParallelMarker')(parentGfx, element, position);
    }

    if (isSequential === true) {
      this.renderer('SequentialMarker')(parentGfx, element, position);
    }
  }
};

BpmnRenderer.prototype.renderDataItemCollection = function(parentGfx, element) {

  var yPosition = (element.height - 16) / element.height;

  var pathData = this.pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
    xScaleFactor: 1,
    yScaleFactor: 1,
    containerWidth: element.width,
    containerHeight: element.height,
    position: {
      mx: 0.451,
      my: yPosition
    }
  });

  /* collection path */ this.drawPath(parentGfx, pathData, {
    strokeWidth: 2
  });
};


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
  var dataObject = element.dataObjectRef;

  return element.isCollection || (dataObject && dataObject.isCollection);
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

function getFillColor(element, defaultColor) {
  var bo = getBusinessObject(element);

  return bo.di.get('fill') || defaultColor || 'white';
}

function getStrokeColor(element, defaultColor) {
  var bo = getBusinessObject(element);

  return bo.di.get('stroke') || defaultColor || 'black';
}
