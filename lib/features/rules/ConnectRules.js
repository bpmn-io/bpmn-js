'use strict';

var _ = require('lodash');


function can(context) {

  var source = context.source,
      target = context.target;

  if (source.labelTarget || target.labelTarget) {
    return null;
  }

  return source.businessObject.$parent === target.businessObject.$parent &&
         source.businessObject.$instanceOf('bpmn:FlowNode') &&
        !source.businessObject.$instanceOf('bpmn:EndEvent') &&
        !target.businessObject.$instanceOf('bpmn:StartEvent') &&
         target.businessObject.$instanceOf('bpmn:FlowElement');
}

module.exports.can = can;
