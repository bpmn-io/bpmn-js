require('../core/ElementRegistry');

var _ = require('lodash'),
    setParent = require('../util/shapeUtil').setParent;


/**
 * Implements re- and undoable addition of shapes to the diagram
 *
 * @param {EventBus} events
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} shapes
 */
function AddShapeHandler(events, graphicsFactory, shapes) {

  var paper;
  
  /**
   * Execute add
   */
  function execute(ctx) {

    var shape = ctx.shape,
        parent = ctx.parent || shape.parent;

    // remember parent outside shape
    ctx.parent = parent;

    // establish shape -> parent -> shape relationship
    setParent(shape, parent);

    var gfx = graphicsFactory.createShape(paper, shape);

    events.fire('shape.added', { element: shape, gfx: gfx });

    return gfx;
  }


  /**
   * Execute revert
   */
  function revert(ctx) {

    var shape = ctx.shape,
        gfx = shapes.getGraphicsByShape(shape);

    setParent(shape, null);

    events.fire('shape.removed', { element: shape, gfx: gfx });

    gfx.remove();
  }


  function canExecute(ctx) {
    return true;
  }


  // load paper from canvas init event
  events.on('canvas.init', function(e) {
    paper = e.paper;
  });


  // API
  
  this.execute = execute;
  this.revert = revert;

  this.canExecute = canExecute;
}


AddShapeHandler.$inject = ['eventBus', 'graphicsFactory', 'elementRegistry'];

// export
module.exports = AddShapeHandler;