import {
  setLabel,
  getLabel
} from '../LabelUtil';

import {
  getExternalLabelMid,
  isLabelExternal,
  hasExternalLabel,
  isLabel
} from '../../../util/LabelUtil';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

var NULL_DIMENSIONS = {
  width: 0,
  height: 0
};


/**
 * A handler that updates the text of a BPMN element.
 */
export default function UpdateLabelHandler(modeling, textRenderer) {

  /**
   * Set the label and return the changed elements.
   *
   * Element parameter can be label itself or connection (i.e. sequence flow).
   *
   * @param {djs.model.Base} element
   * @param {String} text
   */
  function setText(element, text) {

    // external label if present
    var label = element.label || element;

    var labelTarget = element.labelTarget || element;

    setLabel(label, text, labelTarget !== label);

    return [ label, labelTarget ];
  }

  function preExecute(ctx) {
    var element = ctx.element,
        businessObject = element.businessObject,
        newLabel = ctx.newLabel;

    if (!isLabel(element)
        && isLabelExternal(element)
        && !hasExternalLabel(element)
        && !isEmptyText(newLabel)) {

      // create label
      var paddingTop = 7;

      var labelCenter = getExternalLabelMid(element);

      labelCenter = {
        x: labelCenter.x,
        y: labelCenter.y + paddingTop
      };

      modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject
      });
    }
  }

  function execute(ctx) {
    ctx.oldLabel = getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }

  function postExecute(ctx) {
    var element = ctx.element,
        label = element.label || element,
        newLabel = ctx.newLabel,
        newBounds = ctx.newBounds,
        hints = ctx.hints || {};

    if (isLabel(label) && isEmptyText(newLabel)) {

      if (hints.removeShape !== false) {
        modeling.removeShape(label, { unsetLabel: false });
      }

      return;
    }

    // ignore internal labels for elements except text annotations
    if (!isLabelExternal(element) && !is(element, 'bpmn:TextAnnotation')) {
      return;
    }

    var bo = getBusinessObject(label);

    var text = bo.name || bo.text;

    // don't resize without text
    if (!text) {
      return;
    }

    // resize element based on label _or_ pre-defined bounds
    if (typeof newBounds === 'undefined') {
      newBounds = textRenderer.getExternalLabelBounds(label, text);
    }

    // setting newBounds to false or _null_ will
    // disable the postExecute resize operation
    if (newBounds) {
      modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
    }
  }

  // API

  this.preExecute = preExecute;
  this.execute = execute;
  this.revert = revert;
  this.postExecute = postExecute;
}

UpdateLabelHandler.$inject = [
  'modeling',
  'textRenderer'
];


// helpers ///////////////////////

function isEmptyText(label) {
  return !label || !label.trim();
}