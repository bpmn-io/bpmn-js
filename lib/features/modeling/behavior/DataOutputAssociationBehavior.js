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
 * This behavior makes sure a bpmn:DataOutput is created and referenced when a
 * bpmn:DataOutputAssociation is created. It also makes sure the bpmn:DataOutput and
 * the reference are removed when a bpmn:OutputAssociation is removed.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 */
export default function DataOutputAssociationBehavior(eventBus, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);


  this.executed([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectStart'
  ], ifDataOutputAssociation(updateSoureRef));

  this.reverted([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectStart'
  ], ifDataOutputAssociation(updateSoureRef));

  /**
   * Create and return bpmn:DataOutput.
   *
   * Create bpmn:InputOutputSpecification, dataOutputs and outputSets if not
   * found.
   *
   * @param {ModdleElement} element - Element.
   *
   * @returns {ModdleElement}
   */
  function createDataOutput(element) {
    var ioSpecification = element.get('ioSpecification');

    var inputSet, outputSet;

    if (!ioSpecification) {
      ioSpecification = bpmnFactory.create('bpmn:InputOutputSpecification', {
        dataOutputs: [],
        outputSets: []
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

    var dataOutput = bpmnFactory.create('bpmn:DataOutput');

    dataOutput.$parent = ioSpecification;

    if (!ioSpecification.dataOutputs) {
      ioSpecification.dataOutputs = [];
    }

    collectionAdd(ioSpecification.get('dataOutputs'), dataOutput);

    if (!ioSpecification.outputSets) {
      outputSet = bpmnFactory.create('bpmn:OutputSet', {
        dataOutputRefs: [],
        name: 'Outputs'
      });

      outputSet.$parent = ioSpecification;

      collectionAdd(ioSpecification.get('outputSets'), outputSet);
    }

    outputSet = ioSpecification.get('outputSets')[0];

    collectionAdd(outputSet.dataOutputRefs, dataOutput);

    return dataOutput;
  }

  /**
   * Remove bpmn:DataOutput that is referenced by connection as sourceRef from
   * bpmn:InputOutputSpecification.
   *
   * @param {ModdleElement} element - Element.
   * @param {ModdleElement} connection - Connection that references
   * bpmn:DataOutput.
   */
  function removeDataOutput(element, connection) {
    var dataOutput = getDataOutput(element, connection.get('sourceRef')[0]);

    if (!dataOutput) {
      return;
    }

    var ioSpecification = element.get('ioSpecification');

    if (ioSpecification &&
        ioSpecification.dataOutputs &&
        ioSpecification.outputSets) {

      collectionRemove(ioSpecification.dataOutputs, dataOutput);

      collectionRemove(ioSpecification.outputSets[0].dataOutputRefs, dataOutput);

      cleanUpIoSpecification(element);
    }
  }

  /**
   * Make sure sourceRef is set to a valid bpmn:DataOutput or
   * `null` if the connection is detached.
   *
   * @param {Event} event - Event.
   */
  function updateSoureRef(event) {
    var context = event.context,
        connection = context.connection,
        connectionBo = connection.businessObject,
        source = connection.source,
        sourceBo = source && source.businessObject,
        newsource = context.newsource,
        newsourceBo = newsource && newsource.businessObject,
        oldsource = context.oldsource || context.source,
        oldsourceBo = oldsource && oldsource.businessObject;

    var dataAssociation = connection.businessObject,
        dataOutput;

    if (oldsourceBo && oldsourceBo !== sourceBo) {
      removeDataOutput(oldsourceBo, connectionBo);
    }

    if (newsourceBo && newsourceBo !== sourceBo) {
      removeDataOutput(newsourceBo, connectionBo);
    }

    if (sourceBo) {
      dataOutput = createDataOutput(sourceBo, true);

      // sourceRef is isMany
      dataAssociation.get('sourceRef')[0] = dataOutput;
    } else {
      dataAssociation.sourceRef = null;
    }
  }
}

DataOutputAssociationBehavior.$inject = [
  'eventBus',
  'bpmnFactory'
];

inherits(DataOutputAssociationBehavior, CommandInterceptor);

// helpers //////////

/**
 * Only call the given function when the event
 * touches a bpmn:DataOutputAssociation.
 *
 * @param {Function} fn
 * @return {Function}
 */
function ifDataOutputAssociation(fn) {
  return function(event) {
    var context = event.context,
        connection = context.connection;

    if (is(connection, 'bpmn:DataOutputAssociation')) {
      return fn(event);
    }
  };
}

/**
 * Get bpmn:DataOutput that is is referenced by element as sourceRef.
 *
 * @param {ModdleElement} element - Element.
 * @param {ModdleElement} sourceRef - Element that is sourceRef.
 *
 * @returns {ModdleElement}
 */
export function getDataOutput(element, sourceRef) {
  var ioSpecification = element.get('ioSpecification');

  if (ioSpecification && ioSpecification.dataOutputs) {
    return find(ioSpecification.dataOutputs, function(dataOutput) {
      return dataOutput === sourceRef;
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