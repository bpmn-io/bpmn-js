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


ModelCloneHelper.prototype.clone = function(refElement, newElement, properties) {
  // hasNestedProperty: property allows us to avoid ending up with empty (xml) tags
  // f.ex: if extensionElements.values is empty, don't set it
  var context = {
    newElement: newElement,
    hasNestedProperty: false
  };

  // we want the extensionElements to be cloned last
  // so that they can check certain properties
  properties = sort(properties, function(prop) {
    return prop === 'bpmn:extensionElements';
  });

  forEach(properties, function(propName) {
    var refElementProp = refElement.get(propName),
        newElementProp = newElement.get(propName),
        propDescriptor = newElement.$model.getPropertyDescriptor(newElement, propName),
        newProperty, name;

    // we're not interested in cloning:
    // - same values from simple types
    // - cloning id's
    // - cloning reference elements
    if (newElementProp === refElementProp ||
       (propDescriptor && (propDescriptor.isId || propDescriptor.isReference))) {
      return;
    }

    // if the property is of type 'boolean', 'string', 'number' or 'null', just set it
    if (isType(refElementProp, [ 'boolean', 'string', 'number' ]) || refElementProp === null) {
      newElement.set(propName, refElementProp);

      return;
    }

    if (isArray(refElementProp)) {

      forEach(refElementProp, function(extElement) {
        var newProp;

        context.refTopLevelProperty = extElement;

        newProp = this._deepClone(extElement, context);

        if (context.hasNestedProperty) {
          newProp.$parent = newElement;

          newElementProp.push(newProp);
        }

        context.hasNestedProperty = false;
      }, this);

    } else {
      name = propName.replace(/bpmn:/, '');

      context.refTopLevelProperty = refElementProp;

      newProperty = this._deepClone(refElementProp, context);

      if (context.hasNestedProperty) {
        newElement[name] = newProperty;
      }

      context.hasNestedProperty = false;
    }
  }, this);

  return newElement;
};

ModelCloneHelper.prototype._deepClone = function _deepClone(propertyElement, context) {
  var eventBus = this._eventBus;

  var newProp = propertyElement.$model.create(propertyElement.$type);

  var properties = filter(Object.keys(propertyElement), function(prop) {
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
    context.hasNestedProperty = true;
  }

  forEach(properties, function(propName) {
    // check if the propertyElement has this property defined
    if (propertyElement[propName] !== undefined &&
       (propertyElement[propName].$type || isArray(propertyElement[propName]))) {

      if (isArray(propertyElement[propName])) {
        newProp[propName] = [];

        forEach(propertyElement[propName], function(property) {
          var extProp = propertyElement.$model.getTypeDescriptor(property.$type),
              newDeepProp;

          // we're not going to copy undefined types
          if (!extProp) {
            return;
          }

          var canClone = eventBus.fire('property.clone', {
            newElement: context.newElement,
            refTopLevelProperty: context.refTopLevelProperty,
            propertyDescriptor: extProp
          });

          if (!canClone) {
            // if can clone is 'undefined' or 'false'
            // check for the meta information if it is allowed
            if (propertyElement.$type === 'bpmn:ExtensionElements' &&
                extProp.meta && extProp.meta.allowedIn &&
                !isAllowedIn(extProp, context.newElement.$type)) {
              return false;
            }
          }

          newDeepProp = this._deepClone(property, context);

          newDeepProp.$parent = newProp;

          if (!newProp[propName]) {
            newProp[propName] = [];
          }

          context.hasNestedProperty = true;

          newProp[propName].push(newDeepProp);
        }, this);

      } else if (propertyElement[propName].$type) {
        newProp[propName] = this._deepClone(propertyElement[propName], context);

        if (newProp[propName]) {
          context.hasNestedProperty = true;

          newProp[propName].$parent = newProp;
        }
      }
    } else {
      context.hasNestedProperty = true;

      // just assign directly if it's a value
      newProp[propName] = propertyElement[propName];
    }
  }, this);

  return newProp;
};
