'use strict';

var forEach = require('lodash/collection/forEach');

function getTopLevel(elements) {
  var topLevel = {},
      parents = [],
      result = [],
      clearedParents = [];

  forEach(elements, function(element) {
    var parent = element.parent;

    if (!topLevel[parent.id]) {
      topLevel[parent.id] = [];
    }

    if (parents.indexOf(parent.id) === -1) {
      parents.push(parent.id);
    }

    topLevel[parent.id].push(element);
  });

  forEach(parents, function(parent) {
    forEach(topLevel[parent], function(element) {
      if (topLevel[element.id]) {
        clearedParents.push(element.id);
      }
    });
  });

  forEach(parents, function(parent) {
    var idx = clearedParents.indexOf(parent);

    if (idx === -1) {
      result = result.concat(topLevel[parent]);
    }
  });

  return result;
}

module.exports.getTopLevel = getTopLevel;
