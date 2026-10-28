/**
 * @typedef { () => string } LabelGetter
 *
 * @typedef { {
 *   label: string | LabelGetter;
 *   actionName: string;
 *   className: string;
 *   target?: {
 *     type: string;
 *     isExpanded?: boolean;
 *     isInterrupting?: boolean;
 *     triggeredByEvent?: boolean;
 *     cancelActivity?: boolean;
 *     eventDefinitionType?: string;
 *     eventDefinitionAttrs?: Record<string, any>
 *   };
 * } } ReplaceOption
 */

import { PopupEntries } from '../popup-menu/PopupEntries';

/**
 * Build a replace option from the shared `PopupEntries` catalog. The `actionName`
 * defaults to `replace-with-<id>`.
 *
 * @param {string} id popup entry id
 * @param {Object} [extra] fields to override or add (e.g. `actionName`, `label`)
 *
 * @return {ReplaceOption}
 */
function replaceWith(id, extra = {}) {
  var entry = PopupEntries[id];

  if (!entry) {
    throw new Error('unknown popup entry <' + id + '>');
  }

  return {
    ...entry,
    actionName: 'replace-with-' + id,
    ...extra
  };
}

/**
 * @type {ReplaceOption[]}
 */
export var START_EVENT = [
  replaceWith('none-start-event', { actionName: 'replace-with-none-start' }),
  replaceWith('none-intermediate-throwing'),
  replaceWith('none-end-event', { actionName: 'replace-with-none-end' }),
  replaceWith('message-start'),
  replaceWith('timer-start'),
  replaceWith('conditional-start'),
  replaceWith('signal-start')
];

/**
 * @type {ReplaceOption[]}
 */
export var START_EVENT_SUB_PROCESS = [
  replaceWith('none-start-event', { actionName: 'replace-with-none-start' }),
  replaceWith('none-intermediate-throwing'),
  replaceWith('none-end-event', { actionName: 'replace-with-none-end' })
];

/**
 * @type {ReplaceOption[]}
 */
export var INTERMEDIATE_EVENT = [
  replaceWith('none-start-event', { actionName: 'replace-with-none-start' }),
  replaceWith('none-intermediate-throwing', { actionName: 'replace-with-none-intermediate-throw' }),
  replaceWith('none-end-event', { actionName: 'replace-with-none-end' }),
  replaceWith('message-intermediate-catch'),
  replaceWith('message-intermediate-throw'),
  replaceWith('timer-intermediate-catch'),
  replaceWith('escalation-intermediate-throw'),
  replaceWith('conditional-intermediate-catch'),
  replaceWith('link-intermediate-catch'),
  replaceWith('link-intermediate-throw'),
  replaceWith('compensation-intermediate-throw'),
  replaceWith('signal-intermediate-catch'),
  replaceWith('signal-intermediate-throw')
];

/**
 * @type {ReplaceOption[]}
 */
export var END_EVENT = [
  replaceWith('none-start-event', { actionName: 'replace-with-none-start' }),
  replaceWith('none-intermediate-throwing', { actionName: 'replace-with-none-intermediate-throw' }),
  replaceWith('none-end-event', { actionName: 'replace-with-none-end' }),
  replaceWith('message-end'),
  replaceWith('escalation-end'),
  replaceWith('error-end'),
  replaceWith('cancel-end'),
  replaceWith('compensation-end'),
  replaceWith('signal-end'),
  replaceWith('terminate-end')
];

/**
 * @type {ReplaceOption[]}
 */
export var GATEWAY = [
  replaceWith('exclusive-gateway'),
  replaceWith('parallel-gateway'),
  replaceWith('inclusive-gateway'),
  replaceWith('complex-gateway'),
  replaceWith('event-based-gateway')

  // Gateways deactivated until https://github.com/bpmn-io/bpmn-js/issues/194
  // {
  //   label: 'Event based instantiating Gateway',
  //   actionName: 'replace-with-exclusive-event-based-gateway',
  //   className: 'bpmn-icon-exclusive-event-based',
  //   target: {
  //     type: 'bpmn:EventBasedGateway'
  //   },
  //   options: {
  //     businessObject: { instantiate: true, eventGatewayType: 'Exclusive' }
  //   }
  // },
  // {
  //   label: 'Parallel Event based instantiating Gateway',
  //   actionName: 'replace-with-parallel-event-based-instantiate-gateway',
  //   className: 'bpmn-icon-parallel-event-based-instantiate-gateway',
  //   target: {
  //     type: 'bpmn:EventBasedGateway'
  //   },
  //   options: {
  //     businessObject: { instantiate: true, eventGatewayType: 'Parallel' }
  //   }
  // }
];

/**
 * @type {ReplaceOption[]}
 */
export var SUBPROCESS_EXPANDED = [
  replaceWith('transaction'),
  replaceWith('event-subprocess'),
  replaceWith('expanded-ad-hoc-subprocess', { actionName: 'replace-with-ad-hoc-subprocess', label: 'Ad-hoc sub-process' }),
  replaceWith('collapsed-subprocess')
];

/**
 * @type {ReplaceOption[]}
 */
export var AD_HOC_SUBPROCESS_EXPANDED = [
  replaceWith('expanded-subprocess', { actionName: 'replace-with-subprocess', label: 'Sub-process' }),
  replaceWith('transaction'),
  replaceWith('event-subprocess'),
  replaceWith('collapsed-ad-hoc-subprocess')
];

/**
 * @type {ReplaceOption[]}
 */
export var TRANSACTION = [
  replaceWith('transaction'),
  replaceWith('expanded-subprocess', { actionName: 'replace-with-subprocess', label: 'Sub-process' }),
  replaceWith('expanded-ad-hoc-subprocess', { actionName: 'replace-with-ad-hoc-subprocess', label: 'Ad-hoc sub-process' }),
  replaceWith('event-subprocess')
];

/**
 * @type {ReplaceOption[]}
 */
export var EVENT_SUB_PROCESS = TRANSACTION;

/**
 * @type {ReplaceOption[]}
 */
export var TASK = [
  replaceWith('task'),
  replaceWith('user-task'),
  replaceWith('service-task'),
  replaceWith('send-task'),
  replaceWith('receive-task'),
  replaceWith('manual-task'),
  replaceWith('rule-task'),
  replaceWith('script-task'),
  replaceWith('call-activity'),
  replaceWith('collapsed-subprocess'),
  replaceWith('expanded-subprocess'),
  replaceWith('collapsed-ad-hoc-subprocess'),
  replaceWith('expanded-ad-hoc-subprocess', { actionName: 'replace-with-ad-hoc-subprocess' })
];

/**
 * @type {ReplaceOption[]}
 */
export var DATA_OBJECT_REFERENCE = [
  replaceWith('data-store-reference')
];

/**
 * @type {ReplaceOption[]}
 */
export var DATA_STORE_REFERENCE = [
  replaceWith('data-object-reference')
];

/**
 * @type {ReplaceOption[]}
 */
export var BOUNDARY_EVENT = [
  replaceWith('message-boundary'),
  replaceWith('timer-boundary'),
  replaceWith('escalation-boundary'),
  replaceWith('conditional-boundary'),
  replaceWith('error-boundary'),
  replaceWith('cancel-boundary'),
  replaceWith('signal-boundary'),
  replaceWith('compensation-boundary'),
  replaceWith('non-interrupting-message-boundary'),
  replaceWith('non-interrupting-timer-boundary'),
  replaceWith('non-interrupting-escalation-boundary'),
  replaceWith('non-interrupting-conditional-boundary'),
  replaceWith('non-interrupting-signal-boundary')
];

/**
 * @type {ReplaceOption[]}
 */
export var EVENT_SUB_PROCESS_START_EVENT = [
  replaceWith('message-start'),
  replaceWith('timer-start'),
  replaceWith('conditional-start'),
  replaceWith('signal-start'),
  replaceWith('error-start'),
  replaceWith('escalation-start'),
  replaceWith('compensation-start'),
  replaceWith('non-interrupting-message-start'),
  replaceWith('non-interrupting-timer-start'),
  replaceWith('non-interrupting-conditional-start'),
  replaceWith('non-interrupting-signal-start'),
  replaceWith('non-interrupting-escalation-start')
];

/**
 * @type {ReplaceOption[]}
 */
export var SEQUENCE_FLOW = [
  {
    label: 'Sequence flow',
    actionName: 'replace-with-sequence-flow',
    className: 'bpmn-icon-connection'
  },
  {
    label: 'Default flow',
    actionName: 'replace-with-default-flow',
    className: 'bpmn-icon-default-flow'
  },
  {
    label: 'Conditional flow',
    actionName: 'replace-with-conditional-flow',
    className: 'bpmn-icon-conditional-flow'
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var PARTICIPANT = [
  replaceWith('expanded-pool'),
  replaceWith('collapsed-pool', {
    label: function(element) {
      var label = 'Empty pool/participant';

      if (element.children && element.children.length) {
        label += ' (removes content)';
      }

      return label;
    }
  })
];

/**
 * @type {{ [key: string]: ReplaceOption[]}}
 */
export var TYPED_EVENT = {
  'bpmn:MessageEventDefinition': [
    replaceWith('message-start'),
    replaceWith('message-intermediate-catch'),
    replaceWith('message-intermediate-throw'),
    replaceWith('message-end')
  ],
  'bpmn:TimerEventDefinition': [
    replaceWith('timer-start'),
    replaceWith('timer-intermediate-catch')
  ],
  'bpmn:ConditionalEventDefinition': [
    replaceWith('conditional-start'),
    replaceWith('conditional-intermediate-catch')
  ],
  'bpmn:SignalEventDefinition': [
    replaceWith('signal-start'),
    replaceWith('signal-intermediate-catch'),
    replaceWith('signal-intermediate-throw'),
    replaceWith('signal-end')
  ],
  'bpmn:ErrorEventDefinition': [
    replaceWith('error-start'),
    replaceWith('error-end')
  ],
  'bpmn:EscalationEventDefinition': [
    replaceWith('escalation-start'),
    replaceWith('escalation-intermediate-throw'),
    replaceWith('escalation-end')
  ],
  'bpmn:CompensateEventDefinition': [
    replaceWith('compensation-start'),
    replaceWith('compensation-intermediate-throw'),
    replaceWith('compensation-end')
  ]
};
