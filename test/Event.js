var _ = require('lodash');

function Event() {}

module.exports = Event;

Event.prototype.stopPropagation = function() {
  this._stopped = true;
};

Event.prototype.preventDefault = function() {
  this._defaultPrevented = true;
};


module.exports.createEvent = function(attrs) {
  return _.extend(new Event(), attrs);
};