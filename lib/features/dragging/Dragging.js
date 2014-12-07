var _ = require('lodash');

var Dom = require('../../util/Dom'),
    Event = require('../../util/Event'),
    Cursor = require('../../util/Cursor');


function toPoint(point) {
  return {
    x: point.x,
    y: point.y
  };
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
    var event = _.extend({}, context.payload, context.data);
    return eventBus.fire(context.prefix + '.' + type, event);
  }

  // event listeners

  function move(event) {

    // only intercept move events inside the root SVG node
    //
    // we would otherwise have no chance to retrieve the svg-relative
    // position of the move event
    //
    // looks better for users, too
    //
    if (!Dom.closest(event.target, 'svg')) {
      return;
    }

    var payload = context.payload,
        start = context.start,
        position = toPoint(event),
        delta = substract(position, start),
        offset;

    // canvas relative position

    offset = {
      x: (event.offsetX || event.layerX),
      y: (event.offsetY || event.layerY)
    };

    // update actual event payload with canvas relative measures

    var viewbox = canvas.viewbox();

    var movement = {
      x: viewbox.x + offset.x / viewbox.scale,
      y: viewbox.y + offset.y / viewbox.scale,
      dx: delta.x / viewbox.scale,
      dy: delta.y / viewbox.scale
    };


    // activate context once threshold is reached

    if (!context.active && getLength(delta) > context.threshold) {

      // fire start event with original
      // starting coordinates

      _.extend(payload, {
        x: movement.x - movement.dx,
        y: movement.y - movement.dy,
        dx: 0,
        dy: 0
      }, { originalEvent: event });

      if (false === fire('start')) {
        return cancel();
      }

      context.active = true;
    }

    if (context.active) {

      // fire move event with actual coordinates
      _.extend(payload, movement, { originalEvent: event });

      // unset selection
      if (!context.keepSelection) {
        context.previousSelection = selection.get();
        selection.select(null);
      }

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
        Event.stopEvent(event);
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
    Dom.off(document, 'mousemove', move);
    Dom.off(document, 'mouseup', end);
    Dom.off(document, 'click', end);
    Dom.off(document, 'keyup', checkCancel);

    eventBus.off('element.hover', hover);
    eventBus.off('element.out', out);

    // restore selection
    if (restore !== false && context.previousSelection) {
      selection.select(context.previousSelection);
    }

    context = null;
  }

  function activate(event, prefix, options) {

    // only one drag operation may be active, at a time
    if (context) {
      cancel(false);
    }

    options = _.extend({}, defaultOptions, options || {});

    var data = options.data || {};

    context = _.extend({
      prefix: prefix,
      data: data,
      payload: {},
      start: toPoint(event)
    }, options);


    // skip dom registration if trigger
    // is set to manual (during testing)
    if (!options.manual) {

      // add dom listeners
      Dom.on(document, 'mousemove', move);
      Dom.on(document, 'mouseup', end);
      Dom.on(document, 'click', end);
      Dom.on(document, 'keyup', checkCancel);

      eventBus.on('element.hover', hover);
      eventBus.on('element.out', out);
    }

    // cancel original event
    Event.stopEvent(event);

    fire('activate');
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
    _.extend(defaultOptions, options);
  };
}

Dragging.$inject = [ 'eventBus', 'canvas', 'selection' ];

module.exports = Dragging;