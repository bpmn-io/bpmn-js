
var elementProto = Element.prototype;

var matchFn = elementProto.matches ||
              elementProto.mozMatchesSelector ||
              elementProto.webkitMatchesSelecor ||
              elementProto.msMatchesSelector;


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


function on(element, type, fn) {
  element.addEventListener(type, fn);
}

module.exports.on = on;


function off(element, type, fn) {
  element.removeEventListener(type, fn);
}

module.exports.off = off;