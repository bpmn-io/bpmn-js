'use strict';


/**
 * Service that allow replacing of elements.
 *
 *
 * @class
 * @constructor
 */
function Replace(modeling) {

  this._modeling = modeling;
}

module.exports = Replace;

Replace.$inject = [ 'modeling' ];

/**
 * @param {Element} oldElement - Element to be replaced
 * @param {Object}  newElementData - Containing information about the new Element, for example height, width, type.
 * @param {Object}  options - Custom options that will be attached to the context. It can be used to inject data
 *                            that is needed in the command chain. For example it could be used in
 *                            eventbus.on('commandStack.shape.replace.postExecute') to change shape attributes after
 *                            shape creation.
 */
Replace.prototype.replaceElement = function(oldElement, newElementData, options) {

  var modeling = this._modeling;

  var newElement = null;

  if (oldElement.waypoints) {
    // TODO
    // modeling.replaceConnection
  } else {
    // set center of element for modeling API
    // if no new width / height is given use old elements size
    newElementData.x = oldElement.x + (newElementData.width || oldElement.width) / 2;
    newElementData.y = oldElement.y + (newElementData.height || oldElement.height) / 2;

    newElement = modeling.replaceShape(oldElement, newElementData, options);
  }

  return newElement;
};
