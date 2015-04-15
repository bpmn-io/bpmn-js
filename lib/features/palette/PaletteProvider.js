'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for BPMN 2.0 elements.
 */
function PaletteProvider(palette, create, elementFactory) {

  this._create = create;
  this._elementFactory = elementFactory;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [ 'palette', 'create', 'elementFactory' ];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory;


  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    return {
      group: group,
      className: className,
      title: title || 'Create ' + type,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }


  assign(actions, {
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'icon-start-event-none'
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'icon-intermediate-event-none'
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'icon-end-event-none'
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'icon-gateway-xor'
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'icon-task'
    ),
    'create.subprocess-collapsed': createAction(
      'bpmn:SubProcess', 'activity', 'icon-subprocess-collapsed', 'Sub Process (collapsed)',
      { isExpanded: false }
    ),
    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'icon-subprocess-expanded', 'Sub Process (expanded)',
      { isExpanded: true }
    ),
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'icon-participant',
      title: 'Create a participant',
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    }
  });

  return actions;
};
