import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { is } from '../../util/ModelUtil';
import { classes, domify } from 'min-dom';
import { getPlaneIdFromShape } from '../../util/DrilldownUtil';

var LOW_PRIORITY = 250;
var ARROW_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.81801948,3.50735931 L10.4996894,9.1896894 L10.5,4 L12,4 L12,12 L4,12 L4,10.5 L9.6896894,10.4996894 L3.75735931,4.56801948 C3.46446609,4.27512627 3.46446609,3.80025253 3.75735931,3.50735931 C4.05025253,3.21446609 4.52512627,3.21446609 4.81801948,3.50735931 Z"/></svg>';

var EMPTY_MARKER = 'bjs-drilldown-empty';

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
    if (self.canDrillDown(shape)) {
      self.addOverlay(shape);
    } else {
      self.removeOverlay(shape);
    }
  }, true);


  this.reverted('shape.toggleCollapse', LOW_PRIORITY, function(context) {
    var shape = context.shape;

    // Add overlay to the collapsed shape
    if (self.canDrillDown(shape)) {
      self.addOverlay(shape);
    } else {
      self.removeOverlay(shape);
    }
  }, true);


  this.executed([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY,
    function(context) {
      var oldParent = context.oldParent,
          newParent = context.newParent || context.parent,
          shape = context.shape;

      // Add overlay to the collapsed shape
      if (self.canDrillDown(shape)) {
        self.addOverlay(shape);
      }

      self.updateDrilldownOverlay(oldParent);
      self.updateDrilldownOverlay(newParent);
      self.updateDrilldownOverlay(shape);
    }, true);


  this.reverted([ 'shape.create', 'shape.move', 'shape.delete' ], LOW_PRIORITY,
    function(context) {
      var oldParent = context.oldParent,
          newParent = context.newParent || context.parent,
          shape = context.shape;

      // Add overlay to the collapsed shape
      if (self.canDrillDown(shape)) {
        self.addOverlay(shape);
      }

      self.updateDrilldownOverlay(oldParent);
      self.updateDrilldownOverlay(newParent);
      self.updateDrilldownOverlay(shape);
    }, true);


  eventBus.on('import.render.complete', function() {
    elementRegistry.filter(function(e) {
      return self.canDrillDown(e);
    }).map(function(el) {
      self.addOverlay(el);
    });
  });

}

inherits(DrilldownOverlayBehavior, CommandInterceptor);

DrilldownOverlayBehavior.prototype.updateDrilldownOverlay = function(shape) {
  var canvas = this._canvas;

  if (!shape) {
    return;
  }

  var root = canvas.findRoot(shape);
  if (root) {
    this.updateOverlayVisibility(root);
  }
};


DrilldownOverlayBehavior.prototype.canDrillDown = function(element) {
  var canvas = this._canvas;
  return is(element, 'bpmn:SubProcess') && canvas.findRoot(getPlaneIdFromShape(element));
};

/**
 * Updates visibility of the drilldown overlay. If the plane has no elements,
 * the drilldown will be only shown when the element is selected.
 *
 * @param {djs.model.Shape|djs.model.Root} element collapsed shape or root element
 */
DrilldownOverlayBehavior.prototype.updateOverlayVisibility = function(element) {
  var overlays = this._overlays;

  var bo = element.businessObject;

  var overlay = overlays.get({ element: bo.id, type: 'drilldown' })[0];

  if (!overlay) {
    return;
  }

  var hasContent = bo && bo.flowElements && bo.flowElements.length;
  classes(overlay.html).toggle(EMPTY_MARKER, !hasContent);
};

/**
 * Attaches a drilldown button to the given element. We assume that the plane has
 * the same id as the element.
 *
 * @param {djs.model.Shape} element collapsed shape
 */
DrilldownOverlayBehavior.prototype.addOverlay = function(element) {
  var canvas = this._canvas;
  var overlays = this._overlays;

  var existingOverlays = overlays.get({ element: element, type: 'drilldown' });
  if (existingOverlays.length) {
    this.removeOverlay(element);
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

  this.updateOverlayVisibility(element);
};

DrilldownOverlayBehavior.prototype.removeOverlay = function(element) {
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