'use strict';

/**
 * @module util/GraphicsUtil
 */

function is(e, cls) {
  return e.hasClass(cls);
}


/**
 *
 * A note on how SVG elements are structured:
 *
 * Shape layout:
 *
 * [group.djs-group.djs-shape]
 *  |-> [rect.djs-hit]
 *  |-> [rect.djs-visual]
 *  |-> [rect.djs-outline]
 *  ...
 *
 * [group.djs-group.djs-connection]
 *  |-> [polyline.djs-hit]
 *  |-> [polyline.djs-visual]
 *  |-> [polyline.djs-outline]
 *  ...
 *
 */

/**
 * Returns the visual part of a diagram element
 *
 * @param  {snapsvg.Element} gfx
 * @return {snapsvg.Element}
 */
function getVisual(gfx) {
  return gfx.select('.djs-visual');
}

/**
 * Returns the visual bbox of an element
 *
 * @param  {snapsvg.Element} gfx
 * @return {snapsvg.Element}
 */
function getBBox(gfx) {
  return getVisual(gfx).select('*').getBBox();
}


module.exports.getBBox = getBBox;
module.exports.getVisual = getVisual;