'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var forEach = require('lodash/collection/forEach');

var isEventSubProcess = require('../../../util/DiUtil').isEventSubProcess;

/**
 * Defines the behavior when a start event is moved
 */
function MoveStartEventBehavior(eventBus, bpmnReplace, bpmnRules, elementRegistry) {

  CommandInterceptor.call(this, eventBus);

  this.postExecuted([ 'elements.move' ], function(event) {

    var target = event.context.newParent,
        elements = [];

    forEach(event.context.closure.topLevel, function(topLevelElements) {
      if (isEventSubProcess(topLevelElements)) {
        elements = elements.concat(topLevelElements.children);
      } else {
        elements = elements.concat(topLevelElements);
      }
    });

    var canReplace = bpmnRules.canReplace(elements, target);

    forEach(canReplace.replace, function(newElementData) {
      var newElement = {
        type: newElementData.type
      };

      bpmnReplace.replaceElement(elementRegistry.get(newElementData.id), newElement);
    });
  });
}

MoveStartEventBehavior.$inject = [ 'eventBus', 'bpmnReplace', 'bpmnRules', 'elementRegistry' ];

inherits(MoveStartEventBehavior, CommandInterceptor);

module.exports = MoveStartEventBehavior;
