import {
  assign,
  forEach,
  isArray,
  every
} from 'min-dash';

import {
  is
} from '../../util/ModelUtil';

import {
  isExpanded,
  isHorizontal,
  isEventSubProcess
} from '../../util/DiUtil';

import {
  isAny
} from '../modeling/util/ModelingUtil';

import {
  getChildLanes
} from '../modeling/util/LaneUtil';

import {
  hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';

/**
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPad').default} ContextPad
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../modeling/ElementFactory').default} ElementFactory
 * @typedef {import('../append-preview/AppendPreview').default} AppendPreview
 * @typedef {import('diagram-js/lib/features/connect/Connect').default} Connect
 * @typedef {import('diagram-js/lib/features/create/Create').default} Create
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').default} PopupMenu
 * @typedef {import('diagram-js/lib/features/canvas/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/features/rules/Rules').default} Rules
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 *
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPadProvider').default<Element>} BaseContextPadProvider
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPadProvider').ContextPadEntries} ContextPadEntries
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPadProvider').ContextPadEntry} ContextPadEntry
 *
 * @typedef { { autoPlace?: boolean; } } ContextPadConfig
 */

/**
 * BPMN-specific context pad provider.
 *
 * @implements {BaseContextPadProvider}
 *
 * @param {ContextPadConfig} config
 * @param {Injector} injector
 * @param {EventBus} eventBus
 * @param {ContextPad} contextPad
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {Connect} connect
 * @param {Create} create
 * @param {PopupMenu} popupMenu
 * @param {Canvas} canvas
 * @param {Rules} rules
 * @param {Translate} translate
 * @param {AppendPreview} appendPreview
 */
export default function ContextPadProvider(
    config, injector, eventBus,
    contextPad, modeling, elementFactory,
    connect, create, popupMenu,
    canvas, rules, translate, appendPreview) {

  config = config || {};

  contextPad.registerProvider(this);

  this._contextPad = contextPad;

  this._modeling = modeling;

  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
  this._popupMenu = popupMenu;
  this._canvas = canvas;
  this._rules = rules;
  this._translate = translate;
  this._eventBus = eventBus;
  this._appendPreview = appendPreview;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get('autoPlace', false);
  }

  eventBus.on('create.end', 250, function(event) {
    var context = event.context,
        shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    var entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });

  eventBus.on('contextPad.close', function() {
    appendPreview.cleanUp();
  });
}

ContextPadProvider.$inject = [
  'config.contextPad',
  'injector',
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate',
  'appendPreview'
];

/**
 * @param {Element[]} elements
 *
 * @return {ContextPadEntries}
 */
ContextPadProvider.prototype.getMultiElementContextPadEntries = function(elements) {
  var modeling = this._modeling;

  var actions = {};

  if (this._isDeleteAllowed(elements)) {
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: this._translate('Delete'),
        action: {
          click: function(event, elements) {
            modeling.removeElements(elements.slice());
          }
        }
      }
    });
  }

  return actions;
};

/**
 * @param {Element[]} elements
 *
 * @return {boolean}
 */
ContextPadProvider.prototype._isDeleteAllowed = function(elements) {

  var baseAllowed = this._rules.allowed('elements.delete', {
    elements: elements
  });

  if (isArray(baseAllowed)) {
    return every(elements, el => baseAllowed.includes(el));
  }

  return baseAllowed;
};

/**
 * @param {Element} element
 *
 * @return {ContextPadEntries}
 */
ContextPadProvider.prototype.getContextPadEntries = function(element) {
  var contextPad = this._contextPad,
      modeling = this._modeling,
      elementFactory = this._elementFactory,
      connect = this._connect,
      create = this._create,
      popupMenu = this._popupMenu,
      autoPlace = this._autoPlace,
      translate = this._translate,
      appendPreview = this._appendPreview;

  var actions = {};

  if (element.type === 'label') {
    if (this._isDeleteAllowed([ element ])) {
      assign(actions, deleteAction());
    }

    return actions;
  }

  var businessObject = element.businessObject;

  function startConnect(event, element) {
    connect.start(event, element);
  }

  function removeElement(e, element) {
    modeling.removeElements([ element ]);
  }

  function deleteAction() {
    return {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('Delete'),
        action: {
          click: removeElement
        }
      }
    };
  }

  function getReplaceMenuPosition(element) {

    var Y_OFFSET = 5;

    var pad = contextPad.getPad(element).html;

    var padRect = pad.getBoundingClientRect();

    var pos = {
      x: padRect.left,
      y: padRect.bottom + Y_OFFSET
    };

    return pos;
  }

  /**
   * Create an append action.
   *
   * @param {string} type
   * @param {string} className
   * @param {string} title
   * @param {Object} [options]
   *
   * @return {ContextPadEntry}
   */
  function appendAction(type, className, title, options) {

    function appendStart(event, element) {

      var shape = elementFactory.createShape(assign({ type: type }, options));

      create.start(event, shape, {
        source: element
      });
    }

    var append = autoPlace ? function(_, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      autoPlace.append(element, shape);
    } : appendStart;

    var previewAppend = autoPlace ? function(_, element) {

      // mouseover
      appendPreview.create(element, type, options);

      return () => {

        // mouseout
        appendPreview.cleanUp();
      };
    } : null;

    return {
      group: 'model',
      className: className,
      title: title,
      action: {
        dragstart: appendStart,
        click: append,
        hover: previewAppend
      }
    };
  }

  function splitLaneHandler(count) {

    return function(_, element) {

      // actual split
      modeling.splitLane(element, count);

      // refresh context pad after split to
      // get rid of split icons
      contextPad.open(element, true);
    };
  }


  if (isAny(businessObject, [ 'bpmn:Lane', 'bpmn:Participant' ]) && isExpanded(element)) {

    var childLanes = getChildLanes(element);

    assign(actions, {
      'lane-insert-above': {
        group: 'lane-insert-above',
        className: 'bpmn-icon-lane-insert-above',
        title: translate('Add lane above'),
        action: {
          click: function(event, element) {
            modeling.addLane(element, 'top');
          }
        }
      }
    });

    if (childLanes.length < 2) {

      if (isHorizontal(element) ? element.height >= 120 : element.width >= 120) {
        assign(actions, {
          'lane-divide-two': {
            group: 'lane-divide',
            className: 'bpmn-icon-lane-divide-two',
            title: translate('Divide into two lanes'),
            action: {
              click: splitLaneHandler(2)
            }
          }
        });
      }

      if (isHorizontal(element) ? element.height >= 180 : element.width >= 180) {
        assign(actions, {
          'lane-divide-three': {
            group: 'lane-divide',
            className: 'bpmn-icon-lane-divide-three',
            title: translate('Divide into three lanes'),
            action: {
              click: splitLaneHandler(3)
            }
          }
        });
      }
    }

    assign(actions, {
      'lane-insert-below': {
        group: 'lane-insert-below',
        className: 'bpmn-icon-lane-insert-below',
        title: translate('Add lane below'),
        action: {
          click: function(event, element) {
            modeling.addLane(element, 'bottom');
          }
        }
      }
    });

  }

  if (is(businessObject, 'bpmn:FlowNode')) {

    if (is(businessObject, 'bpmn:EventBasedGateway')) {

      assign(actions, {
        'append.receive-task': appendAction(
          'bpmn:ReceiveTask',
          'bpmn-icon-receive-task',
          translate('Append receive task')
        ),
        'append.message-intermediate-event': appendAction(
          'bpmn:IntermediateCatchEvent',
          'bpmn-icon-intermediate-event-catch-message',
          translate('Append message intermediate catch event'),
          { eventDefinitionType: 'bpmn:MessageEventDefinition' }
        ),
        'append.timer-intermediate-event': appendAction(
          'bpmn:IntermediateCatchEvent',
          'bpmn-icon-intermediate-event-catch-timer',
          translate('Append timer intermediate catch event'),
          { eventDefinitionType: 'bpmn:TimerEventDefinition' }
        ),
        'append.condition-intermediate-event': appendAction(
          'bpmn:IntermediateCatchEvent',
          'bpmn-icon-intermediate-event-catch-condition',
          translate('Append conditional intermediate catch event'),
          { eventDefinitionType: 'bpmn:ConditionalEventDefinition' }
        ),
        'append.signal-intermediate-event': appendAction(
          'bpmn:IntermediateCatchEvent',
          'bpmn-icon-intermediate-event-catch-signal',
          translate('Append signal intermediate catch event'),
          { eventDefinitionType: 'bpmn:SignalEventDefinition' }
        )
      });
    } else if (isEventType(businessObject, 'bpmn:BoundaryEvent', 'bpmn:CompensateEventDefinition')) {

      assign(actions, {
        'append.compensation-activity':
            appendAction(
              'bpmn:Task',
              'bpmn-icon-task',
              translate('Append compensation activity'),
              {
                isForCompensation: true
              }
            )
      });
    } else if (!is(businessObject, 'bpmn:EndEvent') &&
        !businessObject.isForCompensation &&
        !isEventType(businessObject, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition') &&
        !isEventSubProcess(businessObject)) {

      assign(actions, {
        'append.end-event': appendAction(
          'bpmn:EndEvent',
          'bpmn-icon-end-event-none',
          translate('Append end event')
        ),
        'append.gateway': appendAction(
          'bpmn:ExclusiveGateway',
          'bpmn-icon-gateway-none',
          translate('Append gateway')
        ),
        'append.append-task': appendAction(
          'bpmn:Task',
          'bpmn-icon-task',
          translate('Append task')
        ),
        'append.intermediate-event': appendAction(
          'bpmn:IntermediateThrowEvent',
          'bpmn-icon-intermediate-event-none',
          translate('Append intermediate/boundary event')
        )
      });
    }
  }

  if (!popupMenu.isEmpty(element, 'bpmn-replace')) {

    // Replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        title: translate('Change element'),
        action: {
          click: function(event, element) {

            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'bpmn-replace', position, {
              title: translate('Change element'),
              width: 300,
              search: true
            });
          }
        }
      }
    });
  }

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    assign(actions, {
      'append.text-annotation': appendAction(
        'bpmn:TextAnnotation',
        'bpmn-icon-text-annotation',
        translate('Add text annotation')
      )
    });
  }

  if (is(businessObject, 'bpmn:MessageFlow')) {
    assign(actions, {
      'append.text-annotation': appendAction(
        'bpmn:TextAnnotation',
        'bpmn-icon-text-annotation',
        translate('Add text annotation')
      )
    });
  }

  if (
    isAny(businessObject, [
      'bpmn:FlowNode',
      'bpmn:InteractionNode',
      'bpmn:DataObjectReference',
      'bpmn:DataStoreReference',
    ])
  ) {
    assign(actions, {
      'append.text-annotation': appendAction(
        'bpmn:TextAnnotation',
        'bpmn-icon-text-annotation',
        translate('Add text annotation')
      ),
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate('Connect to other element'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  if (is(businessObject, 'bpmn:TextAnnotation')) {
    assign(actions, {
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate('Connect using association'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  if (isAny(businessObject, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])) {
    assign(actions, {
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate('Connect using data input association'),
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      }
    });
  }

  if (is(businessObject, 'bpmn:Group')) {
    assign(actions, {
      'append.text-annotation': appendAction(
        'bpmn:TextAnnotation',
        'bpmn-icon-text-annotation',
        translate('Add text annotation')
      )
    });
  }

  if (this._isDeleteAllowed([ element ])) {
    assign(actions, deleteAction());
  }

  return actions;
};


// helpers /////////

/**
 * @param {ModdleElement} businessObject
 * @param {string} type
 * @param {string} eventDefinitionType
 *
 * @return {boolean}
 */
function isEventType(businessObject, type, eventDefinitionType) {

  var isType = businessObject.$instanceOf(type);
  var isDefinition = false;

  var definitions = businessObject.eventDefinitions || [];
  forEach(definitions, function(def) {
    if (def.$type === eventDefinitionType) {
      isDefinition = true;
    }
  });

  return isType && isDefinition;
}
