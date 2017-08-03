'use strict';

/**
 * A example context pad provider.
 */
function ExampleContextPadProvider(connect, contextpad, modeling) {
  this._connect = connect;
  this._modeling = modeling;

  contextpad.registerProvider(this);
}

ExampleContextPadProvider.prototype.getContextPadEntries = function(element) {
  var connect = this._connect,
      modeling = this._modeling;

  function removeElement() {
    modeling.removeElements([ element ]);
  }

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  return {
    'delete': {
      group: 'edit',
      className: 'context-pad-icon-remove',
      title: 'Remove',
      action: {
        click: removeElement,
        dragstart: removeElement
      }
    },
    'connect': {
      group: 'edit',
      className: 'context-pad-icon-connect',
      title: 'Connect',
      action: {
        click: startConnect,
        dragstart: startConnect
      }
    }
  };
};

ExampleContextPadProvider.$inject = [ 'connect', 'contextPad', 'modeling' ];

module.exports = ExampleContextPadProvider;