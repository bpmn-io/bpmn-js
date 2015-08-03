'use strict';

function createKeyEvent(element, code, ctrlKey) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;
  e.ctrlKey = ctrlKey;

  return e;
}

module.exports.createKeyEvent = createKeyEvent;
