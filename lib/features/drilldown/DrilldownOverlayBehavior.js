import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { getBusinessObject, is } from '../../util/ModelUtil';
import { classes, domify } from 'min-dom';
import { getPlaneIdFromShape } from '../../util/DrilldownUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/overlays/Overlays').default} Overlays
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Parent} Parent
 * @typedef {import('../../model/Types').Shape} Shape
 */

var LOW_PRIORITY = 250;
var ARROW_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.81801948,3.50735931 L10.4996894,9.1896894 L10.5,4 L12,4 L12,12 L4,12 L4,10.5 L9.6896894,10.4996894 L3.75735931,4.56801948 C3.46446609,4.27512627 3.46446609,3.80025253 3.75735931,3.50735931 C4.05025253,3.21446609 4.52512627,3.21446609 4.81801948,3.50735931 Z"/></svg>';

var EMPTY_MARKER = 'bjs-drilldown-empty';

/**
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Overlays} overlays
 */
export default function DrilldownOverlayBehavior(
    canvas, eventBus, elementRegistry, overlays
) {
  CommandInterceptor.call(this, eventBus);

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._overlays = overlays;

  var self = this;

  this.executed('shape.toggleCollapse', LOW_PRIORITY, function(context) {
    var shape = context.shape;

    // Add overlay to the collapsed shape
    if (self._canDrillDown(shape)) {
      self._addOverlay(shape);
    } else {
      self._removeOverlay(shape);
    }
  }, true);


  this.reverted('shape.toggleCollapse', LOW_PRIORITY, function(context) {
    var shape = context.shape;

    // Add overlay to the collapsed shape
    if (self._canDrillDown(shape)) {
      self._addOverlay(shape);
    } else {
      self._removeOverlay(shape);
    }
  }, true);


  this.executed([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY,
    function(context) {
      var oldParent = context.oldParent,
          newParent = context.newParent || context.parent,
          shape = context.shape;

      // Add overlay to the collapsed shape
      if (self._canDrillDown(shape)) {
        self._addOverlay(shape);
      }

      self._updateDrilldownOverlay(oldParent);
      self._updateDrilldownOverlay(newParent);
      self._updateDrilldownOverlay(shape);
    }, true);


  this.reverted([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY,
    function(context) {
      var oldParent = context.oldParent,
          newParent = context.newParent || context.parent,
          shape = context.shape;

      // Add overlay to the collapsed shape
      if (self._canDrillDown(shape)) {
        self._addOverlay(shape);
      }

      self._updateDrilldownOverlay(oldParent);
      self._updateDrilldownOverlay(newParent);
      self._updateDrilldownOverlay(shape);
    }, true);


  eventBus.on('import.render.complete', function() {
    elementRegistry.filter(function(e) {
      return self._canDrillDown(e);
    }).map(function(el) {
      self._addOverlay(el);
    });
  });

}

inherits(DrilldownOverlayBehavior, CommandInterceptor);

/**
 * @param {Shape} shape
 */
DrilldownOverlayBehavior.prototype._updateDrilldownOverlay = function(shape) {
  var canvas = this._canvas;

  if (!shape) {
    return;
  }

  var root = canvas.findRoot(shape);

  if (root) {
    this._updateOverlayVisibility(root);
  }
};

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
DrilldownOverlayBehavior.prototype._canDrillDown = function(element) {
  var canvas = this._canvas;

  return is(element, 'bpmn:SubProcess') && canvas.findRoot(getPlaneIdFromShape(element));
};

/**
 * Update the visibility of the drilldown overlay. If the plane has no elements,
 * the drilldown will only be shown when the element is selected.
 *
 * @param {Parent} element The collapsed root or shape.
 */
DrilldownOverlayBehavior.prototype._updateOverlayVisibility = function(element) {
  var overlays = this._overlays;

  var businessObject = getBusinessObject(element);

  var overlay = overlays.get({ element: businessObject.id, type: 'drilldown' })[0];

  if (!overlay) {
    return;
  }

  var hasFlowElements = businessObject
    && businessObject.get('flowElements')
    && businessObject.get('flowElements').length;

  classes(overlay.html).toggle(EMPTY_MARKER, !hasFlowElements);
};

/**
 * Add a drilldown button to the given element assuming the plane has the same
 * ID as the element.
 *
 * @param {Shape} element The collapsed shape.
 */
DrilldownOverlayBehavior.prototype._addOverlay = function(element) {
  var canvas = this._canvas,
      overlays = this._overlays;

  var existingOverlays = overlays.get({ element: element, type: 'drilldown' });

  if (existingOverlays.length) {
    this._removeOverlay(element);
  }

  var button = domify('<button class="bjs-drilldown">' + ARROW_DOWN_SVG + '</button>');

  button.addEventListener('click', function() {
    canvas.setRootElement(canvas.findRoot(getPlaneIdFromShape(element)));
  });

  overlays.add(element, 'drilldown', {
    position: {
      bottom: -7,
      right: -8
    },
    html: button
  });

  this._updateOverlayVisibility(element);
};

DrilldownOverlayBehavior.prototype._removeOverlay = function(element) {
  var overlays = this._overlays;

  overlays.remove({
    element: element,
    type: 'drilldown'
  });
};

DrilldownOverlayBehavior.$inject = [
  'canvas',
  'eventBus',
  'elementRegistry',
  'overlays'
];