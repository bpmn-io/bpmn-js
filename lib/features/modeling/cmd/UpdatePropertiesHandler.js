import {
  reduce,
  keys,
  forEach,
  assign
} from 'min-dash';

import {
  getBusinessObject
} from '../../../util/ModelUtil';

import TextUtil from 'diagram-js/lib/util/Text';

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
 */
export default function UpdatePropertiesHandler(elementRegistry, moddle, translate, modeling) {
  this._elementRegistry = elementRegistry;
  this._moddle = moddle;
  this._translate = translate;
  this._modeling = modeling;

  this._textUtil = new TextUtil();
}

UpdatePropertiesHandler.$inject = [
  'elementRegistry',
  'moddle',
  'translate',
  'modeling'
];


// api //////////////////////

/**
 * Updates a BPMN element with a list of new properties
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element the element to update
 * @param {Object} context.properties a list of properties to set on the element's
 *                                    businessObject (the BPMN model element)
 *
 * @return {Array<djs.model.Base>} the updated element
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
      oldProperties = context.oldProperties || getProperties(businessObject, properties);

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
  setProperties(businessObject, properties);

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
  var newLabelBounds = getLayoutedBounds(label, text, this._textUtil);

  this._modeling.resizeShape(label, newLabelBounds, NULL_DIMENSIONS);
};

/**
 * Reverts the update on a BPMN elements properties.
 *
 * @param  {Object} context
 *
 * @return {djs.model.Base} the updated element
 */
UpdatePropertiesHandler.prototype.revert = function(context) {

  var element = context.element,
      properties = context.properties,
      oldProperties = context.oldProperties,
      businessObject = element.businessObject,
      elementRegistry = this._elementRegistry,
      ids = this._moddle.ids;

  // update properties
  setProperties(businessObject, oldProperties);

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


function getProperties(businessObject, properties) {
  var propertyNames = keys(properties);

  return reduce(propertyNames, function(result, key) {

    // handle DI seperately
    if (key !== DI) {
      result[key] = businessObject.get(key);
    } else {
      result[key] = getDiProperties(businessObject.di, keys(properties.di));
    }

    return result;
  }, {});
}


function getDiProperties(di, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = di.get(key);

    return result;
  }, {});
}


function setProperties(businessObject, properties) {
  forEach(properties, function(value, key) {

    if (key !== DI) {
      businessObject.set(key, value);
    } else {
      // only update, if businessObject.di exists
      if (businessObject.di) {
        setDiProperties(businessObject.di, value);
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
 * Make sure we unwrap the actual business object
 * behind diagram element that may have been
 * passed as arguments.
 *
 * @param  {Object} properties
 *
 * @return {Object} unwrappedProps
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


// TODO(nikku): repeating code (search for <getLayoutedBounds>)

var EXTERNAL_LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '11px'
};

function getLayoutedBounds(bounds, text, textUtil) {

  var layoutedLabelDimensions = textUtil.getDimensions(text, {
    box: {
      width: 90,
      height: 30,
      x: bounds.width / 2 + bounds.x,
      y: bounds.height / 2 + bounds.y
    },
    style: EXTERNAL_LABEL_STYLE
  });

  // resize label shape to fit label text
  return {
    x: Math.round(bounds.x + bounds.width / 2 - layoutedLabelDimensions.width / 2),
    y: Math.round(bounds.y),
    width: Math.ceil(layoutedLabelDimensions.width),
    height: Math.ceil(layoutedLabelDimensions.height)
  };
}