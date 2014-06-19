'use strict';


var _ = require('lodash');

var GraphicsUtil = require('../../util/GraphicsUtil');


/**
 * @class
 *
 * A plugin that provides interactivity in terms of events (mouse over and selection to a diagram).
 *
 * @param {EventBus} events the event bus to attach to
 */
function InteractionEvents(events, styles) {

  var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ], {
    pointerEvents: 'stroke',
    stroke: 'white',
    strokeWidth: 10
  });

  function isCtxSwitch(e) {
    return !e.relatedTarget || e.target.parentNode !== e.relatedTarget.parentNode;
  }

  function fire(event, baseEvent, eventName) {
    var e = _.extend({}, baseEvent, event);
    events.fire(eventName, e);
  }

  function makeSelectable(element, gfx, options) {
    var dblclick = options.dblclick,
        type = options.type;

    var baseEvent = { element: element, gfx: gfx };

    var visual = GraphicsUtil.getVisual(gfx);

    var hit;

    if (type === 'shape') {
      var bbox = visual.getBBox();
      hit = gfx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    } else {
      hit = visual.select('*').clone().attr('style', '');
    }

    hit.attr(HIT_STYLE).prependTo(gfx);

    gfx.hover(function(e) {
      if (isCtxSwitch(e)) {
        /**
         * An event indicating that shape|connection has been hovered
         *
         * shape.hover, connection.hover
         */
        fire(e, baseEvent, type + '.hover');
      }
    }, function(e) {
      if (isCtxSwitch(e)) {
        fire(e, baseEvent, type + '.out');
      }
    });

    gfx.click(function(e) {
      fire(e, baseEvent, type + '.click');
    });

    gfx.dblclick(function(e) {
      fire(e, baseEvent, type + '.dblclick');
    });
  }

  function makeConnectionSelectable(connection, gfx) {
    makeSelectable(connection, gfx, { type: 'connection' });
  }

  function makeShapeSelectable(shape, gfx) {
    makeSelectable(shape, gfx, { type: 'shape' });
  }

  function registerEvents(events) {

    events.on('canvas.init', function(event) {
      var paper = event.paper;

      // implement direct canvas click
      paper.click(function(event) {
        /**
         * An event indicating that the canvas has been directly clicked
         *
         * @memberOf InteractionEvents
         *
         * @event canvas.click
         *
         * @type {Object}
         */
        events.fire('canvas.click', _.extend(event, { paper: paper }));
      });
    });

    events.on('shape.added', function(event) {
      makeShapeSelectable(event.element, event.gfx);
    });

    events.on('connection.added', function(event) {
      makeConnectionSelectable(event.element, event.gfx);
    });
  }

  registerEvents(events);
}


InteractionEvents.$inject = [ 'eventBus', 'styles' ];

module.exports = InteractionEvents;