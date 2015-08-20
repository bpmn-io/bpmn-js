'use strict';

var forEach = require('lodash/collection/forEach');

var Snap = require('../../../vendor/snapsvg');

var HANDLE_OFFSET = -2,
    HANDLE_SIZE  = 5,
    HANDLE_HIT_SIZE = 20;

var CLS_RESIZER   = 'djs-resizer';

var domEvent = require('min-dom/lib/event');

var isPrimaryButton = require('../../util/Mouse').isPrimaryButton;


/**
 * This component is responsible for adding resize handles.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Selection} selection
 * @param {Resize} resize
 * @param {ResizeVisuals} resizeVisuals
 */
function ResizeHandles(eventBus, elementRegistry, selection, resize) {

  this._elementRegistry = elementRegistry;
  this._resize = resize;

  var self = this;

  eventBus.on('selection.changed', function(e) {
    var oldSelection = e.oldSelection,
        newSelection = e.newSelection;

    // remove old selection markers
    forEach(oldSelection, self.removeResizer, self);

    // add new selection markers ONLY if single selection
    if (newSelection.length === 1) {
      forEach(newSelection, self.addResizer, self);
    }
  });

  eventBus.on('shape.changed', function(e) {
    var shape = e.element;

    self.removeResizer(shape);

    if (selection.isSelected(shape)) {
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


ResizeHandles.prototype._createResizer = function(gfx, x, y, rotation, direction) {
  var group = gfx.group().addClass(CLS_RESIZER).addClass(CLS_RESIZER + '-' + direction);

  var origin = -HANDLE_SIZE + HANDLE_OFFSET;

  // Create four drag indicators on the outline
  group.rect(origin, origin, HANDLE_SIZE, HANDLE_SIZE).addClass(CLS_RESIZER + '-visual');
  group.rect(origin, origin, HANDLE_HIT_SIZE, HANDLE_HIT_SIZE).addClass(CLS_RESIZER + '-hit');

  var matrix = new Snap.Matrix().translate(x, y).rotate(rotation, 0, 0);

  group.transform(matrix);

  return group;
};

ResizeHandles.prototype.createResizer = function(element, gfx, direction) {
  var resizer;

  if (direction === 'nw') {
    resizer = this._createResizer(gfx, 0, 0, 0, direction);
  } else if (direction === 'ne') {
    resizer = this._createResizer(gfx, element.width, 0, 90, direction);
  } else if (direction === 'se') {
    resizer = this._createResizer(gfx, element.width, element.height, 180, direction);
  } else {
    resizer = this._createResizer(gfx, 0, element.height, 270, direction);
  }

  this.makeDraggable(element, resizer, direction);
};

// resize handles implementation ///////////////////////////////
ResizeHandles.prototype.addResizer = function(shape) {
  var resize = this._resize,
      elementRegistry = this._elementRegistry;

  if (!resize.canResize({ shape: shape })) {
    return;
  }

  var gfx = elementRegistry.getGraphics(shape);

  this.createResizer(shape, gfx, 'nw');
  this.createResizer(shape, gfx, 'ne');
  this.createResizer(shape, gfx, 'se');
  this.createResizer(shape, gfx, 'sw');
};

ResizeHandles.prototype.removeResizer = function(shape) {
  var elementRegistry = this._elementRegistry;

  var gfx = elementRegistry.getGraphics(shape);
  var resizers = gfx.selectAll('.' + CLS_RESIZER);

  forEach(resizers, function(resizer){
    resizer.remove();
  });
};


ResizeHandles.$inject = [ 'eventBus', 'elementRegistry', 'selection', 'resize' ];

module.exports = ResizeHandles;
