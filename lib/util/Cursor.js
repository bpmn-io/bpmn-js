'use strict';

var domClasses = require('min-dom/lib/classes');

var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;


module.exports.set = function(mode) {
  var classes = domClasses(document.body);

  classes.removeMatching(CURSOR_CLS_PATTERN);

  if (mode) {
    classes.add('djs-cursor-' + mode);
  }
};

module.exports.unset = function() {
  this.set(null);
};

module.exports.has = function(mode) {
  var classes = domClasses(document.body);

  return classes.has('djs-cursor-' + mode);
};
