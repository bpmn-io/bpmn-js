'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

/**
 * BPMN specific create behavior
 */
function CreateBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);


  /**
   * morph process into collaboration before adding
   * participant onto collaboration
   */

  this.preExecute('shape.create', function(context) {

    var parent = context.parent,
        shape = context.shape,
        position = context.position;

    if (is(parent, 'bpmn:SequenceFlow')){
      context.insertTarget = parent;
      context.parent = context.parent.parent;
    }

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
      modeling.moveShapes(processChildren, { x: 0, y: 0 }, shape);
    }

    if (context.insertTarget) {

      var initialTarget = context.insertTarget.target;
      var insertShape = context.shape;

      // reconnecting end to inserted shape
      modeling.reconnectEnd(context.insertTarget, insertShape, context.position);

      // create new connection between inserted shape and initial target
      modeling.createConnection(insertShape, initialTarget, {
        type: context.insertTarget.type,
      }, context.parent);
    }
  }, true);

}

CreateBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(CreateBehavior, CommandInterceptor);

module.exports = CreateBehavior;