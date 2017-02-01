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

  // this property allows us to avoid ending up with empty (xml) tags
  // f.ex: if extensionElements.values is empty, don't set it
  this._hasNestedProperty = false;

  // we want the extensionElements to be cloned last
  // so that they can check certain properties
  properties = sort(properties, function(prop) {
    return prop === 'bpmn:extensionElements';
  });

  forEach(properties, function(propName) {
    var oldElementProp = oldElement.get(propName),
        newElementProp = newElement.get(propName),
        propDescriptor = newElement.$model.getPropertyDescriptor(newElement, propName),
        newProperty, name;

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

        if (this._hasNestedProperty) {
          newProp.$parent = newElement;

          newElementProp.push(newProp);
        }

        this._hasNestedProperty = false;
      }, this);

    } else {
      name = propName.replace(/bpmn:/, '');

      newProperty = this._deepClone(oldElementProp);

      if (this._hasNestedProperty) {
        newElement[name] = newProperty;
      }

      this._hasNestedProperty = false;
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

  if (!properties.length) {
    this._hasNestedProperty = true;
  }

  forEach(properties, function(propName) {
    // check if the element has this property defined
    if (element[propName] !== undefined && (element[propName].$type || isArray(element[propName]))) {

      if (isArray(element[propName])) {

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

          if (!newProp[propName]) {
            newProp[propName] = [];
          }

          this._hasNestedProperty = true;

          newProp[propName].push(newDeepProp);
        }, this);

      } else if (element[propName].$type) {
        newProp[propName] = this._deepClone(element[propName]);

        if (newProp[propName]) {
          this._hasNestedProperty = true;

          newProp[propName].$parent = newProp;
        }
      }
    } else {
      this._hasNestedProperty = true;

      // just assign directly if it's a value
      newProp[propName] = element[propName];
    }
  }, this);

  return newProp;
};
