'use strict';

var clone = require('lodash/lang/clone'),
    forEach = require('lodash/collection/forEach');

var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;


module.exports.set = function(mode) {
  var classList = document.body.classList;

  forEach(clone(classList), function(cls) {
    if (CURSOR_CLS_PATTERN.test(cls)) {
      classList.remove(cls);
    }
  });

  if (mode) {
    classList.add('djs-cursor-' + mode);
  }
};

module.exports.unset = function() {
  this.set(null);
};