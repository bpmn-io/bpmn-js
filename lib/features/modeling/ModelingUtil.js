'use strict';

var find = require('lodash/collection/find');


function getParents(element) {

  var parents = [];

  while (element) {
    element = element.parent;

    if (element) {
      parents.push(element);
    }
  }

  return parents;
}

module.exports.getParents = getParents;


function getSharedParent(a, b) {

  var parentsA = getParents(a),
      parentsB = getParents(b);

  return find(parentsA, function(parent) {
    return parentsB.indexOf(parent) !== -1;
  });
}

module.exports.getSharedParent = getSharedParent;