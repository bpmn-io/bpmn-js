'use strict';

function isExpandedPool(semantic) {
  return !!semantic.processRef;
}

function isExpanded(semantic, di) {
  return di.isExpanded;
}

module.exports.isExpandedPool = isExpandedPool;
module.exports.isExpanded = isExpanded;