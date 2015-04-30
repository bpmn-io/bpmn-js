'use strict';


/**
 * A provider for BPMN 2.0 elements context pad
 */
function ContextPadProvider(contextPad, bpmnjs) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._bpmnjs = bpmnjs;
}

ContextPadProvider.$inject = [
  'contextPad',
  'bpmnjs'
];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  return {
    'sayHi': {
      group: 'edit',
      className: 'icon-trash',
      action: {
        click: function(event) {
          window.alert('hi from context pad!');
        }
      }
    }
  };
};


module.exports = ContextPadProvider;
