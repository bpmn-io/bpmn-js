'use strict';

var assign = require('lodash/object/assign');

var UpdateLabelHandler = require('./cmd/UpdateLabelHandler');

var LabelUtil = require('./LabelUtil');

var is = require('../../util/ModelUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded;

var SMALL_FONT_SIZE = 11,
    SMALL_LINE_HEIGHT = 13,
    MEDIUM_FONT_SIZE = 12,
    MEDIUM_LINE_HEIGHT = 14;

function LabelEditingProvider(eventBus, canvas, directEditing, commandStack, resizeHandles) {

  this._canvas = canvas;
  this._commandStack = commandStack;

  directEditing.registerProvider(this);

  commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    directEditing.activate(event.element);

    resizeHandles.removeResizers();
  });

  // complete on followup canvas operation
  eventBus.on([ 'element.mousedown', 'drag.init', 'canvas.viewbox.changing' ], function(event) {
    directEditing.complete();
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function(e) {
    directEditing.cancel();
  });

  if ('ontouchstart' in document.documentElement) {
    // we deactivate automatic label editing on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element here
    // and release the focused viewport after the direct edit operation is finished
  } else {
    eventBus.on('create.end', 500, function(event) {
      var element = event.shape,
          canExecute = event.context.canExecute;

      if (!canExecute) {
        return;
      }

      if (is(element, 'bpmn:Task') || is(element, 'bpmn:TextAnnotation') ||
          (is(element, 'bpmn:SubProcess') && !isExpanded(element))) {
        directEditing.activate(element);

        resizeHandles.removeResizers();
      }
    });
  }
}

LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack', 'resizeHandles' ];

module.exports = LabelEditingProvider;


/**
 * Activate direct editing for activities and text annotations.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object with properties bounds (position and size), text and options
 */
LabelEditingProvider.prototype.activate = function(element) {

  // text
  var text = LabelUtil.getLabel(element);

  if (text === undefined) {
    return;
  }

  var context = {
    text: text
  };

  // bounds
  var bounds = this.getEditingBBox(element);

  assign(context, bounds);

  // options
  var target = element.label || element;

  var options = {};

  // tasks
  if (is(element, 'bpmn:Task') ||
      is(element, 'bpmn:Participant') ||
      is(element, 'bpmn:Lane') ||
      (is(element, 'bpmn:CallActivity') && !isExpanded(element)) ||
      (is(element, 'bpmn:SubProcess') && !isExpanded(element))) {
    assign(options, {
      centerVertically: true
    });
  }

  // external labels
  if (target.labelTarget) {
    assign(options, {
      autoResize: true
    });
  }

  // text annotations
  if (is(element, 'bpmn:TextAnnotation')) {
    assign(options, {
      resizable: true,
      autoResize: true
    });
  }

  assign(context, {
    options: options
  });

  return context;
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

  var zoom = canvas.zoom();

  // take zoom into account
  var smallFontSize = SMALL_FONT_SIZE * zoom,
      smallLineHeight = SMALL_LINE_HEIGHT * zoom,
      mediumFontSize = MEDIUM_FONT_SIZE * zoom,
      mediumLineHeight = MEDIUM_LINE_HEIGHT * zoom;

  var style = {};

  // adjust for expanded pools AND lanes
  if ((is(element, 'bpmn:Participant') && isExpanded(element))
       || is(element, 'bpmn:Lane')) {

    assign(bounds, {
      width: bbox.height,
      height: 30 * zoom,
      x: bbox.x - bbox.height / 2 + (15 * zoom),
      y: mid.y - (30 * zoom) / 2
    });

    assign(style, {
      fontSize: mediumFontSize + 'px',
      lineHeight: mediumLineHeight + 'px',
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px',
      transform: 'rotate(-90deg)'
    });
  }


  // internal labels for tasks and collapsed call activities, sub processes and participants
  if (
    is(element, 'bpmn:Task') ||
    (is(element, 'bpmn:CallActivity') && !isExpanded(element)) ||
    (is(element, 'bpmn:SubProcess') && !isExpanded(element)) ||
    (is(element, 'bpmn:Participant') && !isExpanded(element))
  ) {
    assign(bounds, {
      width: bbox.width,
      height: bbox.height
    });

    assign(style, {
      fontSize: mediumFontSize + 'px',
      lineHeight: mediumLineHeight + 'px',
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px'
    });
  }


  // internal labels for expanded sub processes
  if (is(element, 'bpmn:SubProcess') && isExpanded(element)) {
    assign(bounds, {
      width: bbox.width,
      x: bbox.x
    });

    assign(style, {
      fontSize: mediumFontSize + 'px',
      lineHeight: mediumLineHeight + 'px',
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px'
    });
  }


  // external labels for events, data elements, gateways and connections
  if (target.labelTarget) {
    var width = 90 * zoom,
        paddingTop = 7 * zoom,
        paddingBottom = 4 * zoom;

    assign(bounds, {
      width: width,
      height: bbox.height + paddingTop + paddingBottom,
      x: mid.x - width / 2,
      y: bbox.y - paddingTop
    });

    assign(style, {
      fontSize: smallFontSize + 'px',
      lineHeight: smallLineHeight + 'px',
      paddingTop: paddingTop + 'px',
      paddingBottom: paddingBottom + 'px'
    });
  }


  // text annotations
  if (is(element, 'bpmn:TextAnnotation')) {
    assign(bounds, {
      width: bbox.width,
      height: bbox.height,
      minWidth: 30 * zoom,
      minHeight: 10 * zoom
    });

    assign(style, {
      textAlign: 'left',
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px',
      fontSize: mediumFontSize + 'px',
      lineHeight: mediumLineHeight + 'px'
    });
  }

  return { bounds: bounds, style: style };
};


LabelEditingProvider.prototype.update = function(element, newLabel, activeContextText, bounds) {
  var absoluteElementBBox = this._canvas.getAbsoluteBBox(element);

  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel,
    bounds: {
      x: element.x,
      y: element.y,
      width: element.width / absoluteElementBBox.width * bounds.width,
      height: element.height / absoluteElementBBox.height * bounds.height
    }
  });
};
