'use strict';


var _ = require('lodash');


/**
 * Implements re- and undoable addition of connections to the diagram
 *
 * @param {EventBus} events
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} shapes
 */
function AddConnectionHandler(events, graphicsFactory, shapes) {

  var paper;

  /**
   * Execute add
   */
  function execute(ctx) {

    var connection = ctx.connection;

    var gfx = graphicsFactory.createConnection(paper, connection);

    events.fire('connection.changed', { element: connection, gfx: gfx });
    events.fire('connection.added', { element: connection, gfx: gfx });

    return gfx;
  }


  /**
   * Execute revert
   */
  function revert(ctx) {

    var connection = ctx.connection,
        gfx = shapes.getGraphicsByElement(connection);

    events.fire('connection.removed', { element: connection, gfx: gfx });

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


AddConnectionHandler.$inject = ['eventBus', 'graphicsFactory', 'elementRegistry'];

// export
module.exports = AddConnectionHandler;