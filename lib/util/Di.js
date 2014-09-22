'use strict';

module.exports.isExpandedPool = function(semantic) {
  return !!semantic.processRef;
};

module.exports.isExpanded = function(semantic) {

  // Is type expanded by default?
  var isDefaultExpanded = !(semantic.$instanceOf('bpmn:SubProcess') || semantic.$instanceOf('bpmn:CallActivity'));

  // For non default expanded types -> evaluate the expanded flag
  var isExpanded = isDefaultExpanded || semantic.di.isExpanded;

  return isExpanded;
};
