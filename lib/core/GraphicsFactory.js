var diagramModule = require('../di').defaultModule;

// required components
require('./EventBus');

require('../draw/Snap');
require('../draw/Renderer');

/**
 * A factory that creates graphical elements
 *
 * @param {EventBus} events
 * @param {Renderer} renderer
 * @param {Snap} snap
 */
function GraphicsFactory(events, renderer, snap) {

  function createParent(paper, type) {

    return paper
      .group()
        .addClass('djs-group')
        .addClass('djs-' + type);
  }

  function createShape(paper, data) {

    var parent = createParent(paper, 'shape');

    var gfx = renderer.drawShape(parent, data);
    gfx.addClass('djs-visual');

    setPosition(parent, data.x, data.y);

    if (data.hidden) {
      parent.attr('visibility', 'hidden');
    }

    return parent;
  }

  function createConnection(paper, data) {
    var parent = createParent(paper, 'connection');

    var gfx = renderer.drawConnection(parent, data);
    gfx.addClass('djs-visual');

    return parent;
  }

  function setPosition(gfx, x, y) {
    var positionMatrix = new snap.Matrix();
    positionMatrix.translate(x, y);
    gfx.transform(positionMatrix);
  }

  function createPaper(options) {
    return snap.createSnapAt(options.width, options.height, options.container);
  }

  // API
  this.createConnection = createConnection;
  this.createShape = createShape;
  this.createPaper = createPaper;
}

diagramModule.type('graphicsFactory', [ 'eventBus', 'renderer', 'snap', GraphicsFactory ]);

module.exports = GraphicsFactory;