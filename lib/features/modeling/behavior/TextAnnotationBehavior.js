import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import { getLabel } from '../../../util/LabelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../../../draw/TextRenderer').default} TextRenderer
 */

export default function TextAnnotationBehavior(eventBus, textRenderer) {

  CommandInterceptor.call(this, eventBus);

  // On Append, TextAnnotations will be created on the Root.
  // The default for connections will create the connection in the parent of
  // the source element, so we overwrite the parent here.
  this.preExecute('connection.create', function(context) {
    const { target } = context;

    if (!is(target, 'bpmn:TextAnnotation')) {
      return;
    }

    context.parent = target.parent;
  }, true);

  this.preExecute([ 'shape.create', 'shape.resize', 'elements.move' ], function(context) {
    const shapes = context.shapes || [ context.shape ];

    if (shapes.length === 1 && is(shapes[0], 'bpmn:TextAnnotation')) {
      context.hints = context.hints || {};

      context.hints.autoResize = false;
    }
  }, true);

  // snap annotation height to text content, preserving user-chosen width
  this.preExecute('shape.resize', function(event) {
    var context = event.context,
        shape = context.shape,
        hints = context.hints || {};

    if (!is(shape, 'bpmn:TextAnnotation') || hints.autoResize) {
      return;
    }

    var newBounds = context.newBounds;
    var resizeBounds = textRenderer.getTextAnnotationBounds(newBounds, getLabel(shape) || '');

    // anchor to bottom edge only when the top edge moved AND the bottom edge stayed
    // (i.e. a user drag from the top handle), not for programmatic repositioning
    var topEdgeMoved = newBounds.y !== shape.y &&
      Math.abs((newBounds.y + newBounds.height) - (shape.y + shape.height)) <= 1;
    var bottom = shape.y + shape.height;

    context.newBounds = {
      width: resizeBounds.width,
      height: resizeBounds.height,
      x: newBounds.x,
      y: topEdgeMoved ? bottom - resizeBounds.height : newBounds.y
    };
  });
}

inherits(TextAnnotationBehavior, CommandInterceptor);

TextAnnotationBehavior.$inject = [
  'eventBus',
  'textRenderer'
];