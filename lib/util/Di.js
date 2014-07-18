'use strict';

module.exports.isExpandedPool = function(semantic) {
  return !!semantic.processRef;
};

module.exports.isExpanded = function(semantic) {
  return !semantic.$instanceOf('bpmn:SubProcess') || semantic.di.isExpanded;
};