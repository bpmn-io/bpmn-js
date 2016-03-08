'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var LabelUtil = require('../../../util/LabelUtil'),
    is = require('../../../util/ModelUtil').is;

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');


/**
 * A component that makes sure that external labels are added
 * together with respective elements and properly updated (DI wise)
 * during move.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {BpmnFactory} bpmnFactory
 */
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
        hidden: !businessObject.name,
        businessObject: businessObject
      });
    }
  });

  // update di information on label creation
  this.executed([ 'label.create' ], function(e) {

    var element = e.context.shape,
        businessObject,
        di;

    // we want to trigger on real labels only
    if (!element.labelTarget) {
      return;
    }

    // we want to trigger on BPMN elements only
    if (!is(element.labelTarget || element, 'bpmn:BaseElement')) {
      return;
    }

    businessObject = element.businessObject,
    di = businessObject.di;


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
