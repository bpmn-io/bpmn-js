import inherits from 'inherits';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  filter,
  forEach
} from 'min-dash';


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