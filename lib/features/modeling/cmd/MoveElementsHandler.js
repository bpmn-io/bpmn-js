'use strict';

var MoveHelper = require('./helper/MoveHelper');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveElementsHandler(modeling) {
  this._helper = new MoveHelper(modeling);
}

MoveElementsHandler.$inject = [ 'modeling' ];

module.exports = MoveElementsHandler;

MoveElementsHandler.prototype.preExecute = function(context) {
  context.closure = this._helper.getClosure(context.shapes);
};

MoveElementsHandler.prototype.postExecute = function(context) {
  this._helper.moveClosure(context.closure, context.delta, context.newParent, context.newHost);
};


MoveElementsHandler.prototype.execute = function(context) { };
MoveElementsHandler.prototype.revert = function(context) { };
