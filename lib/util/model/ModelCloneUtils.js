'use strict';

var forEach = require('lodash/collection/forEach');

function getProperties(descriptor, keepDefault) {
  var properties = [];

  forEach(descriptor.properties, function(property) {

    if (keepDefault && property.default) {
      return;
    }
    
    properties.push(property.ns.name);
  });

  return properties;
}

module.exports.getProperties = getProperties;
