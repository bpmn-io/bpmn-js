'use strict';

var _ = require('lodash');


function hasTarget(context) {
  return !!context.target;
}

/**
 * Do not allow to drop shapes into any it's (sub) child
 */
function preventChild(context) {

  var sources = context.source,
      target  = context.target;


  var can = _.every(sources, function(source) {

    var descendants = {};

    function collectDescendants(element) {

      var children = element.children;

      _.forEach(children, function(child) {
        collectDescendants(child);
      });
      descendants[element.id] = element;
    }
    collectDescendants(source);

    return !descendants[target.id];
  });

  return can;
}


/**
 * Do not drop onto connections
 */
function preventConnection(context) {

  var target = context.target;

  if (!!target.target) {
    return false;
  } else {
    return true;
  }
}

module.exports.hasTarget = hasTarget;
module.exports.preventChild = preventChild;
