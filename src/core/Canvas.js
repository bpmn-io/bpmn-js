var Snap = require('snapsvg'),
    IdGenerator = require('../util/IdGenerator'),
    _ = require('../util/underscore');

/**
 * @type djs.ShapeDescriptor
 */

/**
 * @class
 *
 * @emits Canvas#canvas.init
 */
function Canvas(config, events, commandStack, svgFactory) {
  //'use strict';

  var ids = new IdGenerator('s');

  var paper = Snap.createSnapAt(config.canvas.width,
                              config.canvas.height,
                              config.canvas.container);

  // holds id -> { element, gfx } mappings
  var elementMap = {};

  // Todo remove addShape/addConnection from public API?
  // should only be called over command stack
  (function registerCommands() {
    commandStack.register('addShape', {
      do: function addShapeDo(param) {
        internalAddShape(param);
        return true;
      },
      undo: function addShapeUndo(param) {
        internalUndoAddShape(param.id);
        return true;
      },
      canDo: function canUndoShape() {
        return true;
      }
    });
  })();

  function addElement(e, gfx) {
    if (!e.id) {
      e.id = ids.next();
    }

    elementMap[e.id] = { element: e, gfx: gfx };
  }

  function addChild(parent, child) {
    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [ child ];
    }
  }

  function internalAddShape(shape) {
    'use strict';

    var gfx = svgFactory.createShape(paper, shape);

    if (shape.parent) {
      addChild(shape.parent, shape);
    }

    addElement(shape, gfx);

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

  function internalUndoAddShape(id) {
    events.fire('shape.removed', { element: elementMap[id].element});
    elementMap[id].gfx.remove();
    delete elementMap[id];
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

    addElement(connection, gfx);

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
    return elementMap[element.id].gfx;
  }

  /**
   * Returns the actual graphics context.
   *
   * @returns {snapsvg.Paper} the global paper object
   */
  function getContext() {
    return paper;
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
    sendToFront: sendToFront
  };
}

Canvas.$inject = ['config', 'events', 'commandStack', 'svgFactory'];

module.exports = Canvas;