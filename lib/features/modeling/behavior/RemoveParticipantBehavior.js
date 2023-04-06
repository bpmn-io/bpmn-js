import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * BPMN specific remove behavior.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function RemoveParticipantBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);


  /**
   * morph collaboration diagram into process diagram
   * after the last participant has been removed
   */

  this.preExecute('shape.delete', function(context) {

    var shape = context.shape,
        parent = shape.parent;

    // activate the behavior if the shape to be removed
    // is a participant
    if (is(shape, 'bpmn:Participant')) {
      context.collaborationRoot = parent;
    }
  }, true);

  this.postExecute('shape.delete', function(context) {

    var collaborationRoot = context.collaborationRoot;

    if (collaborationRoot && !collaborationRoot.businessObject.participants.length) {

      // replace empty collaboration with process diagram
      modeling.makeProcess();
    }
  }, true);

}

RemoveParticipantBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(RemoveParticipantBehavior, CommandInterceptor);