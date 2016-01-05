'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var Collections = require('diagram-js/lib/util/Collections');

var find = require('lodash/collection/find');

var is = require('../../../util/ModelUtil').is;

var TARGET_REF_PLACEHOLDER_NAME = '__targetRef_placeholder';


/**
 * This behavior makes sure we always set a fake
 * DataInputAssociation#targetRef as demanded by the BPMN 2.0
 * XSD schema.
 *
 * The reference is set to a bpmn:Property{ name: '__targetRef_placeholder' }
 * which is created on the fly and cleaned up afterwards if not needed
 * anymore.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 */
function DataInputAssociationBehavior(eventBus, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);


  this.executed([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectEnd'
  ], ifDataInputAssociation(fixTargetRef));

  this.reverted([
    'connection.create',
    'connection.delete',
    'connection.move',
    'connection.reconnectEnd'
  ], ifDataInputAssociation(fixTargetRef));


  function usesTargetRef(element, targetRef, removedConnection) {

    var inputAssociations = element.get('dataInputAssociations');

    return find(inputAssociations, function(association) {
      return association !== removedConnection &&
             association.targetRef === targetRef;
    });
  }

  function getTargetRef(element, create) {

    var properties = element.get('properties');

    var targetRefProp = find(properties, function(p) {
      return p.name === TARGET_REF_PLACEHOLDER_NAME;
    });

    if (!targetRefProp && create) {
      targetRefProp = bpmnFactory.create('bpmn:Property', {
        name: TARGET_REF_PLACEHOLDER_NAME
      });

      Collections.add(properties, targetRefProp);
    }

    return targetRefProp;
  }

  function cleanupTargetRef(element, connection) {

    var targetRefProp = getTargetRef(element);

    if (!targetRefProp) {
      return;
    }

    if (!usesTargetRef(element, targetRefProp, connection)) {
      Collections.remove(element.get('properties'), targetRefProp);
    }
  }

  /**
   * Make sure targetRef is set to a valid property or
   * `null` if the connection is detached.
   *
   * @param {Event} event
   */
  function fixTargetRef(event) {

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
        targetRefProp;

    if (oldTargetBo && oldTargetBo !== targetBo) {
      cleanupTargetRef(oldTargetBo, connectionBo);
    }

    if (newTargetBo && newTargetBo !== targetBo) {
      cleanupTargetRef(newTargetBo, connectionBo);
    }

    if (targetBo) {
      targetRefProp = getTargetRef(targetBo, true);
      dataAssociation.targetRef = targetRefProp;
    } else {
      dataAssociation.targetRef = null;
    }
  }
}

DataInputAssociationBehavior.$inject = [ 'eventBus', 'bpmnFactory' ];

inherits(DataInputAssociationBehavior, CommandInterceptor);

module.exports = DataInputAssociationBehavior;


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