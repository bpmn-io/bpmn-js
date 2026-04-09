import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

export default function TextAnnotationBehavior(eventBus) {

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
}

inherits(TextAnnotationBehavior, CommandInterceptor);

TextAnnotationBehavior.$inject = [
  'eventBus'
];