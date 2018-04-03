import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';


/**
 * BPMN specific create participant behavior
 */
export default function CreateParticipantBehavior(
    eventBus, modeling, elementFactory,
    bpmnFactory, canvas) {

  CommandInterceptor.call(this, eventBus);

  /**
   * morph process into collaboration before adding
   * participant onto collaboration
   */

  this.preExecute('shape.create', function(context) {

    var parent = context.parent,
        shape = context.shape,
        position = context.position;

    var rootElement = canvas.getRootElement();

    if (
      is(parent, 'bpmn:Process') &&
      is(shape, 'bpmn:Participant') &&
      !is(rootElement, 'bpmn:Collaboration')
    ) {

      // this is going to detach the process root
      // and set the returned collaboration element
      // as the new root element
      var collaborationElement = modeling.makeCollaboration();

      // monkey patch the create context
      // so that the participant is being dropped
      // onto the new collaboration root instead
      context.position = position;
      context.parent = collaborationElement;

      context.processRoot = parent;
    }
  }, true);


  this.execute('shape.create', function(context) {

    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {
      context.oldProcessRef = shape.businessObject.processRef;

      // assign the participant processRef
      shape.businessObject.processRef = processRoot.businessObject;
    }
  }, true);


  this.revert('shape.create', function(context) {
    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {
      // assign the participant processRef
      shape.businessObject.processRef = context.oldProcessRef;
    }
  }, true);


  this.postExecute('shape.create', function(context) {

    var processRoot = context.processRoot,
        shape = context.shape;

    if (processRoot) {
      // process root is already detached at this point
      var processChildren = processRoot.children.slice();
      modeling.moveElements(processChildren, { x: 0, y: 0 }, shape);
    }

  }, true);

}

CreateParticipantBehavior.$inject = [
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory',
  'canvas'
];

inherits(CreateParticipantBehavior, CommandInterceptor);