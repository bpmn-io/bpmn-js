import inherits from 'inherits';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getParent } from '../util/ModelingUtil';


export default function CreateBehavior(injector) {
  injector.invoke(CommandInterceptor, this);

  this.preExecute('shape.create', 1500, function(event) {
    var context = event.context,
        parent = context.parent;

    if (is(parent, 'bpmn:Lane')) {
      context.parent = getParent(parent, 'bpmn:Participant');
    }
  });

}


CreateBehavior.$inject = [ 'injector' ];

inherits(CreateBehavior, CommandInterceptor);