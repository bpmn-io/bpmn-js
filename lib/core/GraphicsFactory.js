'use strict';

/**
 * Creates a gfx container for shapes and connections
 *
 * The layout is as follows:
 *
 * <g data-element-id="element-1" class="djs-group djs-(type=shape|connection)">
 *   <g class="djs-visual">
 *     <!-- the renderer draws in here -->
 *   </g>
 *
 *   <!-- extensions (overlays, click box, ...) goes here
 * </g>
 *
 * @param {Object} root
 * @param {String} type the type of the element, i.e. shape | connection
 */
function createContainer(root, type) {
  var gfxContainer = root.group();

  gfxContainer
    .addClass('djs-group')
    .addClass('djs-' + type);

  return gfxContainer;
}

/**
 * Clears the graphical representation of the element and returns the
 * cleared result (the <g class="djs-visual" /> element).
 */
function clearVisual(gfx) {

  var oldVisual = gfx.select('.djs-visual'),
      newVisual = gfx.group().addClass('djs-visual');

  if (oldVisual) {
    newVisual.after(oldVisual);
    oldVisual.remove();
  }

  return newVisual;
}


function createContainerFactory(type) {
  return function(root, data) {
    return createContainer(root, type).attr('data-element-id', data.id);
  };
}


/**
 * A factory that creates graphical elements
 *
 * @param {Renderer} renderer
 * @param {Snap} snap
 */
function GraphicsFactory(renderer, snap) {
  this._renderer = renderer;
  this._snap = snap;
}

GraphicsFactory.prototype.createShape = createContainerFactory('shape');

GraphicsFactory.prototype.createConnection = createContainerFactory('connection');

GraphicsFactory.prototype.createPaper = function(options) {
  return this._snap.createSnapAt(options.width, options.height, options.container);
};


GraphicsFactory.prototype.updateShape = function(element, gfx) {

  // clear visual
  var gfxGroup = clearVisual(gfx);

  // redraw
  this._renderer.drawShape(gfxGroup, element);

  // update positioning
  gfx.translate(element.x, element.y);

  gfx.attr('display', element.hidden ? 'none' : 'block');
};


GraphicsFactory.prototype.updateConnection = function(element, gfx) {

  // clear visual
  var gfxGroup = clearVisual(gfx);
  this._renderer.drawConnection(gfxGroup, element);

  gfx.attr('display', element.hidden ? 'none' : 'block');
};


GraphicsFactory.$inject = [ 'renderer', 'snap' ];

module.exports = GraphicsFactory;