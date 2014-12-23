'use strict';

var _ = require('lodash');

var UpdateLabelHandler = require('./cmd/UpdateLabelHandler');

var LabelUtil = require('./LabelUtil'),
    DiUtil = require('../../util/Di');


var PADDING = 4;

var MIN_BOUNDS = {
  width: 150,
  height: 50
};


function LabelEditingProvider(eventBus, canvas, directEditing, commandStack, injector) {

  directEditing.registerProvider(this);
  commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function(event) {
    directEditing.activate(event.element);
  });

  // complete on followup canvas operation
  eventBus.on([ 'element.mousedown', 'drag.activate', 'canvas.viewbox.changed' ], function(event) {
    directEditing.complete();
  });

  // cancel on command stack changes
  eventBus.on([ 'commandStack.changed' ], function() {
    directEditing.cancel();
  });


  // activate direct editing for activities and text annotations


  if ('ontouchstart' in document.documentElement) {
    // we deactivate automatic label editing on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element here
    // and release the focused viewport after the direct edit operation is finished
  } else {
    eventBus.on('create.end', 500, function(e) {

      var element = e.shape,
          businessObject = element.businessObject;

      if (businessObject.$instanceOf('bpmn:Task') ||
          businessObject.$instanceOf('bpmn:TextAnnotation') ||
          (businessObject.$instanceOf('bpmn:SubProcess') && !businessObject.di.isExpanded)) {

        directEditing.activate(element);
      }
    });
  }

  this._canvas = canvas;
  this._commandStack = commandStack;
}

LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack', 'injector' ];

module.exports = LabelEditingProvider;


LabelEditingProvider.prototype.activate = function(element) {

  var semantic = element.businessObject,
      di = semantic.di;

  var text = LabelUtil.getLabel(element);

  if (text === undefined) {
    return;
  }

  var bbox = this.getEditingBBox(element);

  // adjust for expanded pools / lanes
  if ((semantic.$instanceOf('bpmn:Participant') && DiUtil.isExpandedPool(semantic)) ||
       semantic.$instanceOf('bpmn:Lane')) {

    bbox.width = MIN_BOUNDS.width;
    bbox.height = MIN_BOUNDS.height;

    bbox.x = bbox.x + 10 - bbox.width / 2;
    bbox.y = bbox.mid.y - bbox.height / 2;
  }

  // adjust for sub processes
  if (semantic.$instanceOf('bpmn:SubProcess') && DiUtil.isExpanded(semantic, di)) {

    bbox.height = MIN_BOUNDS.height;

    bbox.x = bbox.mid.x - bbox.width / 2;
    bbox.y = bbox.y + 10 - bbox.height / 2;
  }

  return { bounds: bbox, text: text };
};


LabelEditingProvider.prototype.getEditingBBox = function(element, maxBounds) {

  var target = element.label || element;

  var bbox = this._canvas.getAbsoluteBBox(target);

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };

  // external label
  if (target.labelTarget) {
    bbox.width = Math.max(bbox.width, MIN_BOUNDS.width);
    bbox.height = Math.max(bbox.height, MIN_BOUNDS.height);

    bbox.x = mid.x - bbox.width / 2;
  }

  bbox.mid = mid;

  return bbox;
};


LabelEditingProvider.prototype.update = function(element, newLabel) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel
  });
};