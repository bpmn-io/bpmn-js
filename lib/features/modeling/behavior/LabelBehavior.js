import {
  assign
} from 'min-dash';

import inherits from 'inherits';

import {
  is,
  getBusinessObject
} from '../../../util/ModelUtil';

import {
  hasExternalLabel,
  getExternalLabelMid,
} from '../../../util/LabelUtil';

import {
  getLabelAdjustment
} from './util/LabelLayoutUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

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
 * @param {TextRenderer} textRenderer
 */
export default function LabelBehavior(
    eventBus, modeling, bpmnFactory,
    textRenderer) {

  CommandInterceptor.call(this, eventBus);


  // create external labels on shape creation

  this.postExecute([ 'shape.create', 'connection.create' ], function(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        businessObject = element.businessObject;

    if (!hasExternalLabel(element)) {
      return;
    }

    var labelCenter = getExternalLabelMid(element);

    // we don't care about x and y
    var labelDimensions = textRenderer.getLayoutedBounds(
      DEFAULT_LABEL_DIMENSIONS,
      businessObject.name || ''
    );

    modeling.createLabel(element, labelCenter, {
      id: businessObject.id + '_label',
      hidden: !businessObject.name,
      businessObject: businessObject,
      width: labelDimensions.width,
      height: labelDimensions.height
    });
  });


  // update di information on label creation

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


  // update label position on connection change

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


  // keep label position on shape replace

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

inherits(LabelBehavior, CommandInterceptor);

LabelBehavior.$inject = [
  'eventBus',
  'modeling',
  'bpmnFactory',
  'textRenderer'
];