'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    isArray = require('lodash/lang/isArray'),
    contains = require('lodash/collection/contains'),
    map = require('lodash/collection/map');

/**
 * A bpmn properties cloning interface
 *
 * @param  {Moddle} moddle
 */
function BpmnClone(moddle) {
  this._moddle = moddle;
}

module.exports = BpmnClone;

BpmnClone.$inject = [ 'moddle' ];


BpmnClone.prototype.clone = function(oldElement, newElement, properties) {
  var moddle = this._moddle;

  forEach(properties, function(propName) {
    var oldElementProp = oldElement.$model.properties.get(oldElement, propName),
        newElementProp = newElement.$model.properties.get(newElement, propName);

    if (newElementProp === oldElementProp) {
      return;
    }

    // if it's not an 'extensionElement' or 'documentation' just set the property
    if (!(contains([ 'bpmn:extensionElements', 'bpmn:documentation' ], propName))) {
      newElement.$model.properties.set(newElement, propName, oldElementProp);

      return;
    }

    if (propName === 'bpmn:extensionElements') {
      newElement.$model.properties.set(newElement, propName, moddle.create('bpmn:ExtensionElements', { values: [] }));

      forEach(oldElementProp.values, function(extElement) {

        var extProp = moddle.registry.typeMap[extElement.$type];

        if (extProp.meta.allowedIn && extProp.meta.allowedIn.indexOf(newElement.$type) !== -1) {

          var newProp = this._deepClone(extElement);

          newElement.extensionElements.values.push(newProp);
        }
      }, this);
    } else if (propName === 'bpmn:documentation') {
      newElement.documentation = [];

      forEach(oldElementProp, function(extElement) {
        var newProp = this._deepClone(extElement);

        newElement.documentation.push(newProp);
      }, this);
    }
  }, this);

  return newElement;
};

BpmnClone.prototype._deepClone = function _deepClone(extElement) {
  var newProp = extElement.$model.create(extElement.$type),
      properties;

  // figure out which properties we want to assign to the newElement
  // we're interested in enumerable ones (todo: double check this)
  if (isArray(extElement)) {
    properties = map(extElement, function(item) {
      return item.$type;
    });
  } else {
    properties = filter(Object.keys(extElement), function(prop) { return prop !== '$type'; });
  }

  forEach(properties, function(propName) {
    // check if the extElement has this property defined
    if (extElement[propName] !== undefined && (extElement[propName].$type || isArray(extElement[propName]))) {

      if (isArray(extElement[propName])) {
        newProp[propName] = [];

        forEach(extElement[propName], function(property) {
          newProp[propName].push(this._deepClone(property));
        }, this);

      } else if (extElement[propName].$type) {
        newProp[propName] = this._deepClone(extElement[propName]);
      }
    } else {
      // just assign directly if it's a value
      newProp[propName] = extElement[propName];
    }
  }, this);

  return newProp;
};
