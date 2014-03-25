require('../core/Shapes');

var _ = require('lodash'),
    selfAndAllChildren = require('../util/shapeUtil').selfAndAllChildren,
    setParent = require('../util/shapeUtil').setParent;


/**
 * Implements re- and undoable movement of shapes and their
 * related graphical representations.
 *
 * @param {Shapes} shapes
 */
function MoveShapesHandler(shapeRegistry) {

  function getAllMovedShapes(shapes) {
    var allShapes = selfAndAllChildren(shapes);
    var idMap = {};

    _.forEach(allShapes, function(s) {
      var id = s.id;

      idMap[s.id] = s;
    });

    return {
      shapes: allShapes,
      byId: idMap
    };
  }

  /**
   * Executes a move shape operation
   */
  function execute(ctx) {

    var dx = ctx.dx,
        dy = ctx.dy,
        shapes = ctx.shapes,
        newParent = ctx.newParent;

    var oldParents = {};

    var all = getAllMovedShapes(shapes);

    _.forEach(all.shapes, function(s) {
      var newX = s.x + dx,
          newY = s.y + dy,
          sid = s.id;

      s.x = newX;
      s.y = newY;

      if (s.parent && all.byId[s.parent.id]) {
        oldParents[sid] = s.parent;
      } else {
        oldParents[sid] = setParent(s, newParent);
      }

      var gfx = shapeRegistry.getGraphicsByShape(s);
      gfx.translate(newX, newY);

      if (s.parent) {
        var parentGfx = shapeRegistry.getGraphicsByShape(s.parent);
        gfx.insertAfter(parentGfx);
      }
    });

    // remember previous parents
    // TODO(nre): is this a good idea?
    ctx.oldParents = oldParents;

    return true;
  }

  /**
   * Reverts a move shape operation
   */
  function revert(ctx) {
    
    var dx = ctx.dx * -1,
        dy = ctx.dy * -1,
        shapes = ctx.shapes,
        oldParents = ctx.oldParents;


    var all = getAllMovedShapes(shapes);

    _.forEach(all.shapes, function(s) {
      var newX = s.x + dx,
          newY = s.y + dy;

      s.x = newX;
      s.y = newY;

      setParent(s, oldParents[s.id]);

      var gfx = shapeRegistry.getGraphicsByShape(s);
      gfx.translate(newX, newY);
    });

    return true;
  }

  /**
   * Can move be executed?
   */
  function canExecute(ctx) {
    return true;
  }


  // API
  
  this.execute = execute;
  this.revert = revert;

  this.canExecute = canExecute;
}


MoveShapesHandler.$inject = ['shapes'];

// export
module.exports = MoveShapesHandler;