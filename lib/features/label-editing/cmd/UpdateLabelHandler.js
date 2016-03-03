'use strict';

var LabelUtil = require('../LabelUtil');


/**
 * A handler that updates the text of a BPMN element.
 */
function UpdateLabelHandler() {

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

    LabelUtil.setLabel(label, text, labelTarget !== label);

    return [ label, labelTarget ];
  }

  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }

  // API

  this.execute = execute;
  this.revert = revert;
}

module.exports = UpdateLabelHandler;