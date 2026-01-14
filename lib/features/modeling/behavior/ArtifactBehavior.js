import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  is
} from '../../../util/ModelUtil';
import { forEach } from 'min-dash';

/**
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 * @typedef {import('../../../Modeler').default} Modeler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('../Modeling').default} Modeling
 */

var HIGH_PRIORITY = 1500;

/**
 * BPMN specific artifact behavior.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {Modeler} bpmnjs
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Injector} injector
 * @param {Modeling} modeling
 */
export default function ArtifactBehavior(
    bpmnFactory,
    bpmnjs,
    elementRegistry,
    eventBus,
    injector,
    modeling
) {
  injector.invoke(CommandInterceptor, this);

  this.preExecute('shape.delete', HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Participant') && !is(shape, 'bpmn:SubProcess')) {
      return;
    }

    modeling.removeElements(getRelevantArtifacts(shape));
  });

  // Handles artifacts on participants
  eventBus.on('shape.move.start', function(event) {
    let shape = event.shape;

    if (!is(shape, 'bpmn:Participant') && !is(shape, 'bpmn:SubProcess')) {
      return;
    }

    event.context.shapes.push(...getRelevantArtifacts(shape));
  });

  function calculateOverlappingArea(child, possibleParent) {
    const overlapWidth = Math.max(0, Math.min((child.x + child.width), (possibleParent.x + possibleParent.width)) - Math.max(child.x, possibleParent.x));
    const overlapHeight = Math.max(0, Math.min((child.y + child.height), (possibleParent.y + possibleParent.height)) - Math.max(child.y, possibleParent.y));

    return overlapWidth * overlapHeight;
  }

  function isAssociatedTextAnnotation(shape, possibleParticipants) {
    if (shape.type !== 'bpmn:TextAnnotation') {
      return false;
    }
    let possibleAssociatedElements = possibleParticipants.flatMap((participant) => participant.children).flatMap((element) => element.id),
        incomingElements = shape.incoming.flatMap((shape) => shape.businessObject.sourceRef.id);


    return incomingElements.some(el =>
      possibleAssociatedElements.includes(el)
    );
  }

  function getRelevantArtifacts(shape) {

    // when swimminglanes / participants were placed shape.businessObject.processRef has no mor artifacts because the bpmn:Collaboration has it

    let relevantArtifacts = [],
        parent = shape.parent,
        allPossibleElements = getAllPossibleElements(parent),
        possibleParticipants = getPossibleContainer(parent, allPossibleElements),
        possibleArtifacts = getPossibleArtifacts(parent, allPossibleElements);

    forEach(possibleArtifacts, function(currentShape) {

      let participantCounter = 0,
          curOverlap = calculateOverlappingArea(shape, currentShape.bounds ?? shape);

      if (isAssociatedTextAnnotation (currentShape, possibleParticipants)) {
        relevantArtifacts.push(currentShape);
        return;
      }

      // should not be moved
      if (isAssociatedAssociation(currentShape)) {
        return;
      }

      if (curOverlap <= 0) {
        return;
      }
      possibleParticipants.forEach(function(participant) {

        if (participantCounter >= 2) {
          return;
        }
        participantCounter = calculateOverlappingArea(currentShape.bounds, participant) === (currentShape.bounds?.height * currentShape.bounds?.width) ? participantCounter + 1 : participantCounter;
      });

      if (participantCounter === 1) {
        relevantArtifacts.push(getElementFromChildren(parent, currentShape.id));
      }
    });

    return relevantArtifacts;
  }

  function isAssociatedAssociation(shape) {
    return shape.type === 'bpmn:Association' || shape.$type === 'bpmndi:BPMNEdge';
  }

  function getPossibleContainer(parent) {
    return parent.children.filter(isContainer);
  }

  function getPossibleArtifacts(parent, possibleElements) {

    let artifacts = parent.businessObject?.artifacts ?? parent.di.$parent?.bpmnElement?.artifacts ?? [];
    artifacts = artifacts.flatMap((artifact) => `${artifact.id}_di`);
    return possibleElements.filter((element) => artifacts.includes(element.id));
  }

  function getAllPossibleElements(parent) {
    let diagram = getDiagram(parent);

    // return parent.businessObject.$parent.diagrams[0].plane;
    return diagram.diagrams[0].plane.planeElement;
  }

  function isContainer(shape) {
    return is(shape, 'bpmn:Participant') || is(shape, 'bpmn:SubProcess');
  }

  function getDiagram(parent) {
    let next = parent?.businessObject?.$parent ?? parent.$parent;
    if (next.$type === 'bpmn:Definitions' || (next.$type === 'bpmn:Collaboration' && !next.$parent)) {
      return next;
    } else {
      return getDiagram(next);
    }
  }

  function getElementFromChildren(parent, shapeId) {
    let filteredChildren = parent.children.filter(child => child.di.id === shapeId),
        result =
          filteredChildren.length > 0
            ? filteredChildren
            : getRootImpl(parent).children.filter(child => child.di.id === shapeId);

    return result.at(0);
  }

  function getRootImpl(parent) {
    while (parent.parent && parent.type !== 'bpmn:Collaboration') {
      parent = parent.parent;
    }
    return parent;
  }
}

inherits(ArtifactBehavior, CommandInterceptor);

ArtifactBehavior.$inject = [
  'bpmnFactory',
  'bpmnjs',
  'elementRegistry',
  'eventBus',
  'injector',
  'modeling'
];