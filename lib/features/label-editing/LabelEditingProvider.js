'use strict';

var _ = require('lodash');

var UpdateTextHandler = require('./cmd/UpdateTextHandler');

var LabelUtil = require('./LabelUtil'),
    DiUtil = require('../../util/Di');


var minBounds = {
  width: 150,
  height: 100
};


function LabelEditingProvider(eventBus, canvas, directEditing, commandStack) {

  directEditing.registerProvider(this);
  commandStack.registerHandler('bpmnElement.updateText', UpdateTextHandler);

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

  var text = LabelUtil.getLabel(semantic);

  if (text === undefined) {
    return;
  }

  var bbox = this.getEditingBBox(element);

  // adjust for expanded pools / lanes
  if ((semantic.$instanceOf('bpmn:Participant') && DiUtil.isExpandedPool(semantic)) ||
       semantic.$instanceOf('bpmn:Lane')) {

    bbox.width = minBounds.width;
    bbox.height = minBounds.height;

    bbox.x = bbox.x + 10 - bbox.width / 2;
    bbox.y = bbox.mid.y - bbox.height / 2;
  }

  // adjust for sub processes
  if (semantic.$instanceOf('bpmn:SubProcess') && DiUtil.isExpanded(semantic, di)) {

    bbox.height = minBounds.height;

    bbox.x = bbox.mid.x - bbox.width / 2;
    bbox.y = bbox.y + 10 - bbox.height / 2;
  }

  return { bounds: bbox, text: text };
};


LabelEditingProvider.prototype.getEditingBBox = function(element, maxBounds) {

  var bbox = this._canvas.getAbsoluteBBox(element.label || element);

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };

  bbox.width = Math.max(bbox.width, minBounds.width);
  bbox.height = Math.max(bbox.height, minBounds.height);

  bbox.x = mid.x - bbox.width / 2;
  bbox.y = mid.y - bbox.height / 2;

  bbox.mid = mid;

  return bbox;
};


LabelEditingProvider.prototype.update = function(element, newText, oldText) {
  this._commandStack.execute('bpmnElement.updateText', {
    element: element,
    oldText: oldText,
    newText: newText
  });
};


LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack' ];

module.exports = LabelEditingProvider;