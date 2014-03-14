var Snap = require('snapsvg'),
    IdGenerator = require('../util/IdGenerator'),
    shapeUtil = require('../util/shapeUtil'),
    _ = require('lodash');

/**
 * @type djs.ShapeDescriptor
 */

/**
 * @class
 *
 * @emits Canvas#canvas.init
 */
function Canvas(config, events, commandStack, svgFactory, shapes) {
  'use strict';

  var options = _.extend({}, { width: '100%', height: '100%' }, config.canvas || {});

  var ids = new IdGenerator('s');

  var paper = Snap.createSnapAt(options.width, options.height, options.container);

  // holds id -> { element, gfx } mappings
  var elementMap = {};

  // Todo remove addShape/addConnection from public API?
  // should only be called over command stack
  (function registerCommands() {
    commandStack.register('addShape', {
      do: function addShapeDo(shape) {
        internalAddShape(shape);
        return true;
      },
      undo: function addShapeUndo(shape) {
        internalUndoAddShape(shape);
        return true;
      },
      canDo: function canUndoShape() {
        return true;
      }
    });
    commandStack.register('moveShape', {
      do: function moveShapeDo(param) {
        var dragCtx = param.event.dragCtx;
        if(dragCtx) {
          _.forEach(dragCtx.allDraggedGfx, function(gfx) {
            //Update Viewport
            var actualTMatrix = gfx.transform().local;
            gfx.attr({
              transform: actualTMatrix + (actualTMatrix ? 'T' : 't') + [dragCtx.dx, dragCtx.dy]
            });
            //Update model
            var model = shapes.getShapeByGraphics(gfx);
            shapeUtil.translateShape(model, dragCtx.dx, dragCtx.dy);
          });
        }
        return true;
      },
      undo: function moveShapeUndo(param) {
        var dragCtx = param.event.dragCtx;
        if(dragCtx) {
          _.forEach(dragCtx.allDraggedGfx, function(gfx) {
            //Update Viewport
            var actualTMatrix = gfx.transform().local;
            gfx.attr({
              transform: actualTMatrix + (actualTMatrix ? 'T' : 't') + [(-1)*dragCtx.dx, (-1)*dragCtx.dy]
            });
            //Update model
            var model = shapes.getShapeByGraphics(gfx);
            shapeUtil.translateShape(model,(-1)*dragCtx.dx, (-1)*dragCtx.dy);
          });
        }
        return true;
      },
      canDo: function canUndoMoveShape() {
        return true;
      }
    });
  })();

  /**
   * Only register shape in Canvas' ElementMap.
   */
  function checkId(e, gfx) {
    if (!e.id) {
      e.id = ids.next();
    }
  }

  /**
   * Add shape to DOM
   */
  function addChild(parent, child) {
    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [ child ];
    }
  }

  function internalAddShape(shape) {

    var gfx = svgFactory.createShape(paper, shape);

    checkId(shape, gfx);
    
    if (shape.parent) {
      addChild(shape.parent, shape);
    }

    /**
     * An event indicating that a new shape has been added to the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.added
     * @type {Object}
     * @property {djs.ElementDescriptor} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    events.fire('shape.added', { element: shape, gfx: gfx });
  }

  function internalUndoAddShape(shape) {
    var gfx = getGraphics(shape);
    gfx.remove();

    events.fire('shape.removed', { element: shape, gfx: gfx });
  }

  /**
   * Adds a shape to the canvas
   *
   * @method Canvas#addShape
   *
   * @param {djs.ShapeDescriptor} shape a descriptor for the shape
   *
   * @return {Canvas} the canvas api
   */
  function addShape(param) {
    commandStack.execute('addShape', param);
    return this;
  }

  /**
   * Adds a connection to the canvas
   *
   * @method Canvas#addConnection
   * 
   * @param {djs.ElementDescriptor} connection a descriptor for the connection
   * 
   * @return {Canvas} the canvas api
   */
  function addConnection(connection) {
    var gfx = svgFactory.createConnection(paper, connection);

    checkId(connection, gfx);

    /**
     * An event indicating that a new connection has been added to the canvas.
     *
     * @memberOf Canvas
     * 
     * @event connection.added
     * @type {Object}
     * @property {djs.ElementDescriptor} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    events.fire('connection.added', { element: connection, gfx: gfx });

    // for chaining of API calls
    return this;
  }

  /**
   * Sends a shape to the front.
   *
   * This method takes parent / child relationships between shapes into account
   * and makes sure that children are properly handled, too.
   *
   * @method Canvas#sendToFront
   * 
   * @param {djs.ElementDescriptor} shape descriptor of the shape to be sent to front
   * @param {boolean} bubble=true whether to send parent shapes to front, too
   */
  function sendToFront(shape, bubble) {

    if (bubble !== false) {
      bubble = true;
    }

    if (bubble && shape.parent) {
      sendToFront(shape.parent);
    }

    if (shape.children) {
      shape.children.forEach(function(child) {
        sendToFront(child, false);
      });
    }

    var gfx = getGraphics(shape),
        gfxParent = gfx.parent();

    gfx.remove().appendTo(gfxParent);
  }

  /**
   * Return the graphical object underlaying a certain diagram element
   *
   * @method Canvas#getGraphics
   * 
   * @param {djs.ElementDescriptor} element descriptor of the element
   */
  function getGraphics(element) {
    return shapes.getGraphicsByShape(element);
  }

  /**
   * Returns the actual graphics context.
   *
   * @returns {snapsvg.Paper} the global paper object
   */
  function getContext() {
    return paper;
  }

  /**
   * Add event listener to paper.
   */
  function addListener(id, eventListener) {
    paper.node.addEventListener(id, eventListener);
  }

  /**
   * Remove event from paper.
   */
  function removeListener(id, eventListener) {
    paper.node.removeEventListener(id, eventListener);
  }

  events.on('diagram.init', function(event) {
    
    /**
     * An event indicating that the canvas is ready to be drawn on.
     *
     * @memberOf Canvas
     * 
     * @event canvas.init
     * 
     * @type {Object}
     * @property {snapsvg.Paper} paper the initialized drawing paper
     */
    events.fire('canvas.init', { paper: paper });
  });

  return {
    addShape: addShape,
    addConnection: addConnection,
    getContext: getContext,
    getGraphics: getGraphics,
    sendToFront: sendToFront,
    addListener: addListener,
    removeListener: removeListener
  };
}

Canvas.$inject = ['config', 'events', 'commandStack', 'svgFactory', 'shapes'];

module.exports = Canvas;