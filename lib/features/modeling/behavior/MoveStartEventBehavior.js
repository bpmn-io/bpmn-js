'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var forEach = require('lodash/collection').forEach;

var isInterrupting = require('../../../util/DiUtil').isInterrupting,
    isEventSubProcess = require('../../../util/DiUtil').isEventSubProcess,
    is = require('../../../util/ModelUtil').is;


/**
 * Defines the behavior when a start event is moved
 */
function MoveStartEventBehavior(eventBus, bpmnReplace) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Replaces non-interrupting StartEvents by blank interrupting StartEvents,
   * if the target is not an event sub process.
   */
  function replaceElement(element, target) {
    if (!isEventSubProcess(target)) {
      if (is(element, 'bpmn:StartEvent') && !isInterrupting(element) && element.type !== 'label') {
        bpmnReplace.replaceElement(element, { type: 'bpmn:StartEvent' });
      }
    }
  }

  this.postExecuted([ 'elements.move' ], function(event) {

    var target = event.context.newParent;

    forEach(event.context.closure.topLevel, function(topLevelElements) {

      if(isEventSubProcess(topLevelElements)) {

        forEach(topLevelElements.children, function(element) {

          replaceElement(element, target);
        });
      } else {

        forEach(topLevelElements, function(element) {

          replaceElement(element, target);
        });
      }
    });

  });

}

MoveStartEventBehavior.$inject = [ 'eventBus', 'bpmnReplace' ];

inherits(MoveStartEventBehavior, CommandInterceptor);

module.exports = MoveStartEventBehavior;
