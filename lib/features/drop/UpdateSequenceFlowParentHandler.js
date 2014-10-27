'use strict';

var _ = require('lodash');

var self;
function UpdateSequenceFlowParentHandler(modeling) {

  self = this;
  this._modeling = modeling;
}

UpdateSequenceFlowParentHandler.$inject = [ 'modeling' ];

module.exports = UpdateSequenceFlowParentHandler;



UpdateSequenceFlowParentHandler.prototype.execute = function(context) {

  var shapes = context.shapes,
      target = context.target;

  _.forEach(shapes, function(shape) {
    handleFlow(shape.incoming);
    handleFlow(shape.outgoing);
  });


  function handleFlow(flows) {

    _.forEach(flows, function(flow) {
      if (shapes[flow.source.id] && shapes[flow.target.id]) {
        flow.parent = target;
      }
    });
  }
};
