'use strict';

var groupBy = require('lodash/collection/groupBy'),
    size = require('lodash/collection/size');

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');


function ModelingRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ModelingRules.$inject = [ 'eventBus' ];

module.exports = ModelingRules;

ModelingRules.prototype = Object.create(RuleProvider.prototype);


ModelingRules.prototype.init = function() {

  function nonExistantOrLabel(element) {
    return !element || element.labelTarget;
  }

  function isSame(a, b) {
    return a === b;
  }

  function isEventConnectionInvalid(source, target) {

    var sourceBo = source.businessObject,
        targetBo = target.businessObject;

    var startEventCheck = targetBo.$instanceOf('bpmn:StartEvent') ||
                            sourceBo.$instanceOf('bpmn:EndEvent');

    var eventBasedGatewayCheck = false;

    // Ensure target of event based gateway is one of:
    // receive task, receiving message, timer, signal, condition event
    if (sourceBo.$instanceOf('bpmn:EventBasedGateway')) {

      eventBasedGatewayCheck = true;

      if (targetBo.$instanceOf('bpmn:ReceiveTask')) {
        eventBasedGatewayCheck = false;
      } else if (targetBo.$instanceOf('bpmn:IntermediateCatchEvent') &&
                  targetBo.eventDefinitions && (
                    targetBo.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition' ||
                    targetBo.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition' ||
                    targetBo.eventDefinitions[0].$type === 'bpmn:ConditionalEventDefinition' ||
                    targetBo.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition')) {

        eventBasedGatewayCheck = false;
      }
    }

    return startEventCheck || eventBasedGatewayCheck;
  }


  // rules
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

    // only move between the same parent
    if (!isSame(source.parent, target.parent)) {
      return false;
    }

    var sourceBo = source.businessObject,
        targetBo = target.businessObject,
        connectionBo = connection && connection.businessObject;

    if (connectionBo && connectionBo.$instanceOf('bpmn:SequenceFlow')) {

      if (!sourceBo.$instanceOf('bpmn:FlowNode') ||
          !targetBo.$instanceOf('bpmn:FlowNode') ||
          sourceBo.$instanceOf('bpmn:EndEvent') ||
          targetBo.$instanceOf('bpmn:StartEvent')) {
        return false;
      }
    }

    // Do not allow incoming connections on StartEvents
    // and outgoing connections on EndEvents
    if (isEventConnectionInvalid(source, target)) {

      return false;
    }

    return (sourceBo.$instanceOf('bpmn:FlowNode') ||
            sourceBo.$instanceOf('bpmn:TextAnnotation')) &&
           (targetBo.$instanceOf('bpmn:FlowNode') ||
            targetBo.$instanceOf('bpmn:TextAnnotation'));
  }

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    return canConnect(source, target);
  });

  this.addRule('connection.reconnectStart', function(context) {

    var connection = context.connection,
        source = context.hover,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source,
        target = context.hover;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    // OK! but visually ignore
    return null;
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds,
        bo = shape.businessObject;

    if (!bo.$instanceOf('bpmn:SubProcess') || !bo.di.isExpanded) {
      return false;
    }

    if (newBounds) {
      if (newBounds.width < 100 || newBounds.height < 80) {
        return false;
      }
    }
  });

  /**
   * Can an element be dropped into the target element
   *
   * @return {Boolean}
   */
  function canDrop(businessObject, targetBusinessObject, targetDi) {

    if (businessObject.$instanceOf('bpmn:FlowElement') &&
        targetBusinessObject.$instanceOf('bpmn:FlowElementsContainer')) {

      // may not drop into collapsed sub processes
      if (targetDi.isExpanded === false) {
        return false;
      }

      return true;
    }

    if (businessObject.$instanceOf('bpmn:TextAnnotation') &&
        targetBusinessObject.$instanceOf('bpmn:FlowElementsContainer')) {

      return true;
    }

    return false;
  }

  this.addRule('shapes.move', function(context) {

    var target = context.newParent,
        shapes = context.shapes;

    // only move if they have the same parent
    var sameParent = size(groupBy(shapes, function(s) { return s.parent && s.parent.id; })) === 1;

    if (!sameParent) {
      return false;
    }

    if (!target) {
      return true;
    }

    var targetBusinessObject = target.businessObject,
        targetDi = targetBusinessObject.di;

    return shapes.every(function(s) {
      return canDrop(s.businessObject, targetBusinessObject, targetDi);
    });
  });

  this.addRule([ 'shape.create', 'shape.append' ], function(context) {
    var target = context.parent,
        shape = context.shape,
        source = context.source;

    // ensure we do not drop the element
    // into source
    var t = target;
    while (t) {
      if (isSame(t, source)) {
        return false;
      }

      t = t.parent;
    }

    if (!target) {
      return false;
    }

    if (target.labelTarget) {
      return null;
    }

    return canDrop(shape.businessObject, target.businessObject, target.businessObject.di);
  });

};
