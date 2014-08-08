'use strict';


var _ = require('lodash');

var GraphicsUtil = require('../../util/GraphicsUtil');


/**
 * A plugin that provides interactivity in terms of events (mouse over and selection to a diagram).
 *
 * @class
 *
 * @param {EventBus} eventBus
 */
function InteractionEvents(eventBus, styles) {

  var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ], {
    stroke: 'white',
    strokeWidth: 10
  });

  function isCtxSwitch(e) {
    return !e.relatedTarget || e.target.parentNode !== e.relatedTarget.parentNode;
  }

  function fire(event, baseEvent, eventName) {
    var e = _.extend({}, baseEvent, event);
    eventBus.fire(eventName, e);
  }

  function makeSelectable(element, gfx, options) {
    var type = options.type,
        baseEvent = { element: element, gfx: gfx },
        visual = GraphicsUtil.getVisual(gfx),
        hit,
        bbox;

    if (type === 'shape') {
      bbox = visual.getBBox();
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

    visual.click(function(e) {
      fire(e, baseEvent, type + '.click');
    });

    visual.dblclick(function(e) {
      fire(e, baseEvent, type + '.dblclick');
    });
  }

  function registerEvents(eventBus) {

    eventBus.on('canvas.init', function(event) {
      var root = event.root;

      // implement direct canvas click
      root.click(function(event) {

        /**
         * An event indicating that the canvas has been directly clicked
         *
         * @memberOf InteractionEvents
         *
         * @event canvas.click
         *
         * @type {Object}
         */
        eventBus.fire('canvas.click', _.extend({}, event, { root: root }));
      });
    });

    eventBus.on('shape.added', function(event) {
      makeSelectable(event.element, event.gfx, { type: 'shape' });
    });

    eventBus.on('connection.added', function(event) {
      makeSelectable(event.element, event.gfx, { type: 'connection' });
    });
  }

  registerEvents(eventBus);
}


InteractionEvents.$inject = [ 'eventBus', 'styles' ];

module.exports = InteractionEvents;