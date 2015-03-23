'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');


function DeleteElementsHandler(modeling, elementRegistry) {
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
}

inherits(DeleteElementsHandler, require('./NoopHandler'));

DeleteElementsHandler.$inject = [ 'modeling', 'elementRegistry' ];

module.exports = DeleteElementsHandler;


DeleteElementsHandler.prototype.postExecute = function(context) {

  var modeling = this._modeling,
      elementRegistry = this._elementRegistry,
      elements = context.elements;

  forEach(elements, function(element) {

    // element may have been removed with previous
    // remove operations already (e.g. in case of nesting)
    if (!elementRegistry.get(element.id)) {
      return;
    }

    if (element.waypoints) {
      modeling.removeConnection(element);
    } else {
      modeling.removeShape(element);
    }
  });
};