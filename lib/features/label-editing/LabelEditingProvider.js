'use strict';

var UpdateTextHandler = require('./cmd/UpdateTextHandler');


function LabelEditingProvider(eventBus, canvas, directEditing, commandStack, bpmnRegistry) {

  directEditing.registerProvider(this);
  commandStack.registerHandler('bpmnElement.updateText', UpdateTextHandler);


  // per default, listen to double click events
  eventBus.on('shape.dblclick', function(event) {
    directEditing.activate(event.element);
  }.bind(this));

  // intercept direct canvas clicks to deselect all
  // selected shapes
  eventBus.on('canvas.click', function(event) {
    directEditing.complete();
  });

  this._bpmnRegistry = bpmnRegistry;
  this._canvas = canvas;
  this._commandStack = commandStack;
}


LabelEditingProvider.prototype.activate = function(element) {

  var semantic = this._bpmnRegistry.getSemantic(element);

  var text;

  if (semantic.$instanceOf('bpmn:Pool') ||
      semantic.$instanceOf('bpmn:Lane')) {

    // TODO: Editing for pool / lane
  }

  if (semantic.$instanceOf('bpmn:TextAnnotation')) {
    text = semantic.text;
  }

  if (semantic.$instanceOf('bpmn:FlowElement')) {
    text = semantic.name;
  }

  var bbox = this.getEditingBBox(element);

  if (semantic) {
    return { bounds: bbox, text: text };
  }
};


LabelEditingProvider.prototype.getEditingBBox = function(element) {

  var bbox = this._canvas.getAbsoluteBBox(element.label || element);

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };

  var minWidth = 150;
  var minHeight = 100;

  bbox.width = Math.max(bbox.width, minWidth);
  bbox.height = Math.max(bbox.height, minHeight);

  bbox.x = mid.x - bbox.width / 2;
  bbox.y = mid.y - bbox.height / 2;

  return bbox;
};


LabelEditingProvider.prototype.update = function(element, newText, oldText) {
  this._commandStack.execute('bpmnElement.updateText', {
    element: element,
    oldText: oldText,
    newText: newText
  });
};


LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack', 'bpmnRegistry' ];

module.exports = LabelEditingProvider;