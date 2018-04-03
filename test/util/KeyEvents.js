export function createKeyEvent(element, code, ctrlKey) {
  var e = document.createEvent('Events') || new document.defaultView.CustomEvent('keyEvent');

  e.keyCode = code;
  e.which = code;
  e.ctrlKey = ctrlKey;

  return e;
}
