'use strict';

var LabelUtil = require('../LabelUtil');


/**
 * A handler that updates the text of a BPMN element.
 *
 * @param {EventBus} eventBus
 */
function UpdateTextHandler(eventBus) {

  function setText(element, text) {
    var label = LabelUtil.setLabel(element, text);

    eventBus.fire('element.changed', { element: label });
  }

  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }


  function canExecute(ctx) {
    return true;
  }

  // API

  this.execute = execute;
  this.revert = revert;

  this.canExecute = canExecute;
}


UpdateTextHandler.$inject = [ 'eventBus' ];

module.exports = UpdateTextHandler;