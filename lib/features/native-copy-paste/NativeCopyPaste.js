const MIME_TYPE = 'text/x-bpmn-js-clip';

import {
  domify
} from 'min-dom';


export default function NativeCopyPaste(
    canvas, keyboard, copyPaste,
    selection, moddle, clipboard,
    eventBus
) {

  const container = canvas.getContainer();

  const fakeInput = domify('<input type="text" />');

  fakeInput.style.opacity = 0;
  fakeInput.style.position = 'absolute';
  fakeInput.style.left = 0;
  fakeInput.style.top = 0;
  fakeInput.style.pointerEvents = 'none';

  container.appendChild(fakeInput);

  container.tabIndex = 1;

  eventBus.on('directEditing.deactivate', function() {

    setTimeout(function() {
      fakeInput.focus();
    });
  });

  container.addEventListener('focus', function() {

    setTimeout(function() {
      fakeInput.focus();
    });
  });

  fakeInput.addEventListener('focus', function() {
    container.style.boxShadow = 'inset 0 0 3px 2px rgba(0, 124, 255, .5)';
  });

  fakeInput.addEventListener('blur', function() {
    container.style.boxShadow = 'none';
  });

  fakeInput.addEventListener('copy', function(event) {

    const selectedElements = selection.get();

    const data = copyPaste.copySync(selectedElements);

    clipboard.clear();

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/copy_event
    event.clipboardData.setData(MIME_TYPE, JSON.stringify(data));

    event.preventDefault();
  });

  fakeInput.addEventListener('cut', function(event) {
    console.log('cut', event);
  });

  fakeInput.addEventListener('paste', function(event) {

    const serializedData = event.clipboardData.getData(MIME_TYPE);

    if (!serializedData) {
      return;
    }

    event.preventDefault();

    // parse tree, reinstantiating contained objects
    const parsedCopy = JSON.parse(serializedData, createReviver(moddle));

    // put into clipboard
    clipboard.set(parsedCopy);

    copyPaste.paste();

    clipboard.clear();
  });

  document.addEventListener('paste', function(event) {
    console.log('Document ~~> paste', event);
  });

  keyboard.bind(fakeInput);
}


// helpers /////////////

function createReviver(moddle) {

  var elCache = {};

  /**
   * The actual reviewer that creates model instances
   * for elements with a $type attribute.
   *
   * Elements with ids will be re-used, if already
   * created.
   *
   * @param  {String} key
   * @param  {Object} object
   *
   * @return {Object} actual element
   */
  return function(key, object) {

    if (typeof object === 'object' && typeof object.$type === 'string') {

      var objectId = object.id;

      if (objectId && elCache[objectId]) {
        return elCache[objectId];
      }

      var type = object.$type;
      var attrs = Object.assign({}, object);

      delete attrs.$type;

      var newEl = moddle.create(type, attrs);

      if (objectId) {
        elCache[objectId] = newEl;
      }

      return newEl;
    }

    return object;
  };
}