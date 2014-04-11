var $ = require('jquery');

// init mouse wheel plugin
require('jquery-mousewheel')($);

module.exports = function(element) {
  return $(element);
};