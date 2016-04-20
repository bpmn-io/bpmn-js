'use strict';


function Clipboard() {
  this._clipboard = {};
}

Clipboard.prototype.get = function() {
  return this._clipboard;
};

Clipboard.prototype.set = function(tree) {
  this._clipboard = tree;
};

Clipboard.prototype.clear = function() {
  var oldClipboard = this._clipboard;

  this._clipboard = {};

  return oldClipboard;
};

Clipboard.prototype.isEmpty = function() {
  return Object.keys(this._clipboard).length === 0;
};

module.exports = Clipboard;
