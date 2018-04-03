import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  forEach
} from 'min-dash';

import {
  isEventSubProcess
} from '../../../util/DiUtil';

import { is } from '../../../util/ModelUtil';


/**
 * Defines the behaviour of what happens to the elements inside a container
 * that morphs into another BPMN element
 */
export default function ReplaceElementBehaviour(
    eventBus, bpmnReplace, bpmnRules,
    elementRegistry, selection, modeling) {

  CommandInterceptor.call(this, eventBus);

  this._bpmnReplace = bpmnReplace;
  this._elementRegistry = elementRegistry;
  this._selection = selection;
  this._modeling = modeling;

  this.postExecuted([ 'elements.move' ], 500, function(event) {

    var context = event.context,
        target = context.newParent,
        newHost = context.newHost,
        elements = [];

    forEach(context.closure.topLevel, function(topLevelElements) {
      if (isEventSubProcess(topLevelElements)) {
        elements = elements.concat(topLevelElements.children);
      } else {
        elements = elements.concat(topLevelElements);
      }
    });

    // Change target to host when the moving element is a `bpmn:BoundaryEvent`
    if (elements.length === 1 && newHost) {
      target = newHost;
    }

    var canReplace = bpmnRules.canReplace(elements, target);

    if (canReplace) {
      this.replaceElements(elements, canReplace.replacements, newHost);
    }
  }, this);

  // update attachments if the host is replaced
  this.postExecute([ 'shape.replace' ], 1500, function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape,
        attachers = oldShape.attachers,
        canReplace;

    if (attachers && attachers.length) {
      canReplace = bpmnRules.canReplace(attachers, newShape);

      this.replaceElements(attachers, canReplace.replacements);
    }

  }, this);

  this.postExecuted([ 'shape.replace' ], 1500, function(e) {
    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    modeling.unclaimId(oldShape.businessObject.id, oldShape.businessObject);
    modeling.updateProperties(newShape, { id: oldShape.id });
  });
}

inherits(ReplaceElementBehaviour, CommandInterceptor);


ReplaceElementBehaviour.prototype.replaceElements = function(elements, newElements, newHost) {
  var elementRegistry = this._elementRegistry,
      bpmnReplace = this._bpmnReplace,
      selection = this._selection,
      modeling = this._modeling;

  forEach(newElements, function(replacement) {

    var newElement = {
      type: replacement.newElementType
    };

    var oldElement = elementRegistry.get(replacement.oldElementId);

    if (newHost && is(oldElement, 'bpmn:BoundaryEvent')) {
      modeling.updateAttachment(oldElement, null);
    }

    var idx = elements.indexOf(oldElement);

    elements[idx] = bpmnReplace.replaceElement(oldElement, newElement, { select: false });

    if (newHost && is(elements[idx], 'bpmn:BoundaryEvent')) {
      modeling.updateAttachment(elements[idx], newHost);
    }
  });

  if (newElements) {
    selection.select(elements);
  }
};

ReplaceElementBehaviour.$inject = [
  'eventBus',
  'bpmnReplace',
  'bpmnRules',
  'elementRegistry',
  'selection',
  'modeling'
];
