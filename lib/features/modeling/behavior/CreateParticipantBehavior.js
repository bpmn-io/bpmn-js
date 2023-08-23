import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getBusinessObject, is } from '../../../util/ModelUtil';

import { isLabel } from '../../../util/LabelUtil';

import { getBBox } from 'diagram-js/lib/util/Elements';

import {
  assign,
  find
} from 'min-dash';

import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';

import { isConnection } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

var HORIZONTAL_PARTICIPANT_PADDING = 20,
    VERTICAL_PARTICIPANT_PADDING = 20;

export var PARTICIPANT_BORDER_WIDTH = 30;

var HIGH_PRIORITY = 2000;


/**
 * BPMN-specific behavior for creating participants.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function CreateParticipantBehavior(canvas, eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  // fit participant
  eventBus.on([
    'create.start',
    'shape.move.start'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    if (!is(shape, 'bpmn:Participant') ||
      !is(rootElement, 'bpmn:Process') ||
      !rootElement.children.length) {
      return;
    }

    // ignore connections, groups and labels
    var children = rootElement.children.filter(function(element) {
      return !is(element, 'bpmn:Group') &&
        !isLabel(element) &&
        !isConnection(element);
    });

    // ensure for available children to calculate bounds
    if (!children.length) {
      return;
    }

    var childrenBBox = getBBox(children);

    var participantBounds = getParticipantBounds(shape, childrenBBox);

    // assign width and height
    assign(shape, participantBounds);

    // assign create constraints
    context.createConstraints = getParticipantCreateConstraints(shape, childrenBBox);
  });

  // force hovering process when creating first participant
  eventBus.on('create.start', HIGH_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement(),
        rootElementGfx = canvas.getGraphics(rootElement);

    function ensureHoveringProcess(event) {
      event.element = rootElement;
      event.gfx = rootElementGfx;
    }

    if (is(shape, 'bpmn:Participant') && is(rootElement, 'bpmn:Process')) {
      eventBus.on('element.hover', HIGH_PRIORITY, ensureHoveringProcess);

      eventBus.once('create.cleanup', function() {
        eventBus.off('element.hover', ensureHoveringProcess);
      });
    }
  });

  // turn process into collaboration when creating first participant
  function getOrCreateCollaboration() {
    var rootElement = canvas.getRootElement();

    if (is(rootElement, 'bpmn:Collaboration')) {
      return rootElement;
    }

    return modeling.makeCollaboration();
  }

  // when creating mutliple elements through `elements.create` parent must be set to collaboration
  // and passed to `shape.create` as hint
  this.preExecute('elements.create', HIGH_PRIORITY, function(context) {
    var elements = context.elements,
        parent = context.parent,
        participant = findParticipant(elements),
        hints;

    if (participant && is(parent, 'bpmn:Process')) {
      context.parent = getOrCreateCollaboration();

      hints = context.hints = context.hints || {};

      hints.participant = participant;
      hints.process = parent;
      hints.processRef = getBusinessObject(participant).get('processRef');
    }
  }, true);

  // when creating single shape through `shape.create` parent must be set to collaboration
  // unless it was already set through `elements.create`
  this.preExecute('shape.create', function(context) {
    var parent = context.parent,
        shape = context.shape;

    if (is(shape, 'bpmn:Participant') && is(parent, 'bpmn:Process')) {
      context.parent = getOrCreateCollaboration();

      context.process = parent;
      context.processRef = getBusinessObject(shape).get('processRef');
    }
  }, true);

  // #execute necessary because #preExecute not called on CommandStack#redo
  this.execute('shape.create', function(context) {
    var hints = context.hints || {},
        process = context.process || hints.process,
        shape = context.shape,
        participant = hints.participant;

    // both shape.create and elements.create must be handled
    if (process && (!participant || shape === participant)) {

      // monkey-patch process ref
      getBusinessObject(shape).set('processRef', getBusinessObject(process));
    }
  }, true);

  this.revert('shape.create', function(context) {
    var hints = context.hints || {},
        process = context.process || hints.process,
        processRef = context.processRef || hints.processRef,
        shape = context.shape,
        participant = hints.participant;

    // both shape.create and elements.create must be handled
    if (process && (!participant || shape === participant)) {

      // monkey-patch process ref
      getBusinessObject(shape).set('processRef', processRef);
    }
  }, true);

  this.postExecute('shape.create', function(context) {
    var hints = context.hints || {},
        process = context.process || context.hints.process,
        shape = context.shape,
        participant = hints.participant;

    if (process) {
      var children = process.children.slice();

      // both shape.create and elements.create must be handled
      if (!participant) {
        modeling.moveElements(children, { x: 0, y: 0 }, shape);
      } else if (shape === participant) {
        modeling.moveElements(children, { x: 0, y: 0 }, participant);
      }
    }
  }, true);
}

CreateParticipantBehavior.$inject = [
  'canvas',
  'eventBus',
  'modeling'
];

inherits(CreateParticipantBehavior, CommandInterceptor);

// helpers //////////

function getParticipantBounds(shape, childrenBBox) {
  childrenBBox = {
    width: childrenBBox.width + HORIZONTAL_PARTICIPANT_PADDING * 2 + PARTICIPANT_BORDER_WIDTH,
    height: childrenBBox.height + VERTICAL_PARTICIPANT_PADDING * 2
  };

  var width = Math.max(shape.width, childrenBBox.width),
      height = Math.max(shape.height, childrenBBox.height);

  return {
    x: -width / 2,
    y: -height / 2,
    width: width,
    height: height
  };
}

function getParticipantCreateConstraints(shape, childrenBBox) {
  childrenBBox = asTRBL(childrenBBox);

  return {
    bottom: childrenBBox.top + shape.height / 2 - VERTICAL_PARTICIPANT_PADDING,
    left: childrenBBox.right - shape.width / 2 + HORIZONTAL_PARTICIPANT_PADDING,
    top: childrenBBox.bottom - shape.height / 2 + VERTICAL_PARTICIPANT_PADDING,
    right: childrenBBox.left + shape.width / 2 - HORIZONTAL_PARTICIPANT_PADDING - PARTICIPANT_BORDER_WIDTH
  };
}

function findParticipant(elements) {
  return find(elements, function(element) {
    return is(element, 'bpmn:Participant');
  });
}