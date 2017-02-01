'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    any = require('lodash/collection/any'),
    sort = require('lodash/collection/sortBy'),
    isArray = require('lodash/lang/isArray');

var IGNORED_PROPERTIES = require('./ModelCloneUtils').IGNORED_PROPERTIES;

function isAllowedIn(extProp, type) {
  var allowedIn = extProp.meta.allowedIn;

  // '*' is a wildcard, which means any element is allowed to use this property
  if (allowedIn.length === 1 && allowedIn[0] === '*') {
    return true;
  }

  return allowedIn.indexOf(type) !== -1;
}

function isType(element, types) {
  return any(types, function(type) {
    return typeof element === type;
  });
}

/**
 * A bpmn properties cloning interface
 *
 */
function ModelCloneHelper(eventBus) {
  this._eventBus = eventBus;
}

module.exports = ModelCloneHelper;


ModelCloneHelper.prototype.clone = function(oldElement, newElement, properties) {
  this._newElement = newElement;

  // we want the extensionElements to be cloned last
  // so that they can check certain properties
  properties = sort(properties, function(prop) {
    return prop === 'bpmn:extensionElements';
  });

  forEach(properties, function(propName) {
    var oldElementProp = oldElement.get(propName),
        newElementProp = newElement.get(propName),
        propDescriptor = newElement.$model.getPropertyDescriptor(newElement, propName),
        name;

    // we're not interested in cloning:
    // - same values from simple types
    // - cloning id's
    // - cloning reference elements
    if (newElementProp === oldElementProp ||
       (propDescriptor && (propDescriptor.isId || propDescriptor.isReference))) {
      return;
    }

    // if the property is of type 'boolean', 'string', 'number' or 'null', just set it
    if (isType(oldElementProp, [ 'boolean', 'string', 'number' ]) || oldElementProp === null) {
      newElement.set(propName, oldElementProp);

      return;
    }

    if (isArray(oldElementProp)) {

      forEach(oldElementProp, function(extElement) {
        var newProp = this._deepClone(extElement);

        newProp.$parent = newElement;

        newElementProp.push(newProp);
      }, this);
    } else {
      name = propName.replace(/bpmn:/, '');

      newElement[name] = this._deepClone(oldElementProp);
    }
  }, this);

  return newElement;
};

ModelCloneHelper.prototype._deepClone = function _deepClone(element) {
  var eventBus = this._eventBus;

  var newElement = this._newElement;

  var newProp = element.$model.create(element.$type);

  var properties = filter(Object.keys(element), function(prop) {
    var descriptor = newProp.$model.getPropertyDescriptor(newProp, prop);

    if (descriptor && (descriptor.isId || descriptor.isReference)) {
      return false;
    }

    // we need to make sure we don't clone certain properties
    // which we cannot easily know if they hold references or not
    if (IGNORED_PROPERTIES.indexOf(prop) !== -1) {
      return false;
    }

    // make sure we don't copy the type
    return prop !== '$type';
  });

  forEach(properties, function(propName) {
    // check if the element has this property defined
    if (element[propName] !== undefined && (element[propName].$type || isArray(element[propName]))) {

      if (isArray(element[propName])) {
        newProp[propName] = [];

        forEach(element[propName], function(property) {
          var extProp = element.$model.getTypeDescriptor(property.$type),
              newDeepProp;

          // we're not going to copy undefined types
          if (!extProp) {
            return;
          }

          var canClone = eventBus.fire('property.clone', {
            newElement: newElement,
            propertyDescriptor: extProp
          });

          if (!canClone) {
            // if can clone is 'undefined' or 'false'
            // check for the meta information if it is allowed
            if (element.$type === 'bpmn:ExtensionElements' &&
                extProp.meta && extProp.meta.allowedIn &&
                !isAllowedIn(extProp, newElement.$type)) {
              return false;
            }
          }

          newDeepProp = this._deepClone(property);

          newDeepProp.$parent = newProp;

          newProp[propName].push(newDeepProp);
        }, this);

      } else if (element[propName].$type) {
        newProp[propName] = this._deepClone(element[propName]);

        newProp[propName].$parent = newProp;
      }
    } else {
      // just assign directly if it's a value
      newProp[propName] = element[propName];
    }
  }, this);

  return newProp;
};
