import inherits from 'inherits-browser';

import { forEach, reduce } from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isEventSubProcess } from '../../../util/DiUtil';

/**
 * @typedef {import('../../replace/BpmnReplace').default} BpmnReplace
 * @typedef {import('../../rules/BpmnRules').default} BpmnRules
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('diagram-js/lib/features/selection/Selection').default} Selection
 */

/**
 * BPMN-specific replace behavior.
 *
 * @param {BpmnReplace} bpmnReplace
 * @param {BpmnRules} bpmnRules
 * @param {ElementRegistry} elementRegistry
 * @param {Injector} injector
 * @param {Modeling} modeling
 * @param {Selection} selection
 */
export default function ReplaceElementBehaviour(
    bpmnReplace,
    bpmnRules,
    elementRegistry,
    injector,
    modeling,
    selection
) {
  injector.invoke(CommandInterceptor, this);

  this._bpmnReplace = bpmnReplace;
  this._elementRegistry = elementRegistry;
  this._selection = selection;

  // replace elements on create, e.g. during copy-paste
  this.postExecuted([ 'elements.create' ], 500, function(event) {
    var context = event.context,
        target = context.parent,
        elements = context.elements;

    var elementReplacements = reduce(elements, function(replacements, element) {
      var canReplace = bpmnRules.canReplace([ element ], element.host || element.parent || target);

      return canReplace ? replacements.concat(canReplace.replacements) : replacements;
    }, []);

    if (elementReplacements.length) {
      this._replaceElements(elements, elementReplacements);
    }
  }, this);

  // replace elements on move
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

    // set target to host if attaching
    if (elements.length === 1 && newHost) {
      target = newHost;
    }

    var canReplace = bpmnRules.canReplace(elements, target);

    if (canReplace) {
      this._replaceElements(elements, canReplace.replacements, newHost);
    }
  }, this);

  // update attachments on host replace
  this.postExecute([ 'shape.replace' ], 1500, function(e) {
    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape,
        attachers = oldShape.attachers,
        canReplace;

    if (attachers && attachers.length) {
      canReplace = bpmnRules.canReplace(attachers, newShape);

      this._replaceElements(attachers, canReplace.replacements);
    }

  }, this);

  // keep ID on shape replace
  this.postExecuted([ 'shape.replace' ], 1500, function(e) {
    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    modeling.unclaimId(oldShape.businessObject.id, oldShape.businessObject);
    modeling.updateProperties(newShape, { id: oldShape.id });
  });
}

inherits(ReplaceElementBehaviour, CommandInterceptor);

ReplaceElementBehaviour.prototype._replaceElements = function(elements, newElements) {
  var elementRegistry = this._elementRegistry,
      bpmnReplace = this._bpmnReplace,
      selection = this._selection;

  forEach(newElements, function(replacement) {
    var newElement = {
      type: replacement.newElementType
    };

    var oldElement = elementRegistry.get(replacement.oldElementId);

    var idx = elements.indexOf(oldElement);

    elements[idx] = bpmnReplace.replaceElement(oldElement, newElement, { select: false });
  });

  if (newElements) {
    selection.select(elements);
  }
};

ReplaceElementBehaviour.$inject = [
  'bpmnReplace',
  'bpmnRules',
  'elementRegistry',
  'injector',
  'modeling',
  'selection'
];
