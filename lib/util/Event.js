function stopEvent(event) {
  var originalEvent = event.originalEvent;

  event.stopPropagation();
  event.preventDefault();

  if (originalEvent) {
    originalEvent.stopPropagation();
    originalEvent.preventDefault();
  }
}

module.exports.stopEvent = stopEvent;


function stopPropagation(event) {
  event = event.originalEvent || event;
  event.stopPropagation();
}

module.exports.stopPropagation = stopPropagation;