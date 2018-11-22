import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  find,
  forEach
} from 'min-dash';

import {
  is
} from '../../../util/ModelUtil';


/**
 * This behavior makes sure a bpmn:DataInput is created and referenced when a
 * bpmn:DataInputAssociation is created. It also makes sure the bpmn:DataInput and
 * the reference are removed when a bpmn:InputAssociation is removed.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 */
export default function DataInputAssociationBehavior(eventBus, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);


  this.executed([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectEnd'
  ], ifDataInputAssociation(updateTargetRef));

  this.reverted([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectEnd'
  ], ifDataInputAssociation(updateTargetRef));

  /**
   * Create and return bpmn:DataInput.
   *
   * Create bpmn:InputOutputSpecification, dataInputs and inputSets if not
   * found.
   *
   * @param {ModdleElement} element - Element.
   *
   * @returns {ModdleElement}
   */
  function createDataInput(element) {
    var ioSpecification = element.get('ioSpecification');

    var inputSet, outputSet;

    if (!ioSpecification) {
      ioSpecification = bpmnFactory.create('bpmn:InputOutputSpecification', {
        dataInputs: [],
        inputSets: []
      });

      element.ioSpecification = ioSpecification;

      inputSet = bpmnFactory.create('bpmn:InputSet', {
        dataInputRefs: [],
        name: 'Inputs'
      });

      inputSet.$parent = ioSpecification;

      collectionAdd(ioSpecification.get('inputSets'), inputSet);

      outputSet = bpmnFactory.create('bpmn:OutputSet', {
        dataOutputRefs: [],
        name: 'Outputs'
      });

      outputSet.$parent = ioSpecification;

      collectionAdd(ioSpecification.get('outputSets'), outputSet);
    }

    var dataInput = bpmnFactory.create('bpmn:DataInput');

    dataInput.$parent = ioSpecification;

    if (!ioSpecification.dataInputs) {
      ioSpecification.dataInputs = [];
    }

    collectionAdd(ioSpecification.get('dataInputs'), dataInput);

    if (!ioSpecification.inputSets) {
      inputSet = bpmnFactory.create('bpmn:InputSet', {
        dataInputRefs: [],
        name: 'Inputs'
      });

      inputSet.$parent = ioSpecification;

      collectionAdd(ioSpecification.get('inputSets'), inputSet);
    }

    inputSet = ioSpecification.get('inputSets')[0];

    collectionAdd(inputSet.dataInputRefs, dataInput);

    return dataInput;
  }

  /**
   * Remove bpmn:DataInput that is referenced by connection as targetRef from
   * bpmn:InputOutputSpecification.
   *
   * @param {ModdleElement} element - Element.
   * @param {ModdleElement} connection - Connection that references
   * bpmn:DataInput.
   */
  function removeDataInput(element, connection) {
    var dataInput = getDataInput(element, connection.targetRef);

    if (!dataInput) {
      return;
    }

    var ioSpecification = element.get('ioSpecification');

    if (ioSpecification &&
        ioSpecification.dataInputs &&
        ioSpecification.inputSets) {

      collectionRemove(ioSpecification.dataInputs, dataInput);

      collectionRemove(ioSpecification.inputSets[0].dataInputRefs, dataInput);

      cleanUpIoSpecification(element);
    }
  }

  /**
   * Make sure targetRef is set to a valid bpmn:DataInput or
   * `null` if the connection is detached.
   *
   * @param {Event} event - Event.
   */
  function updateTargetRef(event) {
    var context = event.context,
        connection = context.connection,
        connectionBo = connection.businessObject,
        target = connection.target,
        targetBo = target && target.businessObject,
        newTarget = context.newTarget,
        newTargetBo = newTarget && newTarget.businessObject,
        oldTarget = context.oldTarget || context.target,
        oldTargetBo = oldTarget && oldTarget.businessObject;

    var dataAssociation = connection.businessObject,
        dataInput;

    if (oldTargetBo && oldTargetBo !== targetBo) {
      removeDataInput(oldTargetBo, connectionBo);
    }

    if (newTargetBo && newTargetBo !== targetBo) {
      removeDataInput(newTargetBo, connectionBo);
    }

    if (targetBo) {
      dataInput = createDataInput(targetBo, true);

      dataAssociation.targetRef = dataInput;
    } else {
      dataAssociation.targetRef = null;
    }
  }
}

DataInputAssociationBehavior.$inject = [
  'eventBus',
  'bpmnFactory'
];

inherits(DataInputAssociationBehavior, CommandInterceptor);

// helpers //////////

/**
 * Only call the given function when the event
 * touches a bpmn:DataInputAssociation.
 *
 * @param {Function} fn
 * @return {Function}
 */
function ifDataInputAssociation(fn) {
  return function(event) {
    var context = event.context,
        connection = context.connection;

    if (is(connection, 'bpmn:DataInputAssociation')) {
      return fn(event);
    }
  };
}

/**
 * Get bpmn:DataInput that is is referenced by element as targetRef.
 *
 * @param {ModdleElement} element - Element.
 * @param {ModdleElement} targetRef - Element that is targetRef.
 *
 * @returns {ModdleElement}
 */
export function getDataInput(element, targetRef) {
  var ioSpecification = element.get('ioSpecification');

  if (ioSpecification && ioSpecification.dataInputs) {
    return find(ioSpecification.dataInputs, function(dataInput) {
      return dataInput === targetRef;
    });
  }
}

/**
 * Clean up and remove bpmn:InputOutputSpecification from an element if it's empty.
 *
 * @param {ModdleElement} element - Element.
 */
function cleanUpIoSpecification(element) {
  var ioSpecification = element.get('ioSpecification');

  var dataInputs,
      dataOutputs,
      inputSets,
      outputSets;

  if (ioSpecification) {
    dataInputs = ioSpecification.dataInputs;
    dataOutputs = ioSpecification.dataOutputs;
    inputSets = ioSpecification.inputSets;
    outputSets = ioSpecification.outputSets;

    if (dataInputs && !dataInputs.length) {
      delete ioSpecification.dataInputs;
    }

    if (dataOutputs && !dataOutputs.length) {
      delete ioSpecification.dataOutputs;
    }

    if ((!dataInputs || !dataInputs.length) &&
        (!dataOutputs || !dataOutputs.length) &&
        !inputSets[0].dataInputRefs.length &&
        !outputSets[0].dataOutputRefs.length) {

      delete element.ioSpecification;
    }
  }
}