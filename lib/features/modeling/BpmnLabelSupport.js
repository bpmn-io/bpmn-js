'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var LabelUtil = require('../../util/LabelUtil');

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');


function LabelSupport(eventBus, modeling, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  // create external labels on shape creation

  this.postExecute([ 'shape.create', 'connection.create' ], function(e) {
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

  // update di information on label movement and creation

  this.executed([ 'label.create', 'shape.moved' ], function(e) {

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

inherits(LabelSupport, CommandInterceptor);

LabelSupport.$inject = [ 'eventBus', 'modeling', 'bpmnFactory' ];

module.exports = LabelSupport;
