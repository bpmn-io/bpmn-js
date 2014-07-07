'use strict';


var _ = require('lodash'),
    hammer = require('hammerjs'),
    $ = require('jquery');

var GraphicsUtil = require('../../util/GraphicsUtil');


/**
 * @class
 *
 * A plugin that provides interactivity in terms of touch events.
 *
 * @param {EventBus} events the event bus to attach to
 */
function TouchInteractionEvents(events, styles, canvas) {

  var container = canvas.getContainer();

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

    // Touch
    hammer(gfx.node, {
      tapAlways: false
    }).on('doubletap', function(e) {
      fire(e, baseEvent, type + '.dbltap');
    });

    hammer(gfx.node).on('tap', function(e) {
      fire(e, baseEvent, type + '.tap');
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
      var root = event.root;

      hammer(container).on('tap', function(e) {
        events.fire('container.tap', _.extend({}, e, { root: root }));
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


TouchInteractionEvents.$inject = [ 'eventBus', 'styles', 'canvas' ];

module.exports = TouchInteractionEvents;