'use strict';

var inherits = require('inherits');

var isBpmn = require('../../../lib/util/ModelUtil').is;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');


function isCustom(element, type) {
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
function CustomUpdater(eventBus, bpmnFactory, connectionDocking) {

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

}

inherits(CustomUpdater, CommandInterceptor);

module.exports = CustomUpdater;

CustomUpdater.$inject = [ 'eventBus' ];
