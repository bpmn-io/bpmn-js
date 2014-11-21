'use strict';

var _ = require('lodash');

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');

function ModelingRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ModelingRules.$inject = [ 'eventBus' ];

module.exports = ModelingRules;

ModelingRules.prototype = Object.create(RuleProvider.prototype);


ModelingRules.prototype.init = function() {

  // rules

  this.addRule('connection.create', function(context) {

    var source = context.source,
        target = context.target;

    if (!source || source.labelTarget || !target || target.labelTarget) {
      return null;
    }

    return source.businessObject.$parent === target.businessObject.$parent &&
           source.businessObject.$instanceOf('bpmn:FlowNode') &&
          !source.businessObject.$instanceOf('bpmn:EndEvent') &&
          !target.businessObject.$instanceOf('bpmn:StartEvent') &&
           target.businessObject.$instanceOf('bpmn:FlowElement');
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


  this.addRule('shapes.move', function(context) {

    var target = context.newParent,
        shapes = context.shapes;

    // only move if they have the same parent
    var sameParent = _.size(_.groupBy(shapes, function(s) { return s.parent && s.parent.id; }));

    if (!sameParent) {
      return false;
    }

    if (!target) {
      return true;
    }

    var targetBusinessObject = target.businessObject,
        targetDi = targetBusinessObject.di;

    // allow to drop elements elements into sub processes
    // unless they are participants or lanes themselves

    if (targetBusinessObject.$instanceOf('bpmn:SubProcess') && targetDi.isExpanded) {

      return shapes.every(function(shape) {
        var bo = shape.businessObject;
        return !(bo.$instanceOf('bpmn:Participant') || bo.$instanceOf('bpmn:Lane'));
      });
    } else {
      return false;
    }
  });

};