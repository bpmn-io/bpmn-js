import inherits from 'inherits';

import {
  is as isBpmn
} from 'lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';


function isCustom(element, type) {

  if (!type) {
    return /custom:/.test(element.type);
  }

  return element && element.type === type;
}

function ifCustomElement(fn) {
  return function(event) {
    var context = event.context,
        element = context.shape || context.connection;

    if (!isBpmn(element, 'bpmn:BaseElement')) {
      fn(event);
    }
  };
}

/**
 * A handler responsible for updating the custom element's businessObject
 * once changes on the diagram happen
 */
export default function CustomUpdater(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  function updateTriangle(evt) {
    var context = evt.context,
        shape = context.shape,
        businessObject = shape.businessObject,
        leader = businessObject.leader,
        companions,
        parent,
        idx;

    if (!isCustom(shape, 'custom:triangle')) {
      return;
    }

    parent = shape.parent;

    if (!parent) {
      return;
    }

    if (isBpmn(parent, 'bpmn:SubProcess')) {
      shape.businessObject.foo = 'geil';
    }

    if (!isBpmn(parent, 'bpmn:SubProcess')) {
      shape.businessObject.foo = 'bar';
    }

    if (isCustom(parent, 'custom:circle')) {
      shape.businessObject.leader = parent;

      if (!parent.businessObject.companions) {
        parent.businessObject.companions = [];
      }
      parent.businessObject.companions.push(shape);
    }

    if (!isCustom(parent, 'custom:circle') && leader) {
      companions = leader.businessObject.companions;

      idx = companions.indexOf(shape);

      companions.splice(idx, 1);

      businessObject.leader = '';
    }
  }

  this.executed([
    'shape.move',
    'shape.create'
  ], ifCustomElement(updateTriangle));


  /**
   * When morphing a Process into a Collaboration or vice-versa,
   * make sure that the existing custom elements get their parents updated.
   */
  function updateCustomElementsRoot(event) {
    var context = event.context,
        oldRoot = context.oldRoot,
        newRoot = context.newRoot,
        children = oldRoot.children;

    var customChildren = children.filter(isCustom);

    if (customChildren.length) {
      modeling.moveElements(customChildren, { x: 0, y: 0 }, newRoot);
    }
  }

  this.postExecute('canvas.updateRoot', updateCustomElementsRoot);
}

inherits(CustomUpdater, CommandInterceptor);

CustomUpdater.$inject = [ 'eventBus', 'modeling' ];
