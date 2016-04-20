'use strict';

var forEach = require('lodash/collection/forEach');


function DescriptorTree(tree) {

  this._tree = {};
  this._length = 0;

  forEach(tree, function(branch, depth) {
    if (branch.length) {
      this._length += 1;
    }

    forEach(branch, function(element) {

      element.depth = parseInt(depth, 10);

      this._tree[element.id] = element;
    }, this);

  }, this);
}

module.exports = DescriptorTree;

DescriptorTree.prototype.getLength = function() {
  return this._length;
};

DescriptorTree.prototype.getElement = function(id) {
  return this._tree[id];
};

DescriptorTree.prototype.getDepth = function(depth) {
  var newTree = {};

  forEach(this._tree, function(element) {
    if (element.depth === depth) {
      newTree[element.id] = element;
    }
  });

  return newTree;
};

DescriptorTree.prototype.getDepthLength = function(depth) {
  var length = 0;

  forEach(this._tree, function(element) {
    if (element.depth === depth) {
      length += 1;
    }
  });

  return length;
};
