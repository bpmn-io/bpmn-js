'use strict';

var forEach = require('lodash/collection/forEach');

var Snap = require('../../../vendor/snapsvg');

var HANDLE_OFFSET = -2,
    HANDLE_SIZE  = 5,
    HANDLE_HIT_SIZE = 20;

var CLS_RESIZER   = 'djs-resizer';

var domEvent = require('min-dom/lib/event');

var isPrimaryButton = require('../../util/Mouse').isPrimaryButton;

var asTRBL = require('../../layout/LayoutUtil').asTRBL;


/**
 * This component is responsible for adding resize handles.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Selection} selection
 * @param {Resize} resize
 * @param {ResizeVisuals} resizeVisuals
 */
function ResizeHandles(eventBus, canvas, selection, resize) {

  this._resize = resize;
  this._canvas = canvas;

  var self = this;

  eventBus.on('selection.changed', function(e) {
    var newSelection = e.newSelection;

    // remove old selection markers
    self.removeResizers();

    // add new selection markers ONLY if single selection
    if (newSelection.length === 1) {
      forEach(newSelection, self.addResizer, self);
    }
  });

  eventBus.on('shape.changed', function(e) {
    var shape = e.element;

    if (selection.isSelected(shape)) {
      self.removeResizers();

      self.addResizer(shape);
    }
  });
}


ResizeHandles.prototype.makeDraggable = function(element, gfx, direction) {
  var resize = this._resize;

  function startResize(event) {
    // only trigger on left mouse button
    if (isPrimaryButton(event)) {
      resize.activate(event, element, direction);
    }
  }

  domEvent.bind(gfx.node, 'mousedown', startResize);
  domEvent.bind(gfx.node, 'touchstart', startResize);
};


ResizeHandles.prototype._createResizer = function(element, x, y, rotation, direction) {
  var resizersParent = this._getResizersParent();

  var group = resizersParent.group()
                  .addClass(CLS_RESIZER)
                  .addClass(CLS_RESIZER + '-' + element.id)
                  .addClass(CLS_RESIZER + '-' + direction);

  var origin = -HANDLE_SIZE + HANDLE_OFFSET;

  // Create four drag indicators on the outline
  group.rect(origin, origin, HANDLE_SIZE, HANDLE_SIZE).addClass(CLS_RESIZER + '-visual');
  group.rect(origin, origin, HANDLE_HIT_SIZE, HANDLE_HIT_SIZE).addClass(CLS_RESIZER + '-hit');

  var matrix = new Snap.Matrix().translate(x, y).rotate(rotation, 0, 0);

  group.transform(matrix);

  return group;
};

ResizeHandles.prototype.createResizer = function(element, direction) {
  var resizer;

  var trbl = asTRBL(element);

  if (direction === 'nw') {
    resizer = this._createResizer(element, trbl.left, trbl.top, 0, direction);
  } else if (direction === 'ne') {
    resizer = this._createResizer(element, trbl.right, trbl.top, 90, direction);
  } else if (direction === 'se') {
    resizer = this._createResizer(element, trbl.right, trbl.bottom, 180, direction);
  } else {
    resizer = this._createResizer(element, trbl.left, trbl.bottom, 270, direction);
  }

  this.makeDraggable(element, resizer, direction);
};

// resize handles implementation ///////////////////////////////

/**
 * Add resizers for a given element.
 *
 * @param {djs.model.Shape} shape
 */
ResizeHandles.prototype.addResizer = function(shape) {
  var resize = this._resize;

  if (!resize.canResize({ shape: shape })) {
    return;
  }

  this.createResizer(shape, 'nw');
  this.createResizer(shape, 'ne');
  this.createResizer(shape, 'se');
  this.createResizer(shape, 'sw');
};

/**
 * Remove all resizers
 */
ResizeHandles.prototype.removeResizers = function() {

  var resizersParent = this._getResizersParent();

  var resizers = resizersParent.selectAll('.' + CLS_RESIZER);

  forEach(resizers, function(resizer) {
    resizer.remove();
  });
};

ResizeHandles.prototype._getResizersParent = function() {
  return this._canvas.getLayer('resizers');
};

ResizeHandles.$inject = [ 'eventBus', 'canvas', 'selection', 'resize' ];

module.exports = ResizeHandles;
