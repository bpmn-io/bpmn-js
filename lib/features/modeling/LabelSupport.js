'use strict';

var _ = require('lodash');

var LabelUtil = require('../../util/Label');

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid;


function LabelSupport(eventBus, modeling, bpmnFactory) {

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

  eventBus.on([
    'commandStack.label.create.executed',
    'commandStack.label.moved.executed'
  ], function(e) {

    var element = e.context.shape,
        businessObject = element.businessObject,
        di = businessObject.di;

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