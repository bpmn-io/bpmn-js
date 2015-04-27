'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var LabelUtil = require('../../util/LabelUtil');

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

  // we need to add labels to the list of selected
  // shapes before the visuals get drawn.
  //
  // Hence this awesome magic number.
  //
  eventBus.on('shape.move.start', function(e) {

    var context = e.context,
        shapes = context.shapes;

    var labels = [];

    forEach(shapes, function(element) {
      var label = element.label;

      if (label && !label.hidden && context.shapes.indexOf(label) === -1) {
        labels.push(label);
      }
    });

    forEach(labels, function(label) {
      shapes.push(label);
    });
  });


  // move labels with shapes

  eventBus.on([
    'commandStack.shapes.move.postExecute'
  ], function(e) {

    var context = e.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements;

    // ensure we move all labels with their respective elements
    // if they have not been moved already

    forEach(enclosedElements, function(e) {
      if (e.label && !enclosedElements[e.label.id]) {
        modeling.moveShape(e.label, context.delta, e.parent);
      }
    });
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

    assign(di.label.bounds, {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });
  });
}

LabelSupport.$inject = [ 'eventBus', 'modeling', 'bpmnFactory' ];

module.exports = LabelSupport;
