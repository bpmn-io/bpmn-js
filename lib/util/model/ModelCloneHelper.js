'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    isArray = require('lodash/lang/isArray'),
    contains = require('lodash/collection/contains');


function isAllowedIn(extProp, type) {
  var allowedIn = extProp.meta.allowedIn;

  // '*' is a wildcard, which means any element is allowed to use this property
  if (allowedIn.length === 1 && allowedIn[0] === '*') {
    return true;
  }

  return allowedIn.indexOf(type) !== -1;
}


function isAllowedIn(extProp, type) {
  var allowedIn = extProp.meta.allowedIn;

  // '*' is a wildcard, which means any element is allowed to use this property
  if (allowedIn.length === 1 && allowedIn[0] === '*') {
    return true;
  }

  return allowedIn.indexOf(type) !== -1;
}

/**
 * A bpmn properties cloning interface
 *
 * @param  {Moddle} moddle
 */
function ModelCloneHelper(moddle) {
  this._moddle = moddle;
}

module.exports = ModelCloneHelper;


ModelCloneHelper.prototype.clone = function(oldElement, newElement, properties) {
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

        if (extProp.meta.allowedIn && isAllowedIn(extProp, newElement.$type)) {

          var newProp = this._deepClone(extElement);

          newProp.$parent = newElement.extensionElements;

          newElement.extensionElements.values.push(newProp);
        }
      }, this);
    } else if (propName === 'bpmn:documentation') {
      newElement.documentation = [];

      forEach(oldElementProp, function(extElement) {
        var newProp = this._deepClone(extElement);

        newProp.$parent = newElement;

        newElement.documentation.push(newProp);
      }, this);
    }
  }, this);

  return newElement;
};

ModelCloneHelper.prototype._deepClone = function _deepClone(extElement) {
  var newProp = extElement.$model.create(extElement.$type),
      properties = filter(Object.keys(extElement), function(prop) { return prop !== '$type'; });

  forEach(properties, function(propName) {
    // check if the extElement has this property defined
    if (extElement[propName] !== undefined && (extElement[propName].$type || isArray(extElement[propName]))) {

      if (isArray(extElement[propName])) {
        newProp[propName] = [];

        forEach(extElement[propName], function(property) {
          var newDeepProp = this._deepClone(property);

          newDeepProp.$parent = newProp;

          newProp[propName].push(newDeepProp);
        }, this);

      } else if (extElement[propName].$type) {
        newProp[propName] = this._deepClone(extElement[propName]);

        newProp[propName].$parent = newProp;
      }
    } else {
      // just assign directly if it's a value
      newProp[propName] = extElement[propName];
    }
  }, this);

  return newProp;
};
