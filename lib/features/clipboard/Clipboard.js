'use strict';


function Clipboard() {
  this._clipboard = null;
}

Clipboard.prototype.get = function() {
  return this._clipboard;
};

Clipboard.prototype.set = function(tree) {
  this._clipboard = tree;
};

Clipboard.prototype.clear = function() {
  var oldClipboard = this._clipboard;

  this._clipboard = null;

  return oldClipboard;
};

Clipboard.prototype.isEmpty = function() {
  return !this._clipboard;
};

module.exports = Clipboard;
