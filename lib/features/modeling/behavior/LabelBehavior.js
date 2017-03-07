'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var LabelUtil = require('../../../util/LabelUtil'),
    LabelLayoutUtil = require('./util/LabelLayoutUtil'),
    ModelUtil = require('../../../util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var hasExternalLabel = LabelUtil.hasExternalLabel,
    getExternalLabelMid = LabelUtil.getExternalLabelMid,
    getLabelAdjustment = LabelLayoutUtil.getLabelAdjustment;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var TextUtil = require('diagram-js/lib/util/Text');

var DEFAULT_LABEL_DIMENSIONS = {
  width: 90,
  height: 20
};


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

  var textUtil = new TextUtil();


  ///// create external labels on shape creation

  this.postExecute([ 'shape.create', 'connection.create' ], function(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        businessObject = element.businessObject;

    if (!hasExternalLabel(businessObject)) {
      return;
    }

    var labelCenter = getExternalLabelMid(element);

    // we don't care about x and y
    var labelDimensions = getLayoutedBounds(
      DEFAULT_LABEL_DIMENSIONS,
      businessObject.name || '',
      textUtil
    );

    modeling.createLabel(element, labelCenter, {
      id: businessObject.id + '_label',
      hidden: !businessObject.name,
      businessObject: businessObject,
      width: labelDimensions.width,
      height: labelDimensions.height
    });
  });


  ///// update di information on label creation

  this.executed([ 'label.create' ], function(event) {

    var element = event.context.shape,
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


  ///// update label position on connection change

  function getHiddenLabelAdjustment(event) {

    var context = event.context,
        connection = context.connection,
        label = connection.label;

    var labelPosition = getExternalLabelMid(connection);

    return {
      x: labelPosition.x - label.x - label.width / 2,
      y: labelPosition.y - label.y - label.height / 2
    };
  }

  function getVisibleLabelAdjustment(event) {

    var command = event.command,
        context = event.context,
        connection = context.connection,
        label = connection.label,
        hints = assign({}, context.hints),
        newWaypoints = context.newWaypoints || connection.waypoints,
        oldWaypoints = context.oldWaypoints;


    if (typeof hints.startChanged === 'undefined') {
      hints.startChanged = (command === 'connection.reconnectStart');
    }

    if (typeof hints.endChanged === 'undefined') {
      hints.endChanged = (command === 'connection.reconnectEnd');
    }

    return getLabelAdjustment(label, newWaypoints, oldWaypoints, hints);
  }

  this.postExecute([
    'connection.layout',
    'connection.reconnectEnd',
    'connection.reconnectStart',
    'connection.updateWaypoints'
  ], function(event) {

    var label = event.context.connection.label,
        labelAdjustment;

    if (!label) {
      return;
    }

    if (label.hidden) {
      labelAdjustment = getHiddenLabelAdjustment(event);
    } else {
      labelAdjustment = getVisibleLabelAdjustment(event);
    }

    modeling.moveShape(label, labelAdjustment);
  });


  ////// keep label position on shape replace

  this.postExecute([ 'shape.replace' ], function(event) {
    var context = event.context,
        newShape = context.newShape,
        oldShape = context.oldShape;

    var businessObject = getBusinessObject(newShape);

    if (businessObject && hasExternalLabel(businessObject)) {
      newShape.label.x = oldShape.label.x;
      newShape.label.y = oldShape.label.y;
    }
  });

}

inherits(LabelSupport, CommandInterceptor);

LabelSupport.$inject = [ 'eventBus', 'modeling', 'bpmnFactory' ];

module.exports = LabelSupport;


// TODO(nikku): repeating code (search for <getLayoutedBounds>)

var EXTERNAL_LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '11px'
};

function getLayoutedBounds(bounds, text, textUtil) {

  var layoutedLabelDimensions = textUtil.getDimensions(text, {
    box: {
      width: 90,
      height: 30,
      x: bounds.width / 2 + bounds.x,
      y: bounds.height / 2 + bounds.y
    },
    style: EXTERNAL_LABEL_STYLE
  });

  // resize label shape to fit label text
  return {
    x: Math.round(bounds.x + bounds.width / 2 - layoutedLabelDimensions.width / 2),
    y: Math.round(bounds.y),
    width: Math.ceil(layoutedLabelDimensions.width),
    height: Math.ceil(layoutedLabelDimensions.height)
  };
}
