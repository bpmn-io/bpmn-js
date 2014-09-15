'use strict';

var _ = require('lodash');

var LabelUtil = require('../../util/Label');

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid;


function LabelSupport(eventBus, modeling, bpmnFactory) {

  // create external labels on shape creation

  eventBus.on([
    'commandStack.shape.create.postExecute',
    'commandStack.connection.create.postExecute'
  ], function(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        businessObject = element.businessObject;

    var position;

    if (hasExternalLabel(businessObject)) {
      position = getExternalLabelMid(element);
      modeling.createLabel(element, position, {
        id: businessObject.id + '_label',
        businessObject: businessObject
      });
    }
  });


  // indicate label is dragged during move

  eventBus.on('shape.move.start', 50000, function(e) {

    var dragContext = e.dragContext,
        element = dragContext.element;

    var label = element.label;

    if (label && !label.hidden && dragContext.shapes.indexOf(label) === -1) {
      dragContext.shapes.push(label);
    }
  });


  // move labels with shapes

  eventBus.on([
    'commandStack.shape.move.postExecute'
  ], function(e) {
    var context = e.context,
        shape = context.shape;

    if (shape.label && context.hints.layout !== false) {
      modeling.moveShape(shape.label, context.delta);
    }
  });


  // update di information on label movement and creation

  eventBus.on([
    'commandStack.label.create.executed',
    'commandStack.shape.moved.executed'
  ], function(e) {

    var element = e.context.shape,
        businessObject = element.businessObject,
        di = businessObject.di;

    // we want to trigger on real labels only
    if (!element.labelTarget) {
      return;
    }

    if (!di.label) {
      di.label = bpmnFactory.create('bpmndi:BPMNLabel', {
        bounds: bpmnFactory.create('dc:Bounds')
      });
    }

    _.extend(di.label.bounds, {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });
  });
}

LabelSupport.$inject = [ 'eventBus', 'modeling', 'bpmnFactory' ];

module.exports = LabelSupport;