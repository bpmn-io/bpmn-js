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
    var target = Dom.closest(event.target, 'svg, .djs-group'),
        gfx = target && snap(target),
        element = elementRegistry.get(gfx),
        defaultPrevented;

    if (!gfx || !element) {
      console.error('NO GFX OR ELEMENT FOR EVENT', event);
      return;
    }

    defaultPrevented = eventBus.fire(type, { element: element, gfx: gfx, originalEvent: event });

    if (defaultPrevented) {
      event.preventDefault();
    }
  }

  function handler(type) {
    return function(event) {
      fire(type, event);
    };
  }


  ///// event registration

  function registerEvents(svg) {

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

    svg.hover(handler('element.hover'), handler('element.out'));

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
    svg.click(handler('element.click'));

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
    svg.dblclick(handler('element.dblclick'));

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
    svg.mousedown(handler('element.mousedown'));

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
    svg.mouseup(handler('element.mouseup'));
  }

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

}


InteractionEvents.$inject = [ 'eventBus', 'elementRegistry', 'styles', 'snap' ];

module.exports = InteractionEvents;
