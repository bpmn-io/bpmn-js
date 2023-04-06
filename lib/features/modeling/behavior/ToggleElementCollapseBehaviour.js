import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getDi,
  is
} from '../../../util/ModelUtil';

import {
  computeChildrenBBox
} from 'diagram-js/lib/features/resize/ResizeUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../ElementFactory').default} ElementFactory
 * @typedef {import('../Modeling').default} Modeling
 */

var LOW_PRIORITY = 500;

/**
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {Modeling} modeling
 */
export default function ToggleElementCollapseBehaviour(
    eventBus, elementFactory, modeling) {

  CommandInterceptor.call(this, eventBus);


  function hideEmptyLabels(children) {
    if (children.length) {
      children.forEach(function(child) {
        if (child.type === 'label' && !child.businessObject.name) {
          child.hidden = true;
        }
      });
    }
  }

  function expandedBounds(shape, defaultSize) {
    var children = shape.children,
        newBounds = defaultSize,
        visibleElements,
        visibleBBox;

    visibleElements = filterVisible(children).concat([ shape ]);

    visibleBBox = computeChildrenBBox(visibleElements);

    if (visibleBBox) {

      // center to visibleBBox with max(defaultSize, childrenBounds)
      newBounds.width = Math.max(visibleBBox.width, newBounds.width);
      newBounds.height = Math.max(visibleBBox.height, newBounds.height);

      newBounds.x = visibleBBox.x + (visibleBBox.width - newBounds.width) / 2;
      newBounds.y = visibleBBox.y + (visibleBBox.height - newBounds.height) / 2;
    } else {

      // center to collapsed shape with defaultSize
      newBounds.x = shape.x + (shape.width - newBounds.width) / 2;
      newBounds.y = shape.y + (shape.height - newBounds.height) / 2;
    }

    return newBounds;
  }

  function collapsedBounds(shape, defaultSize) {

    return {
      x: shape.x + (shape.width - defaultSize.width) / 2,
      y: shape.y + (shape.height - defaultSize.height) / 2,
      width: defaultSize.width,
      height: defaultSize.height
    };
  }

  this.executed([ 'shape.toggleCollapse' ], LOW_PRIORITY, function(e) {

    var context = e.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (!shape.collapsed) {

      // all children got made visible through djs, hide empty labels
      hideEmptyLabels(shape.children);

      // remove collapsed marker
      getDi(shape).isExpanded = true;
    } else {

      // place collapsed marker
      getDi(shape).isExpanded = false;
    }
  });

  this.reverted([ 'shape.toggleCollapse' ], LOW_PRIORITY, function(e) {

    var context = e.context;
    var shape = context.shape;


    // revert removing/placing collapsed marker
    if (!shape.collapsed) {
      getDi(shape).isExpanded = true;

    } else {
      getDi(shape).isExpanded = false;
    }
  });

  this.postExecuted([ 'shape.toggleCollapse' ], LOW_PRIORITY, function(e) {
    var shape = e.context.shape,
        defaultSize = elementFactory.getDefaultSize(shape),
        newBounds;

    if (shape.collapsed) {

      // resize to default size of collapsed shapes
      newBounds = collapsedBounds(shape, defaultSize);
    } else {

      // resize to bounds of max(visible children, defaultSize)
      newBounds = expandedBounds(shape, defaultSize);
    }

    modeling.resizeShape(shape, newBounds, null, {
      autoResize: shape.collapsed ? false : 'nwse'
    });
  });

}


inherits(ToggleElementCollapseBehaviour, CommandInterceptor);

ToggleElementCollapseBehaviour.$inject = [
  'eventBus',
  'elementFactory',
  'modeling'
];


// helpers //////////////////////

function filterVisible(elements) {
  return elements.filter(function(e) {
    return !e.hidden;
  });
}