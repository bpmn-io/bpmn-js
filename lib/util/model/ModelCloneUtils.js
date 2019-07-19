import {
  forEach
} from 'min-dash';


/**
 * These are the properties that should be ignored when cloning elements.
 *
 * @type {Array}
 */
export var IGNORED_PROPERTIES = [
  'artifacts',
  'dataInputAssociations',
  'dataOutputAssociations',
  'default',
  'flowElements',
  'incoming',
  'lanes',
  'outgoing'
];


export function getProperties(descriptor, keepDefault) {
  var properties = [];

  forEach(descriptor.properties, function(property) {

    if (keepDefault && property.default) {
      return;
    }

    properties.push(property.ns.name);
  });

  return properties;
}