import {
  setLabel,
  getLabel
} from '../LabelUtil';

import {
  hasExternalLabel
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
        newBounds = ctx.newBounds;

    // ignore internal labels for elements except text annotations
    if (!hasExternalLabel(element) && !is(element, 'bpmn:TextAnnotation')) {
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
      newBounds = textRenderer.getLayoutedBounds(label, text);
    }

    // setting newBounds to false or _null_ will
    // disable the postExecute resize operation
    if (newBounds) {
      modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
    }
  }

  // API

  this.execute = execute;
  this.revert = revert;
  this.postExecute = postExecute;
}

UpdateLabelHandler.$inject = [
  'modeling',
  'textRenderer'
];