'use strict';

var forEach = require('min-dash').forEach;

/**
 * These are the properties that should be ignored when cloning elements.
 *
 * @type {Array}
 */
module.exports.IGNORED_PROPERTIES = [
  'lanes',
  'incoming',
  'outgoing',
  'artifacts',
  'default',
  'flowElements',
  'dataInputAssociations',
  'dataOutputAssociations'
];


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
