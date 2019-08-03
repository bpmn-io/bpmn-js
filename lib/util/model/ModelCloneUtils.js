import {
  forEach
} from 'min-dash';


/**
 * References to one or many model elements that will be ignored when copying a model element.
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