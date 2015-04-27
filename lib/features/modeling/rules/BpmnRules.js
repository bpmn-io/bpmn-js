'use strict';

var groupBy = require('lodash/collection/groupBy'),
    size = require('lodash/collection/size'),
    find = require('lodash/collection/find'),
    inherits = require('inherits');

var getParents = require('../ModelingUtil').getParents,
    is = require('../../../util/ModelUtil').is,
    getBusinessObject = require('../../../util/ModelUtil').getBusinessObject,
    isExpanded = require('../../../util/DiUtil').isExpanded;


var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');

/**
 * BPMN specific modeling rule
 */
function BpmnRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(BpmnRules, RuleProvider);

BpmnRules.$inject = [ 'eventBus' ];

module.exports = BpmnRules;

BpmnRules.prototype.init = function() {

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    return canConnect(source, target);
  });

  this.addRule('connection.reconnectStart', function(context) {

    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    // OK! but visually ignore
    return null;
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('shapes.move', function(context) {

    var target = context.newParent,
        shapes = context.shapes;

    return canMove(shapes, target);
  });

  this.addRule([ 'shape.create', 'shape.append' ], function(context) {
    var target = context.parent,
        shape = context.shape,
        source = context.source;

    return canCreate(shape, target, source);
  });

};

BpmnRules.prototype.canConnectMessageFlow = canConnectMessageFlow;

BpmnRules.prototype.canConnectSequenceFlow = canConnectSequenceFlow;

BpmnRules.prototype.canConnectAssociation = canConnectAssociation;

BpmnRules.prototype.canMove = canMove;

BpmnRules.prototype.canDrop = canDrop;

BpmnRules.prototype.canCreate = canCreate;

BpmnRules.prototype.canConnect = canConnect;

BpmnRules.prototype.canResize = canResize;

/**
 * Utility functions for rule checking
 */

function nonExistantOrLabel(element) {
  return !element || isLabel(element);
}

function isSame(a, b) {
  return a === b;
}

function getOrganizationalParent(element) {

  var bo = getBusinessObject(element);

  while (bo && !is(bo, 'bpmn:Process')) {
    if (is(bo, 'bpmn:Participant')) {
      return bo.processRef || bo;
    }

    bo = bo.$parent;
  }

  return bo;
}

function isSameOrganization(a, b) {
  var parentA = getOrganizationalParent(a),
      parentB = getOrganizationalParent(b);

  return parentA === parentB;
}

function isMessageFlowSource(element) {
  return is(element, 'bpmn:InteractionNode') && (
            !is(element, 'bpmn:Event') || is(element, 'bpmn:ThrowEvent')
  );
}

function isMessageFlowTarget(element) {
  return is(element, 'bpmn:InteractionNode') && (
            !is(element, 'bpmn:Event') || is(element, 'bpmn:CatchEvent')
  );
}

function getScopeParent(element) {

  var bo = getBusinessObject(element);

  if (is(bo, 'bpmn:Participant')) {
    return null;
  }

  while (bo) {
    bo = bo.$parent;

    if (is(bo, 'bpmn:FlowElementsContainer')) {
      return bo;
    }
  }

  return bo;
}

function isSameScope(a, b) {
  var scopeParentA = getScopeParent(a),
      scopeParentB = getScopeParent(b);

  return scopeParentA && (scopeParentA === scopeParentB);
}

function hasEventDefinition(element, eventDefinition) {
  var bo = getBusinessObject(element);

  return find(bo.eventDefinitions || [], function(definition) {
    return is(definition, eventDefinition);
  });
}

function isSequenceFlowSource(element) {
  return is(element, 'bpmn:FlowNode') && !is(element, 'bpmn:EndEvent') && !(
            is(element, 'bpmn:IntermediateThrowEvent') &&
            hasEventDefinition(element, 'bpmn:LinkEventDefinition')
  );
}

function isSequenceFlowTarget(element) {
  return is(element, 'bpmn:FlowNode') && !is(element, 'bpmn:StartEvent') && !(
            is(element, 'bpmn:IntermediateCatchEvent') &&
            hasEventDefinition(element, 'bpmn:LinkEventDefinition')
  );
}

function isEventBasedTarget(element) {
  return is(element, 'bpmn:ReceiveTask') || (
         is(element, 'bpmn:IntermediateCatchEvent') && (
           hasEventDefinition(element, 'bpmn:MessageEventDefinition') ||
           hasEventDefinition(element, 'bpmn:TimerEventDefinition') ||
           hasEventDefinition(element, 'bpmn:ConditionalEventDefinition') ||
           hasEventDefinition(element, 'bpmn:SignalEventDefinition')
         )
  );
}

function isLabel(element) {
  return element.labelTarget;
}

function isConnection(element) {
  return element.waypoints;
}

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function canConnect(source, target, connection) {

  if (nonExistantOrLabel(source) || nonExistantOrLabel(target)) {
    return null;
  }

  // See https://github.com/bpmn-io/bpmn-js/issues/178
  // as a workround we disallow connections with same
  // target and source element.
  // This rule must be removed if a auto layout for this
  // connections is implemented.
  if (isSame(source, target)) {
    return false;
  }

  if (canConnectMessageFlow(source, target) ||
      canConnectSequenceFlow(source, target)) {

    return true;
  }

  if (is(connection, 'bpmn:Association')) {
    return canConnectAssociation(source, target);
  }

  return false;
}

/**
 * Can an element be dropped into the target element
 *
 * @return {Boolean}
 */
function canDrop(element, target) {

  // can move labels everywhere
  if (isLabel(element) && !isConnection(target)) {
    return true;
  }

  // allow to create new participants on
  // on existing collaboration and process diagrams
  if (is(element, 'bpmn:Participant')) {
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Collaboration');
  }

  // drop flow elements onto flow element containers
  // and participants
  if (is(element, 'bpmn:FlowElement')) {
    if (is(target, 'bpmn:FlowElementsContainer')) {
      return isExpanded(target) !== false;
    }

    return is(target, 'bpmn:Participant');
  }

  if (is(element, 'bpmn:Artifact')) {
    return is(target, 'bpmn:Collaboration') ||
           is(target, 'bpmn:Participant') ||
           is(target, 'bpmn:Process');
  }

  return false;
}

function canMove(elements, target) {

  // only move if they have the same parent
  var sameParent = size(groupBy(elements, function(s) { return s.parent && s.parent.id; })) === 1;

  if (!sameParent) {
    return false;
  }

  if (!target) {
    return true;
  }

  return elements.every(function(element) {
    return canDrop(element, target);
  });
}

function canCreate(shape, target, source) {

  if (!target) {
    return false;
  }

  if (isLabel(target)) {
    return null;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  return canDrop(shape, target);
}

function canResize(shape, newBounds) {
  if (is(shape, 'bpmn:SubProcess')) {
    return isExpanded(shape) && (
          !newBounds || (newBounds.width >= 100 && newBounds.height >= 80)
    );
  }

  if (is(shape, 'bpmn:Participant')) {
    return !newBounds || (newBounds.width >= 100 && newBounds.height >= 80);
  }

  if (is(shape, 'bpmn:TextAnnotation')) {
    return true;
  }

  return false;
}

function canConnectAssociation(source, target) {

  // do not connect connections
  if (isConnection(source) || isConnection(target)) {
    return false;
  }

  // connect if different parent
  return !isParent(target, source) &&
         !isParent(source, target);
}

function canConnectMessageFlow(source, target) {

  return isMessageFlowSource(source) &&
         isMessageFlowTarget(target) &&
        !isSameOrganization(source, target);
}

function canConnectSequenceFlow(source, target) {

  return isSequenceFlowSource(source) &&
         isSequenceFlowTarget(target) &&
         isSameScope(source, target) &&
         !(is(source, 'bpmn:EventBasedGateway') && !isEventBasedTarget(target));
}