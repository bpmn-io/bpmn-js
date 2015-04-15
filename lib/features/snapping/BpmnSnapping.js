'use strict';

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox;

/**
 * BPMN specific snapping functionality
 *
 *  * snap on process elements if a pool is created inside a
 *    process diagram
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function BpmnSnapping(eventBus, canvas) {

  /**
   * Drop articipant on process <> process elements snapping
   */

  function initParticipantSnapping(context, shape, elements) {

    if (!elements.length) {
      return;
    }

    var snapBox = getBoundingBox(elements.filter(function(e) {
      return !e.labelTarget && !e.waypoints;
    }));

    snapBox.x -= 50;
    snapBox.y -= 20;
    snapBox.width += 70;
    snapBox.height += 40;

    // adjust shape height to include bounding box
    shape.width = Math.max(shape.width, snapBox.width);
    shape.height = Math.max(shape.height, snapBox.height);

    context.participantSnapBox = snapBox;
  }

  function snapParticipant(snapBox, shape, event) {

    var shapeHalfWidth = shape.width / 2 - 30,
        shapeHalfHeight = shape.height / 2;

    var currentTopLeft = {
      x: event.x - shapeHalfWidth - 30,
      y: event.y - shapeHalfHeight
    };

    var currentBottomRight = {
      x: event.x + shapeHalfWidth + 30,
      y: event.y + shapeHalfHeight
    };

    var snapTopLeft = snapBox,
        snapBottomRight = {
          x: snapBox.x + snapBox.width,
          y: snapBox.y + snapBox.height
        };

    if (currentTopLeft.x >= snapTopLeft.x) {
      event.x = snapTopLeft.x + 30 + shapeHalfWidth;
      event.snapping = true;
    } else
    if (currentBottomRight.x <= snapBottomRight.x) {
      event.x = snapBottomRight.x - 30 - shapeHalfWidth;
      event.snapping = true;
    }

    if (currentTopLeft.y >= snapTopLeft.y) {
      event.y = snapTopLeft.y + shapeHalfHeight;
      event.snapping = true;
    } else
    if (currentBottomRight.y <= snapBottomRight.y) {
      event.y = snapBottomRight.y - shapeHalfHeight;
      event.snapping = true;
    }
  }

  eventBus.on('create.start', function(event) {

    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    // snap participant around existing elements (if any)
    if (shape.businessObject.$instanceOf('bpmn:Participant') &&
        rootElement.businessObject.$instanceOf('bpmn:Process')) {

      initParticipantSnapping(context, shape, rootElement.children);
    }
  });

  eventBus.on([ 'create.move', 'create.end' ], 1500, function(event) {

    var context = event.context,
        shape = context.shape,
        participantSnapBox = context.participantSnapBox;

    if (!event.snapping && participantSnapBox) {
      snapParticipant(participantSnapBox, shape, event);
    }
  });
}

BpmnSnapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = BpmnSnapping;