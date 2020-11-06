'use strict';

var reduce = require('min-dash').reduce,
    keys = require('min-dash').keys,
    forEach = require('min-dash').forEach,
    is = require('../../../util/ModelUtil').is,
    getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;


function UpdateDataObjectHandler(elementRegistry) {
  this._elementRegistry = elementRegistry;

  UpdateDataObjectHandler.prototype.execute = function(context) {
    var dataObject = context.dataObject;

    if (!dataObject) {
      throw new Error('dataObject required');
    }

    var dataObjectReferences = getAllDataObjectReferences(
      dataObject,
      this._elementRegistry
    );

    var changed = dataObjectReferences;

    var properties = context.properties,
        oldProperties = context.oldProperties || getProperties(dataObject, keys(properties));

    setProperties(dataObject, properties);

    context.oldProperties = oldProperties;
    context.changed = changed;

    return changed;
  };

  UpdateDataObjectHandler.prototype.revert = function(context) {
    var oldProperties = context.oldProperties,
        dataObject = context.dataObject;

    setProperties(dataObject, oldProperties);

    return context.changed;
  };

  // helpers /////////////////

  function getProperties(dataObject, propertyNames) {
    return reduce(propertyNames, function(result, key) {
      result[key] = dataObject.get(key);
      return result;
    }, {});
  }

  function setProperties(dataObject, properties) {
    forEach(properties, function(value, key) {
      dataObject.set(key, value);
    });
  }

  function getAllDataObjectReferences(dataObject, elementRegistry) {
    return elementRegistry.filter(function(element) {
      return (
        is(element, 'bpmn:DataObjectReference') &&
            getBusinessObject(element).dataObjectRef === dataObject
      );
    });
  }

}

UpdateDataObjectHandler.$inject = ['elementRegistry'];

module.exports = UpdateDataObjectHandler;