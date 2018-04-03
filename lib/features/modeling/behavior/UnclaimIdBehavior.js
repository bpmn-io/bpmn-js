import {
  forEach
} from 'min-dash';

import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';


/**
 * Unclaims model IDs on element deletion.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function UnclaimIdBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute('elements.delete', function(event) {
    var context = event.context,
        elements = context.elements;

    forEach(elements, function(element) {
      modeling.unclaimId(element.businessObject.id, element.businessObject);
    });

  });
}

inherits(UnclaimIdBehavior, CommandInterceptor);

UnclaimIdBehavior.$inject = [ 'eventBus', 'modeling' ];