export function createKeyEvent(element, key, ctrlKey) {
  var e = document.createEvent('Events') || new document.defaultView.CustomEvent('keyEvent');

  e.key = key;
  e.keyCode = key;
  e.which = key;
  e.ctrlKey = ctrlKey;

  return e;
}
