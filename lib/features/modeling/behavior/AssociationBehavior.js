import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil.js';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor.js';

import {
  filter,
  forEach
} from 'min-dash';

/**
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('../Modeling.js').default} Modeling
 */

/**
 * @param {Injector} injector
 * @param {Modeling} modeling
 */
export default function AssociationBehavior(injector, modeling) {
  injector.invoke(CommandInterceptor, this);

  this.postExecute('shape.move', function(context) {
    var newParent = context.newParent,
        shape = context.shape;

    var associations = filter(shape.incoming.concat(shape.outgoing), function(connection) {
      return is(connection, 'bpmn:Association');
    });

    forEach(associations, function(association) {
      modeling.moveConnection(association, { x: 0, y: 0 }, newParent);
    });
  }, true);
}

inherits(AssociationBehavior, CommandInterceptor);

AssociationBehavior.$inject = [
  'injector',
  'modeling'
];