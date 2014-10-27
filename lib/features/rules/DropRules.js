'use strict';

var _ = require('lodash');

function validateSubProcess(context) {

  var target = context.target,
      shapes = context.shape,
      di     = target.businessObject.di;

  // can't drop anything to a collapsed subprocess
  if (!di.isExpanded) {
    return false;
  }

  // Elements that can't be dropped to a subprocess
  _.forEach(shapes, function(shape) {
    if (_.contains(['bpmn:Participant', 'bpmn:Lane'], shape.type)) {
      return false;
    }
  });

  return true;
}

module.exports.validateSubProcess = validateSubProcess;
