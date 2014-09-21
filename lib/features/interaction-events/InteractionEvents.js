'use strict';


var _ = require('lodash');

var Snap = require('snapsvg');

var GraphicsUtil = require('../../util/GraphicsUtil'),
    createLine = require('../../draw/Renderer').createLine;


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

  function fire(event, baseEvent, eventName) {
    var e = _.extend({}, baseEvent, event);
    eventBus.fire(eventName, e);
  }

  function registerEvents(eventBus) {

    eventBus.on('canvas.init', function(event) {
      var root = event.root;

      // implement direct canvas click
      event.paper.click(function(event) {

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


    eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
      var element = event.element,
          gfx = event.gfx,
          visual = GraphicsUtil.getVisual(gfx),
          baseEvent = { element: element, gfx: gfx };

      var hit, type;

      if (element.waypoints) {
        hit = createLine(element.waypoints);
        type = 'connection';
      } else {
        hit = Snap.create('rect', { x: 0, y: 0, width: element.width, height: element.height });
        type = 'shape';
      }


      hit.attr(HIT_STYLE).appendTo(gfx.node);

      gfx.hover(function(e) {

        /**
         * An event indicating that shape|connection has been hovered
         *
         * shape.hover, connection.hover
         */
        fire(e, baseEvent, type + '.hover');
      }, function(e) {
        fire(e, baseEvent, type + '.out');
      });

      hit.click(function(e) {
        fire(e, baseEvent, type + '.click');
      });

      hit.dblclick(function(e) {
        fire(e, baseEvent, type + '.dblclick');
      });
    });
  }

  registerEvents(eventBus);
}


InteractionEvents.$inject = [ 'eventBus', 'styles' ];

module.exports = InteractionEvents;