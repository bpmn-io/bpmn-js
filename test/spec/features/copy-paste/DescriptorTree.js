var forEach = require('min-dash').forEach;


export default function DescriptorTree(tree) {

  var self = this;

  this._tree = {};
  this._length = 0;

  forEach(tree, function(branch, depth) {
    if (branch.length) {
      self._length += 1;
    }

    forEach(branch, function(element) {

      element.depth = parseInt(depth, 10);

      self._tree[element.id] = element;
    });

  });
}

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
