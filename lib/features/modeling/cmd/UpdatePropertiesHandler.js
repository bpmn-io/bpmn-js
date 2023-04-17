import {
  reduce,
  keys,
  forEach,
  assign
} from 'min-dash';

import {
  getBusinessObject,
  getDi
} from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 * @typedef {import('diagram-js/lib/command/CommandStack').CommandContext} CommandContext
 *
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../../model/Types').Moddle} Moddle
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('../../../draw/TextRenderer').default} TextRenderer
 *
 * @typedef {import('../../../model/Types').Element} Element
 */

var DEFAULT_FLOW = 'default',
    ID = 'id',
    DI = 'di';

var NULL_DIMENSIONS = {
  width: 0,
  height: 0
};

/**
 * A handler that implements a BPMN 2.0 property update.
 *
 * This should be used to set simple properties on elements with
 * an underlying BPMN business object.
 *
 * Use respective diagram-js provided handlers if you would
 * like to perform automated modeling.
 *
 * @implements {CommandHandler}
 *
 * @param {ElementRegistry} elementRegistry
 * @param {Moddle} moddle
 * @param {Translate} translate
 * @param {Modeling} modeling
 * @param {TextRenderer} textRenderer
 */
export default function UpdatePropertiesHandler(
    elementRegistry, moddle, translate,
    modeling, textRenderer) {

  this._elementRegistry = elementRegistry;
  this._moddle = moddle;
  this._translate = translate;
  this._modeling = modeling;
  this._textRenderer = textRenderer;
}

UpdatePropertiesHandler.$inject = [
  'elementRegistry',
  'moddle',
  'translate',
  'modeling',
  'textRenderer'
];


// api //////////////////////

/**
 * Update a BPMN element's properties.
 *
 * @param { {
 *   element: Element;
 *   properties: Record<string, any>;
 * } & CommandContext } context
 *
 * @return {Element[]}
 */
UpdatePropertiesHandler.prototype.execute = function(context) {

  var element = context.element,
      changed = [ element ],
      translate = this._translate;

  if (!element) {
    throw new Error(translate('element required'));
  }

  var elementRegistry = this._elementRegistry,
      ids = this._moddle.ids;

  var businessObject = element.businessObject,
      properties = unwrapBusinessObjects(context.properties),
      oldProperties = context.oldProperties || getProperties(element, properties);

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(businessObject[ID]);

    elementRegistry.updateId(element, properties[ID]);

    ids.claim(properties[ID], businessObject);
  }

  // correctly indicate visual changes on default flow updates
  if (DEFAULT_FLOW in properties) {

    if (properties[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(properties[DEFAULT_FLOW].id));
    }

    if (businessObject[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(businessObject[DEFAULT_FLOW].id));
    }
  }

  // update properties
  setProperties(element, properties);

  // store old values
  context.oldProperties = oldProperties;
  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};


UpdatePropertiesHandler.prototype.postExecute = function(context) {
  var element = context.element,
      label = element.label;

  var text = label && getBusinessObject(label).name;

  if (!text) {
    return;
  }

  // get layouted text bounds and resize external
  // external label accordingly
  var newLabelBounds = this._textRenderer.getExternalLabelBounds(label, text);

  this._modeling.resizeShape(label, newLabelBounds, NULL_DIMENSIONS);
};

/**
 * Revert updating a BPMN element's properties.
 *
 * @param { {
 *   element: Element;
 *   properties: Record<string, any>;
 *   oldProperties: Record<string, any>;
 * } & CommandContext } context
 *
 * @return {Element[]}
 */
UpdatePropertiesHandler.prototype.revert = function(context) {

  var element = context.element,
      properties = context.properties,
      oldProperties = context.oldProperties,
      businessObject = element.businessObject,
      elementRegistry = this._elementRegistry,
      ids = this._moddle.ids;

  // update properties
  setProperties(element, oldProperties);

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(properties[ID]);

    elementRegistry.updateId(element, oldProperties[ID]);

    ids.claim(oldProperties[ID], businessObject);
  }

  return context.changed;
};


function isIdChange(properties, businessObject) {
  return ID in properties && properties[ID] !== businessObject[ID];
}


function getProperties(element, properties) {
  var propertyNames = keys(properties),
      businessObject = element.businessObject,
      di = getDi(element);

  return reduce(propertyNames, function(result, key) {

    // handle DI separately
    if (key !== DI) {
      result[key] = businessObject.get(key);

    } else {
      result[key] = getDiProperties(di, keys(properties.di));
    }

    return result;
  }, {});
}


function getDiProperties(di, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = di && di.get(key);

    return result;
  }, {});
}


function setProperties(element, properties) {
  var businessObject = element.businessObject,
      di = getDi(element);

  forEach(properties, function(value, key) {

    if (key !== DI) {
      businessObject.set(key, value);
    } else {

      // only update, if di exists
      if (di) {
        setDiProperties(di, value);
      }
    }
  });
}


function setDiProperties(di, properties) {
  forEach(properties, function(value, key) {
    di.set(key, value);
  });
}


var referencePropertyNames = [ 'default' ];

/**
 * Make sure we unwrap the actual business object behind diagram element that
 * may have been passed as arguments.
 *
 * @param  {Record<string, any>} properties
 *
 * @return {Record<string, any>} unwrappedProps
 */
function unwrapBusinessObjects(properties) {

  var unwrappedProps = assign({}, properties);

  referencePropertyNames.forEach(function(name) {
    if (name in properties) {
      unwrappedProps[name] = getBusinessObject(unwrappedProps[name]);
    }
  });

  return unwrappedProps;
}