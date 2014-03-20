var diagramModule = require('../di').defaultModule;

// required components
require('./Events');

require('../draw/Snap');
require('../draw/Renderer');


function GraphicsFactory(events, renderer, snap) {

  function wrapVisual(paper, gfx, type) {

    gfx.addClass('djs-visual');

    return paper
      .group(gfx)
        .addClass('djs-group')
        .addClass('djs-' + type);
  }

  function createShape(paper, data) {

    var gfx = renderer.drawShape(paper, data);
    var group = wrapVisual(paper, gfx, 'shape');

    setPosition(group, data.x, data.y);

    return group;
  }

  function createConnection(paper, data) {
    var gfx = renderer.drawConnection(paper, data);

    var group = wrapVisual(paper, gfx, 'connection');

    return group;
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

diagramModule.type('graphicsFactory', [ 'events', 'renderer', 'snap', GraphicsFactory ]);

module.exports = GraphicsFactory;