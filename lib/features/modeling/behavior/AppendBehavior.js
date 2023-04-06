import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

export default function AppendBehavior(eventBus) {

  CommandInterceptor.call(this, eventBus);

  // assign correct shape position unless already set

  this.preExecute('shape.append', function(context) {

    var source = context.source,
        shape = context.shape;

    if (!context.position) {

      if (is(shape, 'bpmn:TextAnnotation')) {
        context.position = {
          x: source.x + source.width / 2 + 75,
          y: source.y - 50 - shape.height / 2
        };
      } else {
        context.position = {
          x: source.x + source.width + 80 + shape.width / 2,
          y: source.y + source.height / 2
        };
      }
    }
  }, true);
}

inherits(AppendBehavior, CommandInterceptor);

AppendBehavior.$inject = [
  'eventBus'
];