import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import { isLabel } from '../../../util/LabelUtil';

import { getBBox } from 'diagram-js/lib/util/Elements';

import {
  assign,
  find
} from 'min-dash';

import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';

var HORIZONTAL_PARTICIPANT_PADDING = 20,
    VERTICAL_PARTICIPANT_PADDING = 20;

export var PARTICIPANT_BORDER_WIDTH = 30;

var HIGH_PRIORITY = 2000;


/**
 * BPMN-specific behavior for creating participants.
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

  function ensureCollaboration(context) {
    var parent = context.parent,
        collaboration;

    var rootElement = canvas.getRootElement();

    if (is(rootElement, 'bpmn:Collaboration')) {
      collaboration = rootElement;
    } else {

      // update root element by making collaboration
      collaboration = modeling.makeCollaboration();

      // re-use process when creating first participant
      context.process = parent;
    }

    context.parent = collaboration;
  }

  // turn process into collaboration before adding participant
  this.preExecute('shape.create', function(context) {
    var parent = context.parent,
        shape = context.shape;

    if (is(shape, 'bpmn:Participant') && is(parent, 'bpmn:Process')) {
      ensureCollaboration(context);
    }
  }, true);

  this.execute('shape.create', function(context) {
    var process = context.process,
        shape = context.shape;

    if (process) {
      context.oldProcessRef = shape.businessObject.processRef;

      // re-use process when creating first participant
      shape.businessObject.processRef = process.businessObject;
    }
  }, true);

  this.revert('shape.create', function(context) {
    var process = context.process,
        shape = context.shape;

    if (process) {

      // re-use process when creating first participant
      shape.businessObject.processRef = context.oldProcessRef;
    }
  }, true);

  this.postExecute('shape.create', function(context) {
    var process = context.process,
        shape = context.shape;

    if (process) {

      // move children from process to participant
      var processChildren = process.children.slice();

      modeling.moveElements(processChildren, { x: 0, y: 0 }, shape);
    }

  }, true);

  // turn process into collaboration when creating participants
  this.preExecute('elements.create', HIGH_PRIORITY, function(context) {
    var elements = context.elements,
        parent = context.parent,
        participant;

    var hasParticipants = findParticipant(elements);

    if (hasParticipants && is(parent, 'bpmn:Process')) {
      ensureCollaboration(context);

      participant = findParticipant(elements);

      context.oldProcessRef = participant.businessObject.processRef;

      // re-use process when creating first participant
      participant.businessObject.processRef = parent.businessObject;
    }
  }, true);

  this.revert('elements.create', function(context) {
    var elements = context.elements,
        process = context.process,
        participant;

    if (process) {
      participant = findParticipant(elements);

      // re-use process when creating first participant
      participant.businessObject.processRef = context.oldProcessRef;
    }
  }, true);

  this.postExecute('elements.create', function(context) {
    var elements = context.elements,
        process = context.process,
        participant;

    if (process) {
      participant = findParticipant(elements);

      // move children from process to first participant
      var processChildren = process.children.slice();

      modeling.moveElements(processChildren, { x: 0, y: 0 }, participant);
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

function isConnection(element) {
  return !!element.waypoints;
}

function findParticipant(elements) {
  return find(elements, function(element) {
    return is(element, 'bpmn:Participant');
  });
}