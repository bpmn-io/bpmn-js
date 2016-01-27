'use strict';

/* global TouchEvent */

var round = Math.round;

var assign = require('lodash/object/assign');

var domEvent = require('min-dom/lib/event'),
    Event = require('../../util/Event'),
    ClickTrap = require('../../util/ClickTrap'),
    Cursor = require('../../util/Cursor');

var EventBusEvent = require('../../core/EventBus').Event;

var DRAG_ACTIVE_CLS = 'djs-drag-active';


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

function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
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
 *   * emits life cycle events, namespaced with a prefix assigned
 *     during dragging activation
 *   * sets and restores the cursor
 *   * sets and restores the selection
 *   * ensures there can be only one drag operation active at a time
 *
 * Dragging may be canceled manually by calling {@link Dragging#cancel}
 * or by pressing ESC.
 *
 *
 * ## Life-cycle events
 *
 * Dragging can be in three different states, off, initialized
 * and active.
 *
 * (1) off: no dragging operation is in progress
 * (2) initialized: a new drag operation got initialized but not yet
 *                  started (i.e. because of no initial move)
 * (3) started: dragging is in progress
 *
 * Eventually dragging will be off again after a drag operation has
 * been ended or canceled via user click or ESC key press.
 *
 * To indicate transitions between these states dragging emits generic
 * life-cycle events with the `drag.` prefix _and_ events namespaced
 * to a prefix choosen by a user during drag initialization.
 *
 * The following events are emitted (appropriately prefixed) via
 * the {@link EventBus}.
 *
 * * `init`
 * * `start`
 * * `move`
 * * `end`
 * * `ended` (dragging already in off state)
 * * `cancel` (only if previously started)
 * * `canceled` (dragging already in off state, only if previously started)
 * * `cleanup`
 *
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
 *     dragging.init(event, 'mydrag', {
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
    threshold: 5,
    trapClick: true
  };

  // the currently active drag operation
  // dragging is active as soon as this context exists.
  //
  // it is visually _active_ only when a context.active flag is set to true.
  var context;

  /* convert a global event into local coordinates */
  function toLocalPoint(globalPosition) {

    var viewbox = canvas.viewbox();

    var clientRect = canvas._container.getBoundingClientRect();

    return {
      x: viewbox.x + round((globalPosition.x - clientRect.left) / viewbox.scale),
      y: viewbox.y + round((globalPosition.y - clientRect.top) / viewbox.scale)
    };
  }

  /* scale point to local coordinates */
  function inLocalScale(point) {

    var viewbox = canvas.viewbox();

    return {
      x: round(point.x / viewbox.scale),
      y: round(point.y / viewbox.scale)
    };
  }

  // helpers

  function fire(type, dragContext) {
    dragContext = dragContext || context;

    var event = assign(new EventBusEvent(), dragContext.payload, dragContext.data);

    // default integration
    if (eventBus.fire('drag.' + type, event) === false) {
      return false;
    }

    return eventBus.fire(dragContext.prefix + '.' + type, event);
  }

  // event listeners

  function move(event, activate) {

    var payload = context.payload,
        globalStart = context.globalStart,
        globalCurrent = Event.toPoint(event),
        globalDelta = substract(globalCurrent, globalStart),
        localStart = context.localStart,
        localDelta = inLocalScale(globalDelta),
        localCurrent = add(localStart, localDelta);

    // activate context explicitly or once threshold is reached

    if (!context.active && (activate || getLength(globalDelta) > context.threshold)) {

      // fire start event with original
      // starting coordinates

      assign(payload, {
        x: localStart.x,
        y: localStart.y,
        dx: 0,
        dy: 0
      }, { originalEvent: event });

      if (false === fire('start')) {
        return cancel();
      }

      context.active = true;

      // unset selection and remember old selection
      // the previous (old) selection will always passed
      // with the event via the event.previousSelection property
      if (!context.keepSelection) {
        payload.previousSelection = selection.get();
        selection.select(null);
      }

      // allow custom cursor
      if (context.cursor) {
        Cursor.set(context.cursor);
      }

      // indicate dragging via marker on root element
      canvas.addMarker(canvas.getRootElement(), DRAG_ACTIVE_CLS);
    }

    suppressEvent(event);

    if (context.active) {

      // update payload with actual coordinates
      assign(payload, {
        x: localCurrent.x,
        y: localCurrent.y,
        dx: localDelta.x,
        dy: localDelta.y
      }, { originalEvent: event });

      // emit move event
      fire('move');
    }
  }

  function end(event) {
    var previousContext,
        returnValue = true;

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
      returnValue = fire('end');
    }

    if (returnValue === false) {
      fire('rejected');
    }

    previousContext = cleanup(returnValue !== true);

    // last event to be fired when all drag operations are done
    // at this point in time no drag operation is in progress anymore
    fire('ended', previousContext);
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

    var untrap;

    // trap the click in case we are part of an active
    // drag operation. This will effectively prevent
    // the ghost click that cannot be canceled otherwise.
    if (context.active) {
      untrap = ClickTrap.install();
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
    var previousContext;

    if (!context) {
      return;
    }

    var wasActive = context.active;

    if (wasActive) {
      fire('cancel');
    }

    previousContext = cleanup(restore);

    if (wasActive) {
      // last event to be fired when all drag operations are done
      // at this point in time no drag operation is in progress anymore
      fire('canceled', previousContext);
    }
  }

  function cleanup(restore) {
    var previousContext,
        endDrag;

    fire('cleanup');

    // reset cursor
    Cursor.unset();

    if (context.trapClick) {
      endDrag = trapClickAndEnd;
    } else {
      endDrag = end;
    }

    // reset dom listeners
    domEvent.unbind(document, 'mousemove', move);

    domEvent.unbind(document, 'mousedown', endDrag, true);
    domEvent.unbind(document, 'mouseup', endDrag, true);

    domEvent.unbind(document, 'keyup', checkCancel);

    domEvent.unbind(document, 'touchstart', trapTouch, true);
    domEvent.unbind(document, 'touchcancel', cancel, true);
    domEvent.unbind(document, 'touchmove', move, true);
    domEvent.unbind(document, 'touchend', end, true);

    eventBus.off('element.hover', hover);
    eventBus.off('element.out', out);

    // remove drag marker on root element
    canvas.removeMarker(canvas.getRootElement(), DRAG_ACTIVE_CLS);

    // restore selection, unless it has changed
    var previousSelection = context.payload.previousSelection;

    if (restore !== false && previousSelection && !selection.get().length) {
      selection.select(previousSelection);
    }

    previousContext = context;

    context = null;

    return previousContext;
  }

  /**
   * Initialize a drag operation.
   *
   * If `localPosition` is given, drag events will be emitted
   * relative to it.
   *
   * @param {MouseEvent|TouchEvent} [event]
   * @param {Point} [localPosition] actual diagram local position this drag operation should start at
   * @param {String} prefix
   * @param {Object} [options]
   */
  function init(event, localPosition, prefix, options) {

    // only one drag operation may be active, at a time
    if (context) {
      cancel(false);
    }

    if (typeof localPosition === 'string') {
      options = prefix;
      prefix = localPosition;
      localPosition = null;
    }

    options = assign({}, defaultOptions, options || {});

    var data = options.data || {},
        originalEvent,
        globalStart,
        endDrag;

    if (options.trapClick) {
      endDrag = trapClickAndEnd;
    } else {
      endDrag = end;
    }

    if (event) {
      originalEvent = Event.getOriginal(event) || event;
      globalStart = Event.toPoint(event);

      suppressEvent(event);
    } else {
      originalEvent = null;
      globalStart = { x: 0, y: 0 };
    }

    if (!localPosition) {
      localPosition = toLocalPoint(globalStart);
    }

    context = assign({
      prefix: prefix,
      data: data,
      payload: {},
      globalStart: globalStart,
      localStart: localPosition,
    }, options);

    // skip dom registration if trigger
    // is set to manual (during testing)
    if (!options.manual) {

      // add dom listeners

      // fixes TouchEvent not being available on desktop Firefox
      if (typeof TouchEvent !== 'undefined' && originalEvent instanceof TouchEvent) {
        domEvent.bind(document, 'touchstart', trapTouch, true);
        domEvent.bind(document, 'touchcancel', cancel, true);
        domEvent.bind(document, 'touchmove', move, true);
        domEvent.bind(document, 'touchend', end, true);
      } else {
        // assume we use the mouse to interact per default
        domEvent.bind(document, 'mousemove', move);

        domEvent.bind(document, 'mousedown', endDrag, true);
        domEvent.bind(document, 'mouseup', endDrag, true);
      }

      domEvent.bind(document, 'keyup', checkCancel);

      eventBus.on('element.hover', hover);
      eventBus.on('element.out', out);
    }

    fire('init');

    if (options.autoActivate) {
      move(event, true);
    }
  }

  // cancel on diagram destruction
  eventBus.on('diagram.destroy', cancel);


  // API

  this.init = init;
  this.move = move;
  this.hover = hover;
  this.out = out;
  this.end = end;

  this.cancel = cancel;

  // for introspection

  this.context = function() {
    return context;
  };

  this.setOptions = function(options) {
    assign(defaultOptions, options);
  };
}

Dragging.$inject = [ 'eventBus', 'canvas', 'selection' ];

module.exports = Dragging;
