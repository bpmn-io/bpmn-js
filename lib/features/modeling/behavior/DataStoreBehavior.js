import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  getDi,
  is
} from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

import UpdateSemanticParentHandler from '../cmd/UpdateSemanticParentHandler';
import { isLabel } from '../../../util/LabelUtil';


/**
 * BPMN specific data store behavior
 */
export default function DataStoreBehavior(
    canvas, commandStack, elementRegistry,
    eventBus,
    modeling) {

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

    if (typeof newDataStoreParent === 'undefined') {
      newDataStoreParent = getFirstParticipantWithProcessRef();
    }

    if (newDataStoreParent) {
      var newDataStoreParentBo = newDataStoreParent.businessObject || newDataStoreParent;

      commandStack.execute('dataStore.updateContainment', {
        dataStoreBo: dataStoreBo,
        dataStoreDi: getDi(dataStore),
        newSemanticParent: newDataStoreParentBo.processRef || newDataStoreParentBo,
        newDiParent: getDi(newDataStoreParent)
      });
    } else {
      dataStore = elementRegistry.get(dataStore.id);

      // data store may already be deleted at this point
      if (dataStore) {

        // remove data store which has no valid attach
        // candidate anymore
        modeling.removeShape(dataStore);
      }
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

    if (!isDataStore(shape)) {
      return;
    }

    if (!is(parent, 'bpmn:Collaboration')) {
      return;
    }

    updateDataStoreParent(shape);
  });


  // update parent on data store moved
  this.postExecute('shape.move', function(event) {
    var context = event.context,
        shape = context.shape,
        oldParent = context.oldParent,
        parent = shape.parent;

    if (!isDataStore(shape)) {
      return;
    }

    if (is(oldParent, 'bpmn:Collaboration') || !is(parent, 'bpmn:Collaboration')) {

      // do nothing if not necessary
      return;
    }

    var participant = getClosesParent(oldParent, 'bpmn:Participant');

    updateDataStoreParent(shape, participant);
  });


  // update data store parents on participant or subprocess deleted
  this.postExecute('shape.delete', function(event) {
    var context = event.context,
        shape = context.shape,
        rootElement = canvas.getRootElement();

    if (!is(rootElement, 'bpmn:Collaboration')) {
      return;
    }

    if (isDataStore(shape)) {
      updateDataStoreParent(shape, null);
    }

    if (!isAny(shape, [ 'bpmn:Participant', 'bpmn:SubProcess' ])) {
      return;
    }

    getDataStores(rootElement)
      .filter(function(dataStore) {
        return isDescendant(dataStore, shape);
      })
      .forEach(function(dataStore) {

        console.log('updateDataStoreParent', dataStore, shape, rootElement);

        updateDataStoreParent(dataStore);
      });

  });

  // update data store parents on collaboration -> process
  this.postExecute('canvas.updateRoot', function(event) {
    var context = event.context,
        oldRoot = context.oldRoot,
        newRoot = context.newRoot;

    var dataStores = getDataStores(oldRoot);

    dataStores.forEach(function(dataStore) {

      console.log('update daastore parent!');

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
  'modeling'
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

function getClosesParent(element, type) {

  while (element) {
    if (is(element, type)) {
      return element;
    }

    element = element.parent;
  }
}

function isDataStore(shape) {
  return is(shape, 'bpmn:DataStoreReference') && !isLabel(shape);
}