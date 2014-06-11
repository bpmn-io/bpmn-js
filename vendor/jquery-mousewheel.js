'use strict';

var $;

if (!window.$) {
  $ = require('jquery');
  require('../node_modules/jquery-mousewheel')($);
}

module.exports = window.$ || $;