'use strict';

var LabelUtil = require('../LabelUtil');


/**
 * A handler that updates the text a BPMN element.
 *
 * @param {EventBus} eventBus
 */
function UpdateTextHandler(eventBus) {

  function setText(element, text) {

    var semantic = element.businessObject;

    LabelUtil.setLabel(semantic, text);

    eventBus.fire('element.changed', { element: element.label || element });
  }

  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element.businessObject);
    setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    setText(ctx.element, ctx.oldLabel);
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