import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  getDi
} from '../../../util/ModelUtil';

import {
  isAny
} from '../util/ModelingUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

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
    var shape = event.context.shape,
        bo = getBusinessObject(shape),
        di = getDi(shape);

    if (isAny(bo, elementTypesToUpdate) && !di.get('isHorizontal')) {

      // set attribute directly to avoid modeling#updateProperty side effects
      di.set('isHorizontal', true);
    }
  });

}

IsHorizontalFix.$inject = [ 'eventBus' ];

inherits(IsHorizontalFix, CommandInterceptor);
