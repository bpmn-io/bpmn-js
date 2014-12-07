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
          (target.businessObject.$instanceOf('bpmn:FlowNode') ||
           target.businessObject.$instanceOf('bpmn:TextAnnotation'));
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
    var sameParent = _.size(_.groupBy(shapes, function(s) { return s.parent && s.parent.id; })) === 1;

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
      if (t === source) {
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