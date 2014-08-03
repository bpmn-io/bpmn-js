'use strict';

var _ = require('lodash');

var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;


module.exports.set = function(mode) {
  var classList = document.body.classList;

  _.forEach(_.clone(classList), function(cls) {
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