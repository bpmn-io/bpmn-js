'use strict';

var MoveHelper = require('./helper/MoveHelper');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapesHandler(modeling) {
  this._helper = new MoveHelper(modeling);
}

MoveShapesHandler.$inject = [ 'modeling' ];

module.exports = MoveShapesHandler;

MoveShapesHandler.prototype.preExecute = function(context) {
  context.closure = this._helper.getClosure(context.shapes);
};

MoveShapesHandler.prototype.postExecute = function(context) {
  this._helper.moveClosure(context.closure, context.delta, context.newParent, context.newHost);
};


MoveShapesHandler.prototype.execute = function(context) { };
MoveShapesHandler.prototype.revert = function(context) { };
