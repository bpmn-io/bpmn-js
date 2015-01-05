'use strict';


var _ = require('lodash');

var Snap = require('snapsvg');

var GraphicsUtil = require('../../util/GraphicsUtil'),
    Renderer = require('../../draw/Renderer'),
    Dom = require('../../util/Dom'),
    createLine = Renderer.createLine,
    updateLine = Renderer.updateLine;


/**
 * A plugin that provides interaction events for diagram elements.
 *
 * It emits the following events:
 *
 *   * element.hover
 *   * element.out
 *   * element.click
 *   * element.dblclick
 *   * element.mousedown
 *
 * Each event is a tuple { element, gfx, originalEvent }.
 *
 * Canceling the event via Event#preventDefault() prevents the original DOM operation.
 *
 * @param {EventBus} eventBus
 */
function InteractionEvents(eventBus, elementRegistry, styles, snap) {

  var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ], {
    stroke: 'white',
    strokeWidth: 10
  });

  function fire(type, event) {
    var target = Dom.closest(event.target, 'svg, .djs-element'),
        gfx = target && snap(target),
        element = elementRegistry.get(gfx),
        defaultPrevented;

    if (!gfx || !element) {
      return;
    }

    defaultPrevented = eventBus.fire(type, { element: element, gfx: gfx, originalEvent: event });

    if (defaultPrevented) {
      event.preventDefault();
    }
  }

  var handlers = {};

  function mouseHandler(type) {

    var fn = handlers[type];

    if (!fn) {
      fn = handlers[type] = function(event) {
        // only indicate left mouse button=0 interactions
        if (!event.button) {
          fire(type, event);
        }
      };
    }

    return fn;
  }


  ///// event registration

  function registerEvents(svg) {

    var node = svg.node;

    /**
     * An event indicating that the mouse hovered over an element
     *
     * @event element.hover
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'mouseover', mouseHandler('element.hover'));

    /**
     * An event indicating that the mouse has left an element
     *
     * @event element.out
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'mouseout', mouseHandler('element.out'));

    /**
     * An event indicating that the mouse has clicked an element
     *
     * @event element.click
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'click', mouseHandler('element.click'));

    /**
     * An event indicating that the mouse has double clicked an element
     *
     * @event element.dblclick
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'dblclick', mouseHandler('element.dblclick'));

    /**
     * An event indicating that the mouse has gone down on an element.
     *
     * @event element.mousedown
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'mousedown', mouseHandler('element.mousedown'));

    /**
     * An event indicating that the mouse has gone up on an element.
     *
     * @event element.mouseup
     *
     * @type {Object}
     * @property {djs.model.Base} element
     * @property {Snap<Element>} gfx
     * @property {Event} originalEvent
     */
    Dom.on(node, 'mouseup', mouseHandler('element.mouseup'));
  }

  function unregisterEvents(svg) {

    var node = svg.node;

    Dom.off(node, 'mouseover', mouseHandler('element.hover'));
    Dom.off(node, 'mouseout', mouseHandler('element.out'));
    Dom.off(node, 'click', mouseHandler('element.click'));
    Dom.off(node, 'dblclick', mouseHandler('element.dblclick'));
    Dom.off(node, 'mousedown', mouseHandler('element.mousedown'));
    Dom.off(node, 'mouseup', mouseHandler('element.mouseup'));
  }

  eventBus.on('canvas.destroy', function(event) {
    unregisterEvents(event.svg);
  });

  eventBus.on('canvas.init', function(event) {
    registerEvents(event.svg);
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
  });

  // update djs-hit on change

  eventBus.on('shape.changed', function(event) {

    var element = event.element,
        gfx = event.gfx,
        hit = gfx.select('.djs-hit');

    hit.attr({
      width: element.width,
      height: element.height
    });
  });

  eventBus.on('connection.changed', function(event) {

    var element = event.element,
        gfx = event.gfx,
        hit = gfx.select('.djs-hit');

    updateLine(hit, element.waypoints);
  });


  // API

  this.fire = fire;
}


InteractionEvents.$inject = [ 'eventBus', 'elementRegistry', 'styles', 'snap' ];

module.exports = InteractionEvents;
