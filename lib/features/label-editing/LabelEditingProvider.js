import {
  assign
} from 'min-dash';

import {
  getLabel
} from '../../util/LabelUtil';

import {
  is
} from '../../util/ModelUtil';

import { isAny } from '../modeling/util/ModelingUtil';

import {
  isExpanded,
  isHorizontal
} from '../../util/DiUtil';

import {
  getExternalLabelMid,
  isLabelExternal,
  hasExternalLabel,
  isLabel
} from '../../util/LabelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../modeling/BpmnFactory').default} BpmnFactory
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js-direct-editing/lib/DirectEditing').default} DirectEditing
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('diagram-js/lib/features/resize/ResizeHandles').default} ResizeHandles
 * @typedef {import('../../draw/TextRenderer').default} TextRenderer
 *
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef { {
 *   bounds: {
 *     x: number;
 *     y: number;
 *     width: number;
 *     height: number;
 *     minWidth?: number;
 *     minHeight?: number;
 *   };
 *   style: Object;
 * } } DirectEditingContext
 */

var HIGH_PRIORITY = 2000;

/**
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {Canvas} canvas
 * @param {DirectEditing} directEditing
 * @param {Modeling} modeling
 * @param {ResizeHandles} resizeHandles
 * @param {TextRenderer} textRenderer
 */
export default function LabelEditingProvider(
    eventBus, bpmnFactory, canvas, directEditing,
    modeling, resizeHandles, textRenderer) {

  this._bpmnFactory = bpmnFactory;
  this._canvas = canvas;
  this._modeling = modeling;
  this._textRenderer = textRenderer;

  directEditing.registerProvider(this);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    activateDirectEdit(event.element, true);
  });

  // complete on followup canvas operation
  eventBus.on([
    'autoPlace.start',
    'canvas.viewbox.changing',
    'drag.init',
    'element.mousedown',
    'popupMenu.open',
    'root.set',
    'selection.changed'
  ], function() {
    if (directEditing.isActive()) {
      directEditing.complete();
    }
  });

  eventBus.on([
    'shape.remove',
    'connection.remove'
  ], HIGH_PRIORITY, function(event) {

    if (directEditing.isActive(event.element)) {
      directEditing.cancel();
    }
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function(e) {
    if (directEditing.isActive()) {
      directEditing.cancel();
    }
  });


  eventBus.on('directEditing.activate', function(event) {
    resizeHandles.removeResizers();
  });

  eventBus.on('create.end', 500, function(event) {

    var context = event.context,
        element = context.shape,
        canExecute = event.context.canExecute,
        isTouch = event.isTouch;

    // TODO(nikku): we need to find a way to support the
    // direct editing on mobile devices; right now this will
    // break for desworkflowediting on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nikku): we should temporarily focus the edited element
    // here and release the focused viewport after the direct edit
    // operation is finished
    if (isTouch) {
      return;
    }

    if (!canExecute) {
      return;
    }

    if (context.hints && context.hints.createElementsBehavior === false) {
      return;
    }

    activateDirectEdit(element);
  });

  eventBus.on('autoPlace.end', 500, function(event) {
    activateDirectEdit(event.shape);
  });


  function activateDirectEdit(element, force) {
    if (force ||
        isAny(element, [ 'bpmn:Task', 'bpmn:TextAnnotation', 'bpmn:Participant' ]) ||
        isCollapsedSubProcess(element)) {

      directEditing.activate(element);
    }
  }

}

LabelEditingProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'canvas',
  'directEditing',
  'modeling',
  'resizeHandles',
  'textRenderer'
];


/**
 * Activate direct editing for activities and text annotations.
 *
 * @param {Element} element
 *
 * @return { {
 *   text: string;
 *   options?: {
 *     autoResize?: boolean;
 *     centerVertically?: boolean;
 *     resizable?: boolean;
 *   }
 * } & DirectEditingContext }
 */
LabelEditingProvider.prototype.activate = function(element) {

  // text
  var text = getLabel(element);

  if (text === undefined) {
    return;
  }

  var context = {
    text: text
  };

  // bounds
  var bounds = this.getEditingBBox(element);

  assign(context, bounds);

  var options = {};
  var style = context.style || {};

  // Remove background and border
  assign(style, {
    backgroundColor: null,
    border: null
  });

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
  if (isLabelExternal(element)) {
    assign(options, {
      autoResize: true
    });

    // keep background and border for external labels
    assign(style, {
      backgroundColor: '#ffffff',
      border: '1px solid #ccc'
    });
  }

  // text annotations
  if (is(element, 'bpmn:TextAnnotation')) {
    assign(options, {
      resizable: true,
      autoResize: true
    });

    // keep background and border for text annotations
    assign(style, {
      backgroundColor: '#ffffff',
      border: '1px solid #ccc'
    });
  }

  assign(context, {
    options: options,
    style: style
  });

  return context;
};


/**
 * Get the editing bounding box based on the element's size and position.
 *
 * @param {Element} element
 *
 * @return {DirectEditingContext}
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

  var defaultStyle = this._textRenderer.getDefaultStyle(),
      externalStyle = this._textRenderer.getExternalStyle();

  // take zoom into account
  var externalFontSize = externalStyle.fontSize * zoom,
      externalLineHeight = externalStyle.lineHeight,
      defaultFontSize = defaultStyle.fontSize * zoom,
      defaultLineHeight = defaultStyle.lineHeight;

  var style = {
    fontFamily: this._textRenderer.getDefaultStyle().fontFamily,
    fontWeight: this._textRenderer.getDefaultStyle().fontWeight
  };

  // adjust for expanded pools AND lanes
  if (is(element, 'bpmn:Lane') || isExpandedPool(element)) {
    var isHorizontalLane = isHorizontal(element);

    var laneBounds = isHorizontalLane ? {
      width: bbox.height,
      height: 30 * zoom,
      x: bbox.x - bbox.height / 2 + (15 * zoom),
      y: mid.y - (30 * zoom) / 2
    } : {
      width: bbox.width,
      height: 30 * zoom
    };

    assign(bounds, laneBounds);

    assign(style, {
      fontSize: defaultFontSize + 'px',
      lineHeight: defaultLineHeight,
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px',
      transform: isHorizontalLane ? 'rotate(-90deg)' : null
    });
  }


  // internal labels for collapsed participants
  if (isCollapsedPool(element)) {
    var isHorizontalPool = isHorizontal(element);

    var poolBounds = isHorizontalPool ? {
      width: bbox.width,
      height: bbox.height
    } : {
      width: bbox.height,
      height: bbox.width,
      x: mid.x - bbox.height / 2,
      y: mid.y - bbox.width / 2
    };

    assign(bounds, poolBounds);

    assign(style, {
      fontSize: defaultFontSize + 'px',
      lineHeight: defaultLineHeight,
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px',
      transform: isHorizontalPool ? null : 'rotate(-90deg)'
    });
  }


  // internal labels for tasks and collapsed call activities
  // and sub processes
  if (isAny(element, [ 'bpmn:Task', 'bpmn:CallActivity' ]) ||
      isCollapsedSubProcess(element)) {

    assign(bounds, {
      width: bbox.width,
      height: bbox.height
    });

    assign(style, {
      fontSize: defaultFontSize + 'px',
      lineHeight: defaultLineHeight,
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
      fontSize: defaultFontSize + 'px',
      lineHeight: defaultLineHeight,
      paddingTop: (7 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (5 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px'
    });
  }

  var width = 90 * zoom,
      paddingTop = 7 * zoom,
      paddingBottom = 4 * zoom;

  // external labels for events, data elements, gateways, groups and connections
  if (target.labelTarget) {
    assign(bounds, {
      width: width,
      height: bbox.height + paddingTop + paddingBottom,
      x: mid.x - width / 2,
      y: bbox.y - paddingTop
    });

    assign(style, {
      fontSize: externalFontSize + 'px',
      lineHeight: externalLineHeight,
      paddingTop: paddingTop + 'px',
      paddingBottom: paddingBottom + 'px'
    });
  }

  // external label not yet created
  if (isLabelExternal(target)
      && !hasExternalLabel(target)
      && !isLabel(target)) {

    var externalLabelMid = getExternalLabelMid(element);

    var absoluteBBox = canvas.getAbsoluteBBox({
      x: externalLabelMid.x,
      y: externalLabelMid.y,
      width: 0,
      height: 0
    });

    var height = externalFontSize + paddingTop + paddingBottom;

    assign(bounds, {
      width: width,
      height: height,
      x: absoluteBBox.x - width / 2,
      y: absoluteBBox.y - height / 2
    });

    assign(style, {
      fontSize: externalFontSize + 'px',
      lineHeight: externalLineHeight,
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
      paddingTop: (5 * zoom) + 'px',
      paddingBottom: (7 * zoom) + 'px',
      paddingLeft: (7 * zoom) + 'px',
      paddingRight: (5 * zoom) + 'px',
      fontSize: defaultFontSize + 'px',
      lineHeight: defaultLineHeight
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

  if (isEmptyText(newLabel)) {
    newLabel = null;
  }

  this._modeling.updateLabel(element, newLabel, newBounds);
};



// helpers //////////

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

function isEmptyText(label) {
  return !label || !label.trim();
}