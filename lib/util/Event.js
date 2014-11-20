
module.exports.stopEvent = function(e) {
  (event.originalEvent || event).stopPropagation();
};