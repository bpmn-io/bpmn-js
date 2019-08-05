import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import { isLabel } from '../../../util/LabelUtil';

import { getBBox } from 'diagram-js/lib/util/Elements';

import { assign } from 'min-dash';

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

  // turn process into collaboration before adding participant
  this.preExecute('shape.create', function(context) {
    var parent = context.parent,
        shape = context.shape,
        position = context.position;

    var rootElement = canvas.getRootElement();

    if (
      is(parent, 'bpmn:Process') &&
      is(shape, 'bpmn:Participant') &&
      !is(rootElement, 'bpmn:Collaboration')
    ) {

      // this is going to detach the process root
      // and set the returned collaboration element
      // as the new root element
      var collaborationElement = modeling.makeCollaboration();

      // monkey patch the create context
      // so that the participant is being dropped
      // onto the new collaboration root instead
      context.position = position;
      context.parent = collaborationElement;

      context.processRoot = parent;
    }
  }, true);

  this.execute('shape.create', function(context) {
    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {
      context.oldProcessRef = shape.businessObject.processRef;

      // assign the participant processRef
      shape.businessObject.processRef = processRoot.businessObject;
    }
  }, true);

  this.revert('shape.create', function(context) {
    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {

      // assign the participant processRef
      shape.businessObject.processRef = context.oldProcessRef;
    }
  }, true);

  this.postExecute('shape.create', function(context) {
    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {

      // process root is already detached at this point
      var processChildren = processRoot.children.slice();

      modeling.moveElements(processChildren, { x: 0, y: 0 }, shape);
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

  return {
    width: Math.max(shape.width, childrenBBox.width),
    height: Math.max(shape.height, childrenBBox.height)
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