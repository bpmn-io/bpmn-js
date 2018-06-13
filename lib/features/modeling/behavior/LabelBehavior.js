import {
  assign
} from 'min-dash';

import inherits from 'inherits';

import {
  is,
  getBusinessObject
} from '../../../util/ModelUtil';

import {
  isLabelExternal,
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

var NAME_PROPERTY = 'name';
var TEXT_PROPERTY = 'text';

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

  // update label if name property was updated
  this.postExecute('element.updateProperties', function(e) {
    var context = e.context,
        element = context.element,
        properties = context.properties;

    if (NAME_PROPERTY in properties) {
      modeling.updateLabel(element, properties[NAME_PROPERTY]);
    }

    if (TEXT_PROPERTY in properties
        && is(element, 'bpmn:TextAnnotation')) {

      var newBounds = textRenderer.getTextAnnotationBounds(
        {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        },
        properties[TEXT_PROPERTY] || ''
      );

      modeling.updateLabel(element, properties.text, newBounds);
    }
  });

  // create label shape after shape/connection was created
  this.postExecute([ 'shape.create', 'connection.create' ], function(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        businessObject = element.businessObject;

    if (!isLabelExternal(element)) {
      return;
    }

    // only create label if name
    if (!businessObject.name) {
      return;
    }

    var labelCenter = getExternalLabelMid(element);

    // we don't care about x and y
    var labelDimensions = textRenderer.getExternalLabelBounds(
      DEFAULT_LABEL_DIMENSIONS,
      businessObject.name || ''
    );

    modeling.createLabel(element, labelCenter, {
      id: businessObject.id + '_label',
      businessObject: businessObject,
      width: labelDimensions.width,
      height: labelDimensions.height
    });
  });

  // update label after label shape was deleted
  this.postExecute('shape.delete', function(event) {
    var context = event.context,
        labelTarget = context.labelTarget,
        hints = context.hints || {};

    // check if label
    if (labelTarget && hints.unsetLabel !== false) {
      modeling.updateLabel(labelTarget, null, null, { removeShape: false });
    }
  });

  // update di information on label creation
  this.postExecute([ 'label.create' ], function(event) {

    var context = event.context,
        element = context.shape,
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

    labelAdjustment = getVisibleLabelAdjustment(event);

    modeling.moveShape(label, labelAdjustment);
  });


  // keep label position on shape replace
  this.postExecute([ 'shape.replace' ], function(event) {
    var context = event.context,
        newShape = context.newShape,
        oldShape = context.oldShape;

    var businessObject = getBusinessObject(newShape);

    if (businessObject
      && isLabelExternal(businessObject)
      && oldShape.label
      && newShape.label) {
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