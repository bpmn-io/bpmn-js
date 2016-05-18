'use strict';

var UpdateLabelHandler = require('./cmd/UpdateLabelHandler');

var LabelUtil = require('./LabelUtil');

var is = require('../../util/ModelUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded;


var MIN_BOUNDS = {
  width: 150,
  height: 50
};


function LabelEditingProvider(eventBus, canvas, directEditing, commandStack) {

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


  // activate direct editing for activities and text annotations


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

  this._canvas = canvas;
  this._commandStack = commandStack;
}

LabelEditingProvider.$inject = [ 'eventBus', 'canvas', 'directEditing', 'commandStack' ];

module.exports = LabelEditingProvider;


LabelEditingProvider.prototype.activate = function(element) {

  var text = LabelUtil.getLabel(element);

  if (text === undefined) {
    return;
  }

  var bbox = this.getEditingBBox(element);

  // adjust for expanded pools AND lanes
  if ((is(element, 'bpmn:Participant') && isExpanded(element)) || is(element, 'bpmn:Lane')) {

    bbox.width = MIN_BOUNDS.width;
    bbox.height = MIN_BOUNDS.height;

    bbox.x = bbox.x + 10 - bbox.width / 2;
    bbox.y = bbox.mid.y - bbox.height / 2;
  }

  // ajust minumum size for task and activities
  if ((is(element, 'bpmn:Task') || is(element, 'bpmn:Activity') )) {

    if (bbox.width < 100) {
      bbox.width = 100;
      bbox.x = bbox.mid.x - bbox.width / 2;
    }

    if (bbox.height < 80) {
      bbox.height = 80;
      bbox.y = bbox.mid.y - bbox.height / 2;
    }
  }

  // adjust for expanded sub processes and collapsed pools
  if ((is(element, 'bpmn:SubProcess') && isExpanded(element)) ||
    (is(element, 'bpmn:Participant') && !isExpanded(element))) {

    bbox.width = element.width;
    bbox.height = MIN_BOUNDS.height;

    bbox.x = bbox.mid.x - element.width / 2;
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
