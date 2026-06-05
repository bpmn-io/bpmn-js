import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor.js';

import {
  getBusinessObject,
  getDi
} from '../../../util/ModelUtil.js';

import {
  isAny
} from '../util/ModelingUtil.js';

/**
 * @typedef {import('diagram-js/lib/core/EventBus.js').default} EventBus
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

    if (isAny(bo, elementTypesToUpdate)) {
      var isHorizontal = di.get('isHorizontal');

      if (isHorizontal === undefined) {
        isHorizontal = true;
      }

      // set attribute directly to avoid modeling#updateProperty side effects
      di.set('isHorizontal', isHorizontal);
    }
  });

}

IsHorizontalFix.$inject = [ 'eventBus' ];

inherits(IsHorizontalFix, CommandInterceptor);
