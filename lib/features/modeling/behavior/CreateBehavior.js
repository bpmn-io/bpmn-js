'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox,
    assign = require('lodash/object/assign');

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

    if (parent.businessObject.$instanceOf('bpmn:Process') &&
        shape.businessObject.$instanceOf('bpmn:Participant')) {

      // update shape size + position of new participant to
      // encapsulate all existing children
      if (parent.children.length) {
        var bbox = getBoundingBox(parent.children);

        assign(shape, {
          width: bbox.width + 60,
          height: bbox.height + 40
        });

        position = {
          x: bbox.x - 40 + shape.width / 2,
          y: bbox.y - 20 + shape.height / 2
        };
      }

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
  }, true);

}

CreateBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(CreateBehavior, CommandInterceptor);

module.exports = CreateBehavior;