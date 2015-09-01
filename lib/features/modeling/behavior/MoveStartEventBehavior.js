'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var forEach = require('lodash/collection/forEach');

var isEventSubProcess = require('../../../util/DiUtil').isEventSubProcess;

/**
 * Defines the behavior when a start event is moved
 */
function MoveStartEventBehavior(eventBus, bpmnReplace, bpmnRules, elementRegistry, selection) {
  CommandInterceptor.call(this, eventBus);

  this.postExecuted([ 'elements.move' ], function(event) {

    var context = event.context,
        target = context.newParent,
        elements = [];

    forEach(context.closure.topLevel, function(topLevelElements) {
      if (isEventSubProcess(topLevelElements)) {
        elements = elements.concat(topLevelElements.children);
      } else {
        elements = elements.concat(topLevelElements);
      }
    });

    var canReplace = bpmnRules.canReplace(elements, target);

    forEach(canReplace.replacements, function(replacements) {

      var newElement = {
        type: replacements.newElementType
      };

      var oldElement = elementRegistry.get(replacements.oldElementId);

      var idx = elements.indexOf(oldElement);
      elements[idx] = bpmnReplace.replaceElement(oldElement, newElement, { select: false });

    });

    if (canReplace.replacements) {
      selection.select(elements);
    }

  });
}

MoveStartEventBehavior.$inject = [ 'eventBus', 'bpmnReplace', 'bpmnRules', 'elementRegistry', 'selection' ];

inherits(MoveStartEventBehavior, CommandInterceptor);

module.exports = MoveStartEventBehavior;
