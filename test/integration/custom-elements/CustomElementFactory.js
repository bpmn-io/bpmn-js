'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var BpmnElementFactory = require('../../../lib/features/modeling/ElementFactory'),
    LabelUtil = require('../../../lib/util/LabelUtil');


function CustomElementFactory(bpmnFactory, moddle) {
  BpmnElementFactory.call(this, bpmnFactory, moddle);

  var self = this;

  this.create = function(elementType, attrs) {
    var type = attrs.type,
        businessObject,
        size;

    if (elementType === 'label') {
      return self.baseCreate(elementType, assign({ type: 'label' }, LabelUtil.DEFAULT_LABEL_SIZE, attrs));
    }

    if (/^custom\:/.test(type)) {
      type = attrs.type.replace(/^custom\:/, '');

      businessObject = {};

      size = self._getCustomElementSize(type);

      return self.baseCreate(elementType,
        assign({ type: elementType, businessObject: businessObject }, attrs, size));
    }

    return self.createBpmnElement(elementType, attrs);
  };
}

inherits(CustomElementFactory, BpmnElementFactory);

module.exports = CustomElementFactory;

CustomElementFactory.$inject = [ 'bpmnFactory', 'moddle' ];


/**
 * Sets the *width* and *height* for custom shapes.
 *
 * The following example shows an interface on how
 * to setup the custom element's dimensions.
 *
 * @example
 *
 *  var shapes = {
 *     triangle: { width: 40, height: 40 },
 *     rectangle: { width: 100, height: 20 }
 *  };
 *
 *   return shapes[type];
 *
 *
 * @param  {String} type
 *
 * @return {Bounds} { width, height}
 */
CustomElementFactory.prototype._getCustomElementSize = function (type) {
  if (!type) {
    return { width: 100, height: 80 };
  }

  var shapes = {
    triangle: { width: 40, height: 40 },
    circle: { width: 140, height: 140 }
  };

  return shapes[type];
};
