'use strict';

var forEach = require('lodash/collection/forEach');

var Snap = require('../../../vendor/snapsvg');

/**
 * Adds support for previews of moving/resizing elements.
 */
function PreviewSupport(elementRegistry, canvas, styles) {
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
  this._styles = styles;
}

module.exports = PreviewSupport;

PreviewSupport.$inject = [ 'elementRegistry', 'canvas', 'styles' ];


/**
 * Returns graphics of an element.
 *
 * @param {djs.model.Base} element
 *
 * @return {Snap<SVGElement>}
 */
PreviewSupport.prototype.getGfx = function(element) {
  return this._elementRegistry.getGraphics(element);
};

/**
 * Adds a move preview of a given shape to a given snapsvg group.
 *
 * @param {djs.model.Base} element
 * @param {Snap<SVGElement>} group
 *
 * @return {Snap<SVGElement>} dragger
 */
PreviewSupport.prototype.addDragger = function(shape, group) {
  var gfx = this.getGfx(shape);
  var dragger = gfx.clone();
  var bbox = gfx.getBBox();

  // remove markers from connections
  if (isConnection(shape)) {
    removeMarkers(dragger);
  }

  dragger.attr(this._styles.cls('djs-dragger', [], {
    x: bbox.x,
    y: bbox.y
  }));

  group.add(dragger);

  return dragger;
};

/**
 * Adds a resize preview of a given shape to a given snapsvg group.
 *
 * @param {djs.model.Base} element
 * @param {Snap<SVGElement>} group
 *
 * @return {Snap<SVGElement>} frame
 */
PreviewSupport.prototype.addFrame = function(shape, group) {

  var frame = Snap.create('rect', {
    class: 'djs-resize-overlay',
    width:  shape.width,
    height: shape.height,
    x: shape.x,
    y: shape.y
  });

  group.add(frame);

  return frame;
};

////////// helpers //////////

/**
 * Removes all svg marker references from an SVG.
 *
 * @param {Snap<SVGElement>} gfx
 */
function removeMarkers(gfx) {

  if (gfx.node) {

    // snapsvg paper element
    forEach(gfx.node.childNodes, function(childNode) {
      if (childNode.node) {

        // recursion
        removeMarkers(childNode.node);

      } else if (childNode.childNodes) {

        forEach(childNode.childNodes, function(childNodeChild) {

          // recursion
          removeMarkers(childNodeChild);
        });

      }
    });

  } else {

    // plain svg element
    gfx.style.markerStart = '';
    gfx.style.markerEnd = '';
  }

}

/**
 * Checks if an element is a connection.
 */
function isConnection(element) {
  return element.waypoints;
}
