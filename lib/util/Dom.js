
var elementProto = Element.prototype;

// TODO(nre): remove if we drop support for PhantomJS 1.9

var matchPolyfill = function(selector) {

  var element = this;
  var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
  var i = 0;

  while (matches[i] && matches[i] !== element) {
    i++;
  }

  return matches[i] ? true : false;
};


var matchFn = elementProto.matches ||
              elementProto.mozMatchesSelector ||
              elementProto.webkitMatchesSelecor ||
              elementProto.msMatchesSelector || matchPolyfill;


/**
 * Returns true if an element matches the given selector
 *
 * @param  {Element} element
 * @param  {String} selector
 *
 * @return {Boolean}
 */
function matches(element, selector) {
  return matchFn.call(element, selector);
}

module.exports.matches = matches;


/**
 * Gets the closest parent node of the element matching the given selector
 *
 * @param  {Element} element
 * @param  {String} selector
 *
 * @return {Element} the matching parent
 */
function closest(element, selector) {
  while (element) {
    if (element instanceof Element) {
      if (matches(element, selector)) {
        return element;
      } else {
        element = element.parentNode;
      }
    } else {
      break;
    }
  }

  return null;
}

module.exports.closest = closest;


function clear(element) {
  while (element.childNodes.length) {
    element.removeChild(element.childNodes[0]);
  }
}

module.exports.clear = clear;


function on(element, type, fn, useCapture) {
  element.addEventListener(type, fn, useCapture || false);
}

module.exports.on = on;


function off(element, type, fn, useCapture) {
  element.removeEventListener(type, fn, useCapture || false);
}

module.exports.off = off;

function once(element, type, fn, useCapture) {

  var wrappedFn = function(e) {
    fn(e);

    off(element, type, wrappedFn, useCapture);
  };

  on(element, type, wrappedFn, useCapture);
}

module.exports.once = once;