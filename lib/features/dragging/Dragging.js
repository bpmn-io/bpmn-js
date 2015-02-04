'use strict';

/* global TouchEvent */

var assign = require('lodash/object/assign');

var domEvent = require('min-dom/lib/event'),
    Event = require('../../util/Event'),
    Cursor = require('../../util/Cursor');

function suppressEvent(event) {
  if (event instanceof MouseEvent) {
    Event.stopEvent(event, true);
  } else {
    Event.preventDefault(event);
  }
}

function getLength(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

function substract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}

/**
 * A helper that fires canvas localized drag events and realizes
 * the general "drag-and-drop" look and feel.
 *
 * Calling {@link Dragging#activate} activates dragging on a canvas.
 *
 * It provides the following:
 *
 *   * emits the events `start`, `move`, `end`, `cancel` and `cleanup` via the {@link EventBus}.
 *     Each of the events is prefixed with a prefix that is assigned during activate.
 *   * sets and restores the cursor
 *   * sets and restores the selection
 *   * ensures there can be only one drag operation active at a time
 *
 * Dragging may be canceled manually by calling {@link Dragging#cancel} or by pressing ESC.
 *
 * @example
 *
 * function MyDragComponent(eventBus, dragging) {
 *
 *   eventBus.on('mydrag.start', function(event) {
 *     console.log('yes, we start dragging');
 *   });
 *
 *   eventBus.on('mydrag.move', function(event) {
 *     console.log('canvas local coordinates', event.x, event.y, event.dx, event.dy);
 *
 *     // local drag data is passed with the event
 *     event.context.foo; // "BAR"
 *
 *     // the original mouse event, too
 *     event.originalEvent; // MouseEvent(...)
 *   });
 *
 *   eventBus.on('element.click', function(event) {
 *     dragging.activate(event, 'mydrag', {
 *       cursor: 'grabbing',
 *       data: {
 *         context: {
 *           foo: "BAR"
 *         }
 *       }
 *     });
 *   });
 * }
 */
function Dragging(eventBus, canvas, selection) {

  var defaultOptions = {
    threshold: 5
  };

  // the currently active drag operation
  // dragging is active as soon as this context exists.
  //
  // it is visually _active_ only when a context.active flag is set to true.
  var context;


  // helpers

  function fire(type) {

    var ActualEvent = require('../../core/EventBus').Event;

    var event = new ActualEvent();

    event.init(assign({}, context.payload, context.data));

    // default integration
    if (!eventBus.fire('drag.' + type, event)) {
      return false;
    }

    return eventBus.fire(context.prefix + '.' + type, event);
  }

  // event listeners

  function move(event, activate) {

    var payload = context.payload,
        start = context.start,
        position = Event.toPoint(event),
        delta = substract(position, start),
        clientRect = canvas._container.getBoundingClientRect(),
        offset;

    // canvas relative position

    offset = {
      x: clientRect.left,
      y: clientRect.top
    };

    // update actual event payload with canvas relative measures

    var viewbox = canvas.viewbox();

    var movement = {
      x: viewbox.x + (position.x - offset.x) / viewbox.scale,
      y: viewbox.y + (position.y - offset.y) / viewbox.scale,
      dx: delta.x / viewbox.scale,
      dy: delta.y / viewbox.scale
    };

    // activate context explicitly or once threshold is reached

    if (!context.active && (activate || getLength(delta) > context.threshold)) {

      // fire start event with original
      // starting coordinates

      assign(payload, {
        x: movement.x - movement.dx,
        y: movement.y - movement.dy,
        dx: 0,
        dy: 0
      }, { originalEvent: event });

      if (false === fire('start')) {
        return cancel();
      }

      context.active = true;

      // unset selection
      if (!context.keepSelection) {
        context.previousSelection = selection.get();
        selection.select(null);
      }
    }

    suppressEvent(event);

    if (context.active) {

      // fire move event with actual coordinates
      assign(payload, movement, { originalEvent: event });

      // allow custom cursor
      if (context.cursor) {
        Cursor.set(context.cursor);
      }

      fire('move');
    }
  }

  function end(event) {

    var restore = true;

    if (context.active) {

      if (event) {
        context.payload.originalEvent = event;

        // suppress original event (click, ...)
        // because we just ended a drag operation
        suppressEvent(event);
      }

      // implementations may stop restoring the
      // original state (selections, ...) by preventing the
      // end events default action
      restore = fire('end');
    }

    cleanup(restore);
  }


  // cancel active drag operation if the user presses
  // the ESC key on the keyboard

  function checkCancel(event) {

    if (event.which === 27) {
      event.preventDefault();

      cancel();
    }
  }


  // prevent ghost click that might occur after a finished
  // drag and drop session

  function trapClickAndEnd(event) {

    var untrap = function(e) {
      domEvent.unbind(document, 'click', trap, true);
    };

    var trap = function(e) {
      suppressEvent(e);
      untrap();
    };

    if (context.active) {
      domEvent.bind(document, 'click', trap, true);
      setTimeout(untrap, 400);
    }

    end(event);
  }

  function trapTouch(event) {
    move(event);
  }

  // update the drag events hover (djs.model.Base) and hoverGfx (Snap<SVGElement>)
  // properties during hover and out and fire {prefix}.hover and {prefix}.out properties
  // respectively

  function hover(event) {
    var payload = context.payload;

    payload.hoverGfx = event.gfx;
    payload.hover = event.element;

    fire('hover');
  }

  function out(event) {
    fire('out');

    var payload = context.payload;

    payload.hoverGfx = null;
    payload.hover = null;
  }


  // life-cycle methods

  function cancel(restore) {

    if (!context) {
      return;
    }

    if (context.active) {
      fire('cancel');
    }

    cleanup(restore);
  }

  function cleanup(restore) {

    fire('cleanup');

    // reset cursor
    Cursor.unset();

    // reset dom listeners
    domEvent.unbind(document, 'mousemove', move);

    domEvent.unbind(document, 'mousedown', trapClickAndEnd, true);
    domEvent.unbind(document, 'mouseup', end, true);

    domEvent.unbind(document, 'keyup', checkCancel);

    domEvent.unbind(document, 'touchstart', trapTouch, true);
    domEvent.unbind(document, 'touchcancel', cancel, true);
    domEvent.unbind(document, 'touchmove', move, true);
    domEvent.unbind(document, 'touchend', end, true);

    eventBus.off('element.hover', hover);
    eventBus.off('element.out', out);

    // restore selection, unless it has changed
    if (restore !== false && context.previousSelection && !selection.get().length) {
      selection.select(context.previousSelection);
    }

    context = null;
  }

  function activate(event, prefix, options) {

    // only one drag operation may be active, at a time
    if (context) {
      cancel(false);
    }

    options = assign({}, defaultOptions, options || {});

    var data = options.data || {},
        originalEvent = Event.getOriginal(event) || event;

    context = assign({
      prefix: prefix,
      data: data,
      payload: {},
      start: Event.toPoint(event)
    }, options);

    // skip dom registration if trigger
    // is set to manual (during testing)
    if (!options.manual) {

      if (originalEvent instanceof MouseEvent) {
        // add dom listeners
        domEvent.bind(document, 'mousemove', move);

        domEvent.bind(document, 'mousedown', trapClickAndEnd, true);
        domEvent.bind(document, 'mouseup', end, true);
      } else
      // fixes TouchEvent not being available on desktop Firefox
      if (typeof TouchEvent !== 'undefined' && originalEvent instanceof TouchEvent) {
        domEvent.bind(document, 'touchstart', trapTouch, true);
        domEvent.bind(document, 'touchcancel', cancel, true);
        domEvent.bind(document, 'touchmove', move, true);
        domEvent.bind(document, 'touchend', end, true);
      }

      domEvent.bind(document, 'keyup', checkCancel);

      eventBus.on('element.hover', hover);
      eventBus.on('element.out', out);
    }

    suppressEvent(event);

    fire('activate');

    if (options.autoActivate) {
      move(event, true);
    }
  }

  // cancel on diagram destruction
  eventBus.on('diagram.destroy', cancel);


  // API

  this.activate = activate;
  this.move = move;
  this.hover = hover;
  this.out = out;
  this.end = end;

  this.cancel = cancel;

  // for introspection

  this.active = function() {
    return context;
  };

  this.setOptions = function(options) {
    assign(defaultOptions, options);
  };
}

Dragging.$inject = [ 'eventBus', 'canvas', 'selection' ];

module.exports = Dragging;