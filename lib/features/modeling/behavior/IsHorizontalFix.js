import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject
} from '../../../util/ModelUtil';

import {
  isAny
} from '../util/ModelingUtil';

/**
 * A component that makes sure that each created or updated
 * Pool and Lane is assigned an isHorizontal property set to true.
 *
 * @param {EventBus} eventBus
 */
export default function IsHorizontalFix(eventBus) {

  CommandInterceptor.call(this, eventBus);

  var elementTypesToUpdate = [
    'bpmn:Participant',
    'bpmn:Lane'
  ];

  this.executed([ 'shape.move', 'shape.create', 'shape.resize' ], function(event) {
    var bo = getBusinessObject(event.context.shape);

    if (isAny(bo, elementTypesToUpdate) && !bo.di.get('isHorizontal')) {

      // set attribute directly to avoid modeling#updateProperty side effects
      bo.di.set('isHorizontal', true);
    }
  });

}

IsHorizontalFix.$inject = [ 'eventBus' ];

inherits(IsHorizontalFix, CommandInterceptor);
