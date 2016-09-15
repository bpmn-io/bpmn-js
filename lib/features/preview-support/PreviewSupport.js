'use strict';

var forEach = require('lodash/collection/forEach');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgClone = require('tiny-svg/lib/clone'),
    svgCreate = require('tiny-svg/lib/create');

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
 * @return {SVGElement}
 */
PreviewSupport.prototype.getGfx = function(element) {
  return this._elementRegistry.getGraphics(element);
};

/**
 * Adds a move preview of a given shape to a given svg group.
 *
 * @param {djs.model.Base} element
 * @param {SVGElement} group
 *
 * @return {SVGElement} dragger
 */
PreviewSupport.prototype.addDragger = function(shape, group) {
  var gfx = this.getGfx(shape);

  // clone is not included in tsvg for some reason
  var dragger = svgClone(gfx);
  var bbox = gfx.getBoundingClientRect();

  // remove markers from connections
  if (isConnection(shape)) {
    removeMarkers(dragger);
  }

  svgAttr(dragger, this._styles.cls('djs-dragger', [], {
    x: bbox.top,
    y: bbox.left
  }));

  svgAppend(group, dragger);

  return dragger;
};

/**
 * Adds a resize preview of a given shape to a given svg group.
 *
 * @param {djs.model.Base} element
 * @param {SVGElement} group
 *
 * @return {SVGElement} frame
 */
PreviewSupport.prototype.addFrame = function(shape, group) {

  var frame = svgCreate('rect', {
    class: 'djs-resize-overlay',
    width:  shape.width,
    height: shape.height,
    x: shape.x,
    y: shape.y
  });

  svgAppend(group, frame);

  return frame;
};

////////// helpers //////////

/**
 * Removes all svg marker references from an SVG.
 *
 * @param {SVGElement} gfx
 */
function removeMarkers(gfx) {

  if (gfx.children) {

    forEach(gfx.children, function(child) {

      // recursion
      removeMarkers(child);

    });

  }

  gfx.style.markerStart = '';
  gfx.style.markerEnd = '';

}

/**
 * Checks if an element is a connection.
 */
function isConnection(element) {
  return element.waypoints;
}
