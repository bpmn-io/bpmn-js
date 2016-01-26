'use strict';

var forEach = require('lodash/collection/forEach'),
    domEvent = require('min-dom/lib/event'),
    domClosest = require('min-dom/lib/closest'),
    Hammer = require('hammerjs'),
    Snap = require('../../../vendor/snapsvg'),
    Event = require('../../util/Event');

var MIN_ZOOM = 0.2,
    MAX_ZOOM = 4;

var mouseEvents = [
  'mousedown',
  'mouseup',
  'mouseover',
  'mouseout',
  'click',
  'dblclick'
];

function log() {
  if (false) {
    console.log.apply(console, arguments);
  }
}

function get(service, injector) {
  return injector.get(service, false);
}

function createTouchRecognizer(node) {

  function stopEvent(event) {
    Event.stopEvent(event, true);
  }

  function stopMouse(event) {

    forEach(mouseEvents, function(e) {
      domEvent.bind(node, e, stopEvent, true);
    });
  }

  function allowMouse(event) {
    setTimeout(function() {
      forEach(mouseEvents, function(e) {
        domEvent.unbind(node, e, stopEvent, true);
      });
    }, 500);
  }

  domEvent.bind(node, 'touchstart', stopMouse, true);
  domEvent.bind(node, 'touchend', allowMouse, true);
  domEvent.bind(node, 'touchcancel', allowMouse, true);

  // A touch event recognizer that handles
  // touch events only (we know, we can already handle
  // mouse events out of the box)

  var recognizer = new Hammer.Manager(node, {
    inputClass: Hammer.TouchInput,
    recognizers: []
  });


  var tap = new Hammer.Tap();
  var pan = new Hammer.Pan({ threshold: 10 });
  var press = new Hammer.Press();
  var pinch = new Hammer.Pinch();

  var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });

  pinch.requireFailure(pan);
  pinch.requireFailure(press);

  recognizer.add([ pan, press, pinch, doubleTap, tap ]);

  recognizer.reset = function(force) {
    var recognizers = this.recognizers,
        session = this.session;

    if (session.stopped) {
      return;
    }

    log('recognizer', 'stop');

    recognizer.stop(force);

    setTimeout(function() {
      var i, r;

      log('recognizer', 'reset');
      for (i = 0; !!(r = recognizers[i]); i++) {
        r.reset();
        r.state = 8; // FAILED STATE
      }

      session.curRecognizer = null;
    }, 0);
  };

  recognizer.on('hammer.input', function(event) {
    if (event.srcEvent.defaultPrevented) {
      recognizer.reset(true);
    }
  });

  return recognizer;
}

/**
 * A plugin that provides touch events for elements.
 *
 * @param {EventBus} eventBus
 * @param {InteractionEvents} interactionEvents
 */
function TouchInteractionEvents(injector, canvas, eventBus, elementRegistry, interactionEvents) {

  // optional integrations
  var dragging = get('dragging', injector),
      move = get('move', injector),
      contextPad = get('contextPad', injector),
      palette = get('palette', injector);

  // the touch recognizer
  var recognizer;

  function handler(type) {

    return function(event) {
      log('element', type, event);

      interactionEvents.fire(type, event);
    };
  }

  function getGfx(target) {
    var node = domClosest(target, 'svg, .djs-element', true);
    return node && new Snap(node);
  }

  function initEvents(svg) {

    // touch recognizer
    recognizer = createTouchRecognizer(svg);

    recognizer.on('doubletap', handler('element.dblclick'));

    recognizer.on('tap', handler('element.click'));

    function startGrabCanvas(event) {

      log('canvas', 'grab start');

      var lx = 0, ly = 0;

      function update(e) {

        var dx = e.deltaX - lx,
            dy = e.deltaY - ly;

        canvas.scroll({ dx: dx, dy: dy });

        lx = e.deltaX;
        ly = e.deltaY;
      }

      function end(e) {
        recognizer.off('panmove', update);
        recognizer.off('panend', end);
        recognizer.off('pancancel', end);

        log('canvas', 'grab end');
      }

      recognizer.on('panmove', update);
      recognizer.on('panend', end);
      recognizer.on('pancancel', end);
    }

    function startGrab(event) {

      var gfx = getGfx(event.target),
          element = gfx && elementRegistry.get(gfx);

      // recognizer
      if (move && canvas.getRootElement() !== element) {
        log('element', 'move start', element, event, true);
        return move.start(event, element, true);
      } else {
        startGrabCanvas(event);
      }
    }

    function startZoom(e) {

      log('canvas', 'zoom start');

      var zoom = canvas.zoom(),
          mid = e.center;

      function update(e) {

        var ratio = 1 - (1 - e.scale) / 1.50,
            newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, ratio * zoom));

        canvas.zoom(newZoom, mid);

        Event.stopEvent(e, true);
      }

      function end(e) {
        recognizer.off('pinchmove', update);
        recognizer.off('pinchend', end);
        recognizer.off('pinchcancel', end);

        recognizer.reset(true);

        log('canvas', 'zoom end');
      }

      recognizer.on('pinchmove', update);
      recognizer.on('pinchend', end);
      recognizer.on('pinchcancel', end);
    }

    recognizer.on('panstart', startGrab);
    recognizer.on('press', startGrab);

    recognizer.on('pinchstart', startZoom);
  }

  if (dragging) {

    // simulate hover during dragging
    eventBus.on('drag.move', function(event) {

      var originalEvent = event.originalEvent;

      if (!originalEvent || originalEvent instanceof MouseEvent) {
        return;
      }

      var position = Event.toPoint(originalEvent);

      // this gets really expensive ...
      var node = document.elementFromPoint(position.x, position.y),
          gfx = getGfx(node),
          element = gfx && elementRegistry.get(gfx);

      if (element !== event.hover) {
        if (event.hover) {
          dragging.out(event);
        }

        if (element) {
          dragging.hover({ element: element, gfx: gfx });

          event.hover = element;
          event.hoverGfx = gfx;
        }
      }
    });
  }

  if (contextPad) {

    eventBus.on('contextPad.create', function(event) {
      var node = event.pad.html;

      // touch recognizer
      var padRecognizer = createTouchRecognizer(node);

      padRecognizer.on('panstart', function(event) {
        log('context-pad', 'panstart', event);
        contextPad.trigger('dragstart', event, true);
      });

      padRecognizer.on('press', function(event) {
        log('context-pad', 'press', event);
        contextPad.trigger('dragstart', event, true);
      });

      padRecognizer.on('tap', function(event) {
        log('context-pad', 'tap', event);
        contextPad.trigger('click', event);
      });
    });
  }

  if (palette) {
    eventBus.on('palette.create', function(event) {
      var node = event.html;

      // touch recognizer
      var padRecognizer = createTouchRecognizer(node);

      padRecognizer.on('panstart', function(event) {
        log('palette', 'panstart', event);
        palette.trigger('dragstart', event, true);
      });

      padRecognizer.on('press', function(event) {
        log('palette', 'press', event);
        palette.trigger('dragstart', event, true);
      });

      padRecognizer.on('tap', function(event) {
        log('palette', 'tap', event);
        palette.trigger('click', event);
      });
    });
  }

  eventBus.on('canvas.init', function(event) {
    initEvents(event.svg.node);
  });
}


TouchInteractionEvents.$inject = [
  'injector',
  'canvas',
  'eventBus',
  'elementRegistry',
  'interactionEvents',
  'touchFix'
];

module.exports = TouchInteractionEvents;