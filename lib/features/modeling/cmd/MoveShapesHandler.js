'use strict';

var _ = require('lodash');

var Elements = require('../../../util/Elements');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapesHandler(modeling) {
  this._modeling = modeling;
}

MoveShapesHandler.$inject = [ 'modeling' ];

module.exports = MoveShapesHandler;


MoveShapesHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling;

  _.forEach(context.shapes, function(shape) {
    modeling.moveShape(shape, context.delta, context.newParent, context.hints);
  });
};


MoveShapesHandler.prototype.execute = function(context) { };
MoveShapesHandler.prototype.revert = function(context) { };
