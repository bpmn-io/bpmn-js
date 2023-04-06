import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getDi } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * BPMN specific behavior ensuring that bpmndi:Label's dc:Bounds are removed
 * when shape is resized.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function RemoveEmbeddedLabelBoundsBehavior(eventBus, modeling) {
  CommandInterceptor.call(this, eventBus);

  this.preExecute('shape.resize', function(context) {
    var shape = context.shape;

    var di = getDi(shape),
        label = di && di.get('label'),
        bounds = label && label.get('bounds');

    if (bounds) {
      modeling.updateModdleProperties(shape, label, {
        bounds: undefined
      });
    }
  }, true);
}

inherits(RemoveEmbeddedLabelBoundsBehavior, CommandInterceptor);

RemoveEmbeddedLabelBoundsBehavior.$inject = [
  'eventBus',
  'modeling'
];