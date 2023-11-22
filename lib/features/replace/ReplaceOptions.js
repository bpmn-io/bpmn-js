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

/**
 * @type {ReplaceOption[]}
 */
export var START_EVENT = [
  {
    label: 'Start event',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate throw event',
    actionName: 'replace-with-none-intermediate-throwing',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End event',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message start event',
    actionName: 'replace-with-message-start',
    className: 'bpmn-icon-start-event-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer start event',
    actionName: 'replace-with-timer-start',
    className: 'bpmn-icon-start-event-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Conditional start event',
    actionName: 'replace-with-conditional-start',
    className: 'bpmn-icon-start-event-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Signal start event',
    actionName: 'replace-with-signal-start',
    className: 'bpmn-icon-start-event-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var START_EVENT_SUB_PROCESS = [
  {
    label: 'Start event',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate throw event',
    actionName: 'replace-with-none-intermediate-throwing',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End event',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var INTERMEDIATE_EVENT = [
  {
    label: 'Start event',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate throw event',
    actionName: 'replace-with-none-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End event',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message intermediate catch event',
    actionName: 'replace-with-message-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Message intermediate throw event',
    actionName: 'replace-with-message-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-message',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer intermediate catch event',
    actionName: 'replace-with-timer-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Escalation intermediate throw event',
    actionName: 'replace-with-escalation-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-escalation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Conditional intermediate catch event',
    actionName: 'replace-with-conditional-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Link intermediate catch event',
    actionName: 'replace-with-link-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-link',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:LinkEventDefinition',
      eventDefinitionAttrs: {
        name: ''
      }
    }
  },
  {
    label: 'Link intermediate throw event',
    actionName: 'replace-with-link-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-link',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:LinkEventDefinition',
      eventDefinitionAttrs: {
        name: ''
      }
    }
  },
  {
    label: 'Compensation intermediate throw event',
    actionName: 'replace-with-compensation-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-compensation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal intermediate catch event',
    actionName: 'replace-with-signal-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Signal intermediate throw event',
    actionName: 'replace-with-signal-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-signal',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var END_EVENT = [
  {
    label: 'Start event',
    actionName: 'replace-with-none-start',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate throw event',
    actionName: 'replace-with-none-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End event',
    actionName: 'replace-with-none-end',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message end event',
    actionName: 'replace-with-message-end',
    className: 'bpmn-icon-end-event-message',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Escalation end event',
    actionName: 'replace-with-escalation-end',
    className: 'bpmn-icon-end-event-escalation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Error end event',
    actionName: 'replace-with-error-end',
    className: 'bpmn-icon-end-event-error',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Cancel end event',
    actionName: 'replace-with-cancel-end',
    className: 'bpmn-icon-end-event-cancel',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition'
    }
  },
  {
    label: 'Compensation end event',
    actionName: 'replace-with-compensation-end',
    className: 'bpmn-icon-end-event-compensation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal end event',
    actionName: 'replace-with-signal-end',
    className: 'bpmn-icon-end-event-signal',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Terminate end event',
    actionName: 'replace-with-terminate-end',
    className: 'bpmn-icon-end-event-terminate',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:TerminateEventDefinition'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var GATEWAY = [
  {
    label: 'Exclusive gateway',
    actionName: 'replace-with-exclusive-gateway',
    className: 'bpmn-icon-gateway-xor',
    target: {
      type: 'bpmn:ExclusiveGateway'
    }
  },
  {
    label: 'Parallel gateway',
    actionName: 'replace-with-parallel-gateway',
    className: 'bpmn-icon-gateway-parallel',
    target: {
      type: 'bpmn:ParallelGateway'
    }
  },
  {
    label: 'Inclusive gateway',
    actionName: 'replace-with-inclusive-gateway',
    className: 'bpmn-icon-gateway-or',
    target: {
      type: 'bpmn:InclusiveGateway'
    }
  },
  {
    label: 'Complex gateway',
    actionName: 'replace-with-complex-gateway',
    className: 'bpmn-icon-gateway-complex',
    target: {
      type: 'bpmn:ComplexGateway'
    }
  },
  {
    label: 'Event-based gateway',
    actionName: 'replace-with-event-based-gateway',
    className: 'bpmn-icon-gateway-eventbased',
    target: {
      type: 'bpmn:EventBasedGateway',
      instantiate: false,
      eventGatewayType: 'Exclusive'
    }
  }

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
  {
    label: 'Transaction',
    actionName: 'replace-with-transaction',
    className: 'bpmn-icon-transaction',
    target: {
      type: 'bpmn:Transaction',
      isExpanded: true
    }
  },
  {
    label: 'Event sub-process',
    actionName: 'replace-with-event-subprocess',
    className: 'bpmn-icon-event-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      triggeredByEvent: true,
      isExpanded: true
    }
  },
  {
    label: 'Sub-process (collapsed)',
    actionName: 'replace-with-collapsed-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var TRANSACTION = [
  {
    label: 'Transaction',
    actionName: 'replace-with-transaction',
    className: 'bpmn-icon-transaction',
    target: {
      type: 'bpmn:Transaction',
      isExpanded: true
    }
  },
  {
    label: 'Sub-process',
    actionName: 'replace-with-subprocess',
    className: 'bpmn-icon-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: true
    }
  },
  {
    label: 'Event sub-process',
    actionName: 'replace-with-event-subprocess',
    className: 'bpmn-icon-event-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      triggeredByEvent: true,
      isExpanded: true
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var EVENT_SUB_PROCESS = TRANSACTION;

/**
 * @type {ReplaceOption[]}
 */
export var TASK = [
  {
    label: 'Task',
    actionName: 'replace-with-task',
    className: 'bpmn-icon-task',
    target: {
      type: 'bpmn:Task'
    }
  },
  {
    label: 'User task',
    actionName: 'replace-with-user-task',
    className: 'bpmn-icon-user',
    target: {
      type: 'bpmn:UserTask'
    }
  },
  {
    label: 'Service task',
    actionName: 'replace-with-service-task',
    className: 'bpmn-icon-service',
    target: {
      type: 'bpmn:ServiceTask'
    }
  },
  {
    label: 'Send task',
    actionName: 'replace-with-send-task',
    className: 'bpmn-icon-send',
    target: {
      type: 'bpmn:SendTask'
    }
  },
  {
    label: 'Receive task',
    actionName: 'replace-with-receive-task',
    className: 'bpmn-icon-receive',
    target: {
      type: 'bpmn:ReceiveTask'
    }
  },
  {
    label: 'Manual task',
    actionName: 'replace-with-manual-task',
    className: 'bpmn-icon-manual',
    target: {
      type: 'bpmn:ManualTask'
    }
  },
  {
    label: 'Business rule task',
    actionName: 'replace-with-rule-task',
    className: 'bpmn-icon-business-rule',
    target: {
      type: 'bpmn:BusinessRuleTask'
    }
  },
  {
    label: 'Script task',
    actionName: 'replace-with-script-task',
    className: 'bpmn-icon-script',
    target: {
      type: 'bpmn:ScriptTask'
    }
  },
  {
    label: 'Call activity',
    actionName: 'replace-with-call-activity',
    className: 'bpmn-icon-call-activity',
    target: {
      type: 'bpmn:CallActivity'
    }
  },
  {
    label: 'Sub-process (collapsed)',
    actionName: 'replace-with-collapsed-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false
    }
  },
  {
    label: 'Sub-process (expanded)',
    actionName: 'replace-with-expanded-subprocess',
    className: 'bpmn-icon-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: true
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var DATA_OBJECT_REFERENCE = [
  {
    label: 'Data store reference',
    actionName: 'replace-with-data-store-reference',
    className: 'bpmn-icon-data-store',
    target: {
      type: 'bpmn:DataStoreReference'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var DATA_STORE_REFERENCE = [
  {
    label: 'Data object reference',
    actionName: 'replace-with-data-object-reference',
    className: 'bpmn-icon-data-object',
    target: {
      type: 'bpmn:DataObjectReference'
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var BOUNDARY_EVENT = [
  {
    label: 'Message boundary event',
    actionName: 'replace-with-message-boundary',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Timer boundary event',
    actionName: 'replace-with-timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Escalation boundary event',
    actionName: 'replace-with-escalation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Conditional boundary event',
    actionName: 'replace-with-conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Error boundary event',
    actionName: 'replace-with-error-boundary',
    className: 'bpmn-icon-intermediate-event-catch-error',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Cancel boundary event',
    actionName: 'replace-with-cancel-boundary',
    className: 'bpmn-icon-intermediate-event-catch-cancel',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Signal boundary event',
    actionName: 'replace-with-signal-boundary',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Compensation boundary event',
    actionName: 'replace-with-compensation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-compensation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition',
      cancelActivity: true
    }
  },
  {
    label: 'Message boundary event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-message-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Timer boundary event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Escalation boundary event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-escalation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Conditional boundary event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Signal boundary event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-signal-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      cancelActivity: false
    }
  }
];

/**
 * @type {ReplaceOption[]}
 */
export var EVENT_SUB_PROCESS_START_EVENT = [
  {
    label: 'Message start event',
    actionName: 'replace-with-message-start',
    className: 'bpmn-icon-start-event-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Timer start event',
    actionName: 'replace-with-timer-start',
    className: 'bpmn-icon-start-event-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Conditional start event',
    actionName: 'replace-with-conditional-start',
    className: 'bpmn-icon-start-event-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Signal start event',
    actionName: 'replace-with-signal-start',
    className: 'bpmn-icon-start-event-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Error start event',
    actionName: 'replace-with-error-start',
    className: 'bpmn-icon-start-event-error',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Escalation start event',
    actionName: 'replace-with-escalation-start',
    className: 'bpmn-icon-start-event-escalation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Compensation start event',
    actionName: 'replace-with-compensation-start',
    className: 'bpmn-icon-start-event-compensation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition',
      isInterrupting: true
    }
  },
  {
    label: 'Message start event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-message-start',
    className: 'bpmn-icon-start-event-non-interrupting-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      isInterrupting: false
    }
  },
  {
    label: 'Timer start event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-timer-start',
    className: 'bpmn-icon-start-event-non-interrupting-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      isInterrupting: false
    }
  },
  {
    label: 'Conditional start event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-conditional-start',
    className: 'bpmn-icon-start-event-non-interrupting-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      isInterrupting: false
    }
  },
  {
    label: 'Signal start event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-signal-start',
    className: 'bpmn-icon-start-event-non-interrupting-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      isInterrupting: false
    }
  },
  {
    label: 'Escalation start event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-escalation-start',
    className: 'bpmn-icon-start-event-non-interrupting-escalation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      isInterrupting: false
    }
  }
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
  {
    label: 'Expanded pool/participant',
    actionName: 'replace-with-expanded-pool',
    className: 'bpmn-icon-participant',
    target: {
      type: 'bpmn:Participant',
      isExpanded: true
    }
  },
  {
    label: function(element) {
      var label = 'Empty pool/participant';

      if (element.children && element.children.length) {
        label += ' (removes content)';
      }

      return label;
    },
    actionName: 'replace-with-collapsed-pool',

    // TODO(@janstuemmel): maybe design new icon
    className: 'bpmn-icon-lane',
    target: {
      type: 'bpmn:Participant',
      isExpanded: false
    }
  }
];
