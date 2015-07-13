'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;


/**
 * BPMN specific create boundary event behavior
 */
function CreateBoundaryEventBehavior(eventBus, modeling, elementFactory, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  /**
   * replace intermediate event with boundary event when
   * attaching it to a shape
   */

  this.preExecute('shape.create', function(context) {
    var shape = context.shape,
        host = context.host,
        businessObject,
        boundaryEvent;

    var attrs = {
      cancelActivity: true
    };

    if (host && is(shape, 'bpmn:IntermediateThrowEvent')) {
      attrs.attachedToRef = host.businessObject;

      businessObject = bpmnFactory.create('bpmn:BoundaryEvent', attrs);

      boundaryEvent = {
        type: 'bpmn:BoundaryEvent',
        businessObject: businessObject
      };

      context.shape = elementFactory.createShape(boundaryEvent);
    }
  }, true);
}

CreateBoundaryEventBehavior.$inject = [ 'eventBus', 'modeling', 'elementFactory', 'bpmnFactory' ];

inherits(CreateBoundaryEventBehavior, CommandInterceptor);

module.exports = CreateBoundaryEventBehavior;
