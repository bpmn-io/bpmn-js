import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  computeChildrenBBox
} from 'diagram-js/lib/features/resize/ResizeUtil';


var LOW_PRIORITY = 500;


export default function ToggleElementCollapseBehaviour(
    eventBus, elementFactory, modeling,
    resize) {

  CommandInterceptor.call(this, eventBus);


  function hideEmptyLables(children) {
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
      hideEmptyLables(shape.children);

      // remove collapsed marker
      getBusinessObject(shape).di.isExpanded = true;
    } else {

      // place collapsed marker
      getBusinessObject(shape).di.isExpanded = false;
    }
  });

  this.reverted([ 'shape.toggleCollapse' ], LOW_PRIORITY, function(e) {

    var context = e.context;
    var shape = context.shape;


    // revert removing/placing collapsed marker
    if (!shape.collapsed) {
      getBusinessObject(shape).di.isExpanded = true;

    } else {
      getBusinessObject(shape).di.isExpanded = false;
    }
  });

  this.postExecuted([ 'shape.toggleCollapse' ], LOW_PRIORITY, function(e) {
    var shape = e.context.shape,
        defaultSize = elementFactory._getDefaultSize(shape),
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