import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  getDi,
  is
} from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

import UpdateSemanticParentHandler from '../cmd/UpdateSemanticParentHandler';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/command/CommandStack').default} CommandStack
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * BPMN specific data store behavior.
 *
 * @param {Canvas} canvas
 * @param {CommandStack} commandStack
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 */
export default function DataStoreBehavior(
    canvas, commandStack, elementRegistry,
    eventBus) {

  CommandInterceptor.call(this, eventBus);

  commandStack.registerHandler('dataStore.updateContainment', UpdateSemanticParentHandler);

  function getFirstParticipantWithProcessRef() {
    return elementRegistry.filter(function(element) {
      return is(element, 'bpmn:Participant') && getBusinessObject(element).processRef;
    })[0];
  }

  function getDataStores(element) {
    return element.children.filter(function(child) {
      return is(child, 'bpmn:DataStoreReference') && !child.labelTarget;
    });
  }

  function updateDataStoreParent(dataStore, newDataStoreParent) {
    var dataStoreBo = dataStore.businessObject || dataStore;

    newDataStoreParent = newDataStoreParent || getFirstParticipantWithProcessRef();

    if (newDataStoreParent) {
      var newDataStoreParentBo = newDataStoreParent.businessObject || newDataStoreParent;

      commandStack.execute('dataStore.updateContainment', {
        dataStoreBo: dataStoreBo,
        dataStoreDi: getDi(dataStore),
        newSemanticParent: newDataStoreParentBo.processRef || newDataStoreParentBo,
        newDiParent: getDi(newDataStoreParent)
      });
    }
  }


  // disable auto-resize for data stores
  this.preExecute('shape.create', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:DataStoreReference') &&
        shape.type !== 'label') {

      if (!context.hints) {
        context.hints = {};
      }

      // prevent auto resizing
      context.hints.autoResize = false;
    }
  });


  // disable auto-resize for data stores
  this.preExecute('elements.move', function(event) {
    var context = event.context,
        shapes = context.shapes;

    var dataStoreReferences = shapes.filter(function(shape) {
      return is(shape, 'bpmn:DataStoreReference');
    });

    if (dataStoreReferences.length) {
      if (!context.hints) {
        context.hints = {};
      }

      // prevent auto resizing for data store references
      context.hints.autoResize = shapes.filter(function(shape) {
        return !is(shape, 'bpmn:DataStoreReference');
      });
    }
  });


  // update parent on data store created
  this.postExecute('shape.create', function(event) {
    var context = event.context,
        shape = context.shape,
        parent = shape.parent;


    if (is(shape, 'bpmn:DataStoreReference') &&
        shape.type !== 'label' &&
        is(parent, 'bpmn:Collaboration')) {

      updateDataStoreParent(shape);
    }
  });


  // update parent on data store moved
  this.postExecute('shape.move', function(event) {
    var context = event.context,
        shape = context.shape,
        oldParent = context.oldParent,
        parent = shape.parent;

    if (is(oldParent, 'bpmn:Collaboration')) {

      // do nothing if not necessary
      return;
    }

    if (is(shape, 'bpmn:DataStoreReference') &&
        shape.type !== 'label' &&
        is(parent, 'bpmn:Collaboration')) {

      var participant = is(oldParent, 'bpmn:Participant') ?
        oldParent :
        getAncestor(oldParent, 'bpmn:Participant');

      updateDataStoreParent(shape, participant);
    }
  });


  // update data store parents on participant or subprocess deleted
  this.postExecute('shape.delete', function(event) {
    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    if (isAny(shape, [ 'bpmn:Participant', 'bpmn:SubProcess' ])
        && is(rootElement, 'bpmn:Collaboration')) {
      getDataStores(rootElement)
        .filter(function(dataStore) {
          return isDescendant(dataStore, shape);
        })
        .forEach(function(dataStore) {
          updateDataStoreParent(dataStore);
        });
    }
  });

  // update data store parents on collaboration -> process
  this.postExecute('canvas.updateRoot', function(event) {
    var context = event.context,
        oldRoot = context.oldRoot,
        newRoot = context.newRoot;

    var dataStores = getDataStores(oldRoot);

    dataStores.forEach(function(dataStore) {

      if (is(newRoot, 'bpmn:Process')) {
        updateDataStoreParent(dataStore, newRoot);
      }

    });
  });
}

DataStoreBehavior.$inject = [
  'canvas',
  'commandStack',
  'elementRegistry',
  'eventBus',
];

inherits(DataStoreBehavior, CommandInterceptor);


// helpers //////////

function isDescendant(descendant, ancestor) {
  var descendantBo = descendant.businessObject || descendant,
      ancestorBo = ancestor.businessObject || ancestor;

  while (descendantBo.$parent) {
    if (descendantBo.$parent === ancestorBo.processRef || ancestorBo) {
      return true;
    }

    descendantBo = descendantBo.$parent;
  }

  return false;
}

function getAncestor(element, type) {

  while (element.parent) {
    if (is(element.parent, type)) {
      return element.parent;
    }

    element = element.parent;
  }
}