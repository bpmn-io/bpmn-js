'use strict';

var _ = require('lodash');

var NoopHandler = require('./NoopHandler');


function DeleteElementsHandler(modeling, elementRegistry) {
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
}

DeleteElementsHandler.$inject = [ 'modeling', 'elementRegistry' ];

DeleteElementsHandler.prototype = Object.create(NoopHandler.prototype);

module.exports = DeleteElementsHandler;


DeleteElementsHandler.prototype.postExecute = function(context) {

  var modeling = this._modeling,
      elementRegistry = this._elementRegistry,
      elements = context.elements;

  _.forEach(elements, function(element) {

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