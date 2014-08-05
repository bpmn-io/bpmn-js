'use strict';

var BaseAppendShapeHandler = require('diagram-js/lib/features/modeling/cmd/AppendShapeHandler');

/**
 * A bpmn-aware append shape handler
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 */
function AppendShapeHandler(modeling) {
  this._modeling = modeling;
}

AppendShapeHandler.prototype = Object.create(BaseAppendShapeHandler.prototype);

module.exports = AppendShapeHandler;

AppendShapeHandler.$inject = [ 'modeling' ];



AppendShapeHandler.prototype.postExecute = function(context) {

  this._modeling.createConnection(
    context.source,
    context.shape,
    {
      type: context.connection.type
    },
    context.source.parent);
};