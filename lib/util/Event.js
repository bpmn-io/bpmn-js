function stopEvent(event) {
  event = event.originalEvent || event;

  event.stopPropagation();
  event.preventDefault();
}

module.exports.stopEvent = stopEvent;