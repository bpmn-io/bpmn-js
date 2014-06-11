'use strict';

/**
 * A handler that updates the text a BPMN element.
 *
 * @param {EventBus} eventBus
 * @param {BpmnRegistry} bpmnRegistry
 * @param {ElementRegistry} elementRegistry
 */
function UpdateTextHandler(eventBus, bpmnRegistry, elementRegistry) {

  function setText(element, text) {

    var semantic = bpmnRegistry.getSemantic(element);

    if (semantic.$instanceOf('bpmn:TextAnnotation')) {
      semantic.text = text;
    }

    if (semantic.$instanceOf('bpmn:FlowElement')) {
      semantic.name = text;
    }

    eventBus.fire('shape.changed', { element: element.label || element });
  }

  function execute(ctx) {
    setText(ctx.element, ctx.newText);
  }

  function revert(ctx) {
    setText(ctx.element, ctx.oldText);
  }


  function canExecute(ctx) {
    return true;
  }

  // API

  this.execute = execute;
  this.revert = revert;

  this.canExecute = canExecute;
}


UpdateTextHandler.$inject = [ 'eventBus', 'bpmnRegistry' ];

module.exports = UpdateTextHandler;