'use strict';

var assign = require('lodash/object/assign');

var LabelUtil = require('./LabelUtil');

var is = require('../../util/ModelUtil').is,
    isAny = require('../modeling/util/ModelingUtil').isAny,
    isExpanded = require('../../util/DiUtil').isExpanded;

var SMALL_FONT_SIZE = 11,
    SMALL_LINE_HEIGHT = 13,
    MEDIUM_FONT_SIZE = 12,
    MEDIUM_LINE_HEIGHT = 14;


function LabelEditingProvider(
    eventBus, canvas, directEditing,
    modeling, resizeHandles) {

  this._canvas = canvas;
  this._modeling = modeling;

  directEditing.registerProvider(this);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    activateDirectEdit(event.element, true);
  });

  // complete on followup canvas operation
  eventBus.on([
    'element.mousedown',
    'drag.init',
    'canvas.viewbox.changing',
    'autoPlace'
  ], function(event) {
    directEditing.complete();
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function(e) {
    directEditing.cancel();
  });


  eventBus.on('directEditing.activate', function(event) {
    resizeHandles.removeResizers();
  });

  eventBus.on('create.end', 500, function(event) {

    var element = event.shape,
        canExecute = event.context.canExecute,
        isTouch = event.isTouch;

    // TODO(nikku): we need to find a way to support the
    // direct editing on mobile devices; right now this will
    // break for desworkflowediting on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element
    // here and release the focused viewport after the direct edit
    // operation is finished
    if (isTouch) {
      return;
    }

    if (!canExecute) {
      return;
    }

    activateDirectEdit(element);
  });

  eventBus.on('autoPlace.end', 500, function(event) {
    activateDirectEdit(event.shape);
  });


  function activateDirectEdit(element, force) {
    if (force ||
        isAny(element, [ 'bpmn:Task', 'bpmn:TextAnnotation' ]) ||
        isCollapsedSubProcess(element)) {

      directEditing.activate(element);
    }
  }

}

LabelEditingProvider.$inject = [
  'eventBus',
  'canvas',
  'directEditing',
  'modeling',
  'resizeHandles'
];

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
  if (
    isAny(element, [
      'bpmn:Task',
      'bpmn:Participant',
      'bpmn:Lane',
      'bpmn:CallActivity'
    ]) ||
    isCollapsedSubProcess(element)
  ) {
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
 * @return {Object} an object containing information about position
 *                  and size (fixed or minimum and/or maximum)
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
  if (is(element, 'bpmn:Lane') || isExpandedPool(element)) {

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


  // internal labels for tasks and collapsed call activities,
  // sub processes and participants
  if (isAny(element, [ 'bpmn:Task', 'bpmn:CallActivity']) ||
      isCollapsedPool(element) ||
      isCollapsedSubProcess(element)) {

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
  if (isExpandedSubProcess(element)) {
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


LabelEditingProvider.prototype.update = function(
    element, newLabel,
    activeContextText, bounds) {

  var newBounds,
      bbox;

  if (is(element, 'bpmn:TextAnnotation')) {

    bbox = this._canvas.getAbsoluteBBox(element);

    newBounds = {
      x: element.x,
      y: element.y,
      width: element.width / bbox.width * bounds.width,
      height: element.height / bbox.height * bounds.height
    };
  }

  this._modeling.updateLabel(element, newLabel, newBounds);
};



// helpers //////////////////////

function isCollapsedSubProcess(element) {
  return is(element, 'bpmn:SubProcess') && !isExpanded(element);
}

function isExpandedSubProcess(element) {
  return is(element, 'bpmn:SubProcess') && isExpanded(element);
}

function isCollapsedPool(element) {
  return is(element, 'bpmn:Participant') && !isExpanded(element);
}

function isExpandedPool(element) {
  return is(element, 'bpmn:Participant') && isExpanded(element);
}