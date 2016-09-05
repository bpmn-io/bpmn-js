'use strict';

var UpdateLabelHandler = require('./cmd/UpdateLabelHandler');

var LabelUtil = require('./LabelUtil');

var is = require('../../util/ModelUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded;

var LINE_HEIGHT = 14,
    PADDING = 6;

function LabelEditingProvider(eventBus, canvas, directEditing, commandStack) {

  this._canvas = canvas;
  this._commandStack = commandStack;

  directEditing.registerProvider(this);

  commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    directEditing.activate(event.element);
  });

  // complete on followup canvas operation
  eventBus.on([ 'element.mousedown', 'drag.init', 'canvas.viewbox.changed' ], function(event) {
    directEditing.complete();
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function() {
    directEditing.cancel();
  });


  if ('ontouchstart' in document.documentElement) {
    // we deactivate automatic label editing on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element here
    // and release the focused viewport after the direct edit operation is finished
  } else {
    eventBus.on('create.end', 500, function(e) {

      var element = e.shape,
          canExecute = e.context.canExecute;

      if (!canExecute) {
        return;
      }

      if (is(element, 'bpmn:Task') || is(element, 'bpmn:TextAnnotation') ||
          (is(element, 'bpmn:SubProcess') && !isExpanded(element))) {

        directEditing.activate(element);
      }
    });
  }
}

LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack' ];

module.exports = LabelEditingProvider;


/**
 * Activate direct editing for activities and text annotations.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object with properties bounds (position and size) and text
 */
LabelEditingProvider.prototype.activate = function(element) {

  var text = LabelUtil.getLabel(element);

  if (text === undefined) {
    return;
  }

  var properties = this.getEditingBBox(element);

  properties.text = text;

  return properties;
};


/**
 * Get the editing bounding box based on the element's size and position
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object containing information about position and size (fixed or minimum and/or maximum)
 */
LabelEditingProvider.prototype.getEditingBBox = function(element) {
  var canvas = this._canvas;

  var target = element.label || element;

  var bbox = canvas.getAbsoluteBBox(target);

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };

  // default position
  var bounds = { x: bbox.x, y: bbox.y };

  var style = {},
      zoom;

  // adjust for expanded pools AND lanes
  if ((is(element, 'bpmn:Participant') && isExpanded(element)) || is(element, 'bpmn:Lane')) {

    bounds.width = 150;
    bounds.minHeight = LINE_HEIGHT + PADDING;
    bounds.maxHeight = LINE_HEIGHT * 2 + PADDING;
    bounds.x = bbox.x - bounds.width / 2;
    bounds.y = mid.y - bounds.minHeight / 2;
  }


  // internal labels for tasks and collapsed call activities, sub processes and participants
  if (
    is(element, 'bpmn:Task') ||
    (is(element, 'bpmn:CallActivity') && !isExpanded(element)) ||
    (is(element, 'bpmn:SubProcess') && !isExpanded(element)) ||
    (is(element, 'bpmn:Participant') && !isExpanded(element))
  ) {

    zoom = canvas.zoom();

    // fixed size for internal labels:
    // on high zoom levels: text box size === bbox size
    // on low zoom levels: text box size === bbox size at 100% zoom
    // This ensures minimum bounds at low zoom levels
    if (zoom > 1) {
      bounds.width = bbox.width;
      bounds.height = bbox.height;
    } else {
      bounds.width = bbox.width / zoom;
      bounds.height = bbox.height / zoom;
    }

    // centering overlapping text box size at low zoom levels
    if (zoom < 1) {
      bounds.x = bbox.x - (bounds.width / 2 - bbox.width / 2);
      bounds.y = bbox.y - (bounds.height / 2 - bbox.height / 2);
    }

  }


  // internal labels for expanded sub processes
  if (is(element, 'bpmn:SubProcess') && isExpanded(element)) {

    bounds.width = element.width;
    bounds.maxHeight = 3 * LINE_HEIGHT + PADDING; // maximum 3 lines
    bounds.x = mid.x - element.width / 2;
  }


  // external labels for events, data elements, gateways and connections
  if (target.labelTarget) {

    bounds.width = 150;
    bounds.minHeight = LINE_HEIGHT + PADDING; // 1 line
    bounds.x = mid.x - bounds.width / 2;
  }


  // text annotations
  if (is(element, 'bpmn:TextAnnotation')) {
    bounds.minWidth = 100;
    bounds.height = element.height;

    style.textAlign = 'left';
  }

  return { bounds: bounds, style: style };
};


LabelEditingProvider.prototype.update = function(element, newLabel) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel
  });
};
