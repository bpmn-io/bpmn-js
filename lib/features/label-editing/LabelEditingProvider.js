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


function LabelEditingProvider(eventBus, canvas, directEditing, commandStack) {

  directEditing.registerProvider(this);
  commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);

  // per default, listen to double click events
  eventBus.on('shape.dblclick', function(event) {
    directEditing.activate(event.element);
  });

  // per default, listen to double click events
  eventBus.on('connection.dblclick', function(event) {
    directEditing.activate(event.element);
  });

  // intercept direct canvas clicks to deselect all selected shapes
  eventBus.on('canvas.click', function(event) {
    directEditing.complete();
  });

  eventBus.on('canvas.viewbox.changed', function(event) {
    directEditing.complete();
  });

  this._canvas = canvas;
  this._commandStack = commandStack;
}


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


LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack' ];

module.exports = LabelEditingProvider;