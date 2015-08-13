'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

/**
 * BPMN specific create participant behavior
 */
function CreateParticipantBehavior(eventBus, modeling, elementFactory, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  /**
   * morph process into collaboration before adding
   * participant onto collaboration
   */

  this.preExecute('shape.create', function(context) {

    var parent = context.parent,
        shape = context.shape,
        position = context.position;

    if (is(parent, 'bpmn:Process') && is(shape, 'bpmn:Participant')) {

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

CreateParticipantBehavior.$inject = [ 'eventBus', 'modeling', 'elementFactory', 'bpmnFactory' ];

inherits(CreateParticipantBehavior, CommandInterceptor);

module.exports = CreateParticipantBehavior;
