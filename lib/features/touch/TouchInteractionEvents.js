'use strict';

var _ = require('lodash'),
    Hammer = require('hammerjs');


function createTapRecognizer(element) {
  var h = new Hammer(element, {});

  var tap = new Hammer.Tap();
  var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });

  doubleTap.recognizeWith(tap);
  tap.requireFailure([ doubleTap ]);

  h.add([ doubleTap, tap ]);

  return h;
}

/**
 * @class
 *
 * A plugin that provides touch events for elements.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function TouchInteractioneventBus(eventBus, canvas) {

  function createEvent(event, baseEvent) {
    return _.extend({}, baseEvent, event);
  }

  function makeSelectable(element, gfx, options) {
    var type = options.type;

    var baseEvent = { element: element, gfx: gfx };

    // Touch
    var h = createTapRecognizer(gfx.node);

    h.on('doubletap', function(e) {
      var event = createEvent(e, baseEvent);

      eventBus.fire(type + '.dbltap', event);
      eventBus.fire(type + '.dblclick', event);

      e.preventDefault();
    });

    h.on('tap', function(e) {
      var event = createEvent(e, baseEvent);

      eventBus.fire(type + '.tap', event);
      eventBus.fire(type + '.click', event);

      e.preventDefault();
    });
  }

  function registerEvents(eventBus) {

    eventBus.on('canvas.init', function(event) {
      var root = event.root,
          svg = event.paper.node;

      createTapRecognizer(svg).on('tap', function(e) {

        if (e.target === svg) {
          var evt = createEvent(e, { root: root });
          eventBus.fire('canvas.tap', evt);
          eventBus.fire('canvas.click', evt);
        }
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


TouchInteractioneventBus.$inject = [ 'eventBus', 'canvas', 'touchFix' ];

module.exports = TouchInteractioneventBus;