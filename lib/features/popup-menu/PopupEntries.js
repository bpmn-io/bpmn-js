/**
 * Shared catalog of BPMN element popup entry definitions.
 *
 * Each entry is the context-independent identity of an element — its `target`
 * (moddle type + discriminating attributes), plus the `label` and `className`
 * shared across every menu that offers it (create, append, replace).
 *
 * Menus compose their own option lists from these atoms, adding menu-specific fields
 *
 * @typedef { {
 *   label: string;
 *   className: string;
 *   target: {
 *     type: string;
 *     isExpanded?: boolean;
 *     triggeredByEvent?: boolean;
 *     instantiate?: boolean;
 *     eventGatewayType?: string;
 *     isInterrupting?: boolean;
 *     cancelActivity?: boolean;
 *     eventDefinitionType?: string;
 *     eventDefinitionAttrs?: Record<string, any>;
 *   };
 * } } ElementDefinition
 *
 * @type {Record<string, ElementDefinition>}
 */
export const PopupEntries = {

  // Tasks
  'task': {
    label: 'Task',
    className: 'bpmn-icon-task',
    target: {
      type: 'bpmn:Task'
    }
  },
  'user-task': {
    label: 'User task',
    className: 'bpmn-icon-user',
    target: {
      type: 'bpmn:UserTask'
    }
  },
  'service-task': {
    label: 'Service task',
    className: 'bpmn-icon-service',
    target: {
      type: 'bpmn:ServiceTask'
    }
  },
  'send-task': {
    label: 'Send task',
    className: 'bpmn-icon-send',
    target: {
      type: 'bpmn:SendTask'
    }
  },
  'receive-task': {
    label: 'Receive task',
    className: 'bpmn-icon-receive',
    target: {
      type: 'bpmn:ReceiveTask'
    }
  },
  'manual-task': {
    label: 'Manual task',
    className: 'bpmn-icon-manual',
    target: {
      type: 'bpmn:ManualTask'
    }
  },
  'rule-task': {
    label: 'Business rule task',
    className: 'bpmn-icon-business-rule',
    target: {
      type: 'bpmn:BusinessRuleTask'
    }
  },
  'script-task': {
    label: 'Script task',
    className: 'bpmn-icon-script',
    target: {
      type: 'bpmn:ScriptTask'
    }
  },

  // Sub-processes
  'call-activity': {
    label: 'Call activity',
    className: 'bpmn-icon-call-activity',
    target: {
      type: 'bpmn:CallActivity'
    }
  },
  'transaction': {
    label: 'Transaction',
    className: 'bpmn-icon-transaction',
    target: {
      type: 'bpmn:Transaction',
      isExpanded: true
    }
  },
  'event-subprocess': {
    label: 'Event sub-process',
    className: 'bpmn-icon-event-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      triggeredByEvent: true,
      isExpanded: true
    }
  },
  'collapsed-subprocess': {
    label: 'Sub-process (collapsed)',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false
    }
  },
  'expanded-subprocess': {
    label: 'Sub-process (expanded)',
    className: 'bpmn-icon-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: true
    }
  },
  'collapsed-ad-hoc-subprocess': {
    label: 'Ad-hoc sub-process (collapsed)',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:AdHocSubProcess',
      isExpanded: false
    }
  },
  'expanded-ad-hoc-subprocess': {
    label: 'Ad-hoc sub-process (expanded)',
    className: 'bpmn-icon-subprocess-expanded',
    target: {
      type: 'bpmn:AdHocSubProcess',
      isExpanded: true
    }
  },

  // Gateways
  'exclusive-gateway': {
    label: 'Exclusive gateway',
    className: 'bpmn-icon-gateway-xor',
    target: {
      type: 'bpmn:ExclusiveGateway'
    }
  },
  'parallel-gateway': {
    label: 'Parallel gateway',
    className: 'bpmn-icon-gateway-parallel',
    target: {
      type: 'bpmn:ParallelGateway'
    }
  },
  'inclusive-gateway': {
    label: 'Inclusive gateway',
    className: 'bpmn-icon-gateway-or',
    target: {
      type: 'bpmn:InclusiveGateway'
    }
  },
  'complex-gateway': {
    label: 'Complex gateway',
    className: 'bpmn-icon-gateway-complex',
    target: {
      type: 'bpmn:ComplexGateway'
    }
  },
  'event-based-gateway': {
    label: 'Event-based gateway',
    className: 'bpmn-icon-gateway-eventbased',
    target: {
      type: 'bpmn:EventBasedGateway',
      instantiate: false,
      eventGatewayType: 'Exclusive'
    }
  },

  // Data
  'data-store-reference': {
    label: 'Data store reference',
    className: 'bpmn-icon-data-store',
    target: {
      type: 'bpmn:DataStoreReference'
    }
  },
  'data-object-reference': {
    label: 'Data object reference',
    className: 'bpmn-icon-data-object',
    target: {
      type: 'bpmn:DataObjectReference'
    }
  },

  // Participants
  'expanded-pool': {
    label: 'Expanded pool/participant',
    className: 'bpmn-icon-participant',
    target: {
      type: 'bpmn:Participant',
      isExpanded: true
    }
  },
  'collapsed-pool': {
    label: 'Empty pool/participant',
    className: 'bpmn-icon-lane',
    target: {
      type: 'bpmn:Participant',
      isExpanded: false
    }
  },

  // Events — none
  'none-start-event': {
    label: 'Start event',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  'none-intermediate-throwing': {
    label: 'Intermediate throw event',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  'none-boundary-event': {
    label: 'Boundary event',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:BoundaryEvent'
    }
  },
  'none-end-event': {
    label: 'End event',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },

  // Events — typed start
  'message-start': {
    label: 'Message start event',
    className: 'bpmn-icon-start-event-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      isInterrupting: true
    }
  },
  'timer-start': {
    label: 'Timer start event',
    className: 'bpmn-icon-start-event-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      isInterrupting: true
    }
  },
  'conditional-start': {
    label: 'Conditional start event',
    className: 'bpmn-icon-start-event-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      isInterrupting: true
    }
  },
  'signal-start': {
    label: 'Signal start event',
    className: 'bpmn-icon-start-event-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      isInterrupting: true
    }
  },
  'error-start': {
    label: 'Error start event',
    className: 'bpmn-icon-start-event-error',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition',
      isInterrupting: true
    }
  },
  'escalation-start': {
    label: 'Escalation start event',
    className: 'bpmn-icon-start-event-escalation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      isInterrupting: true
    }
  },
  'compensation-start': {
    label: 'Compensation start event',
    className: 'bpmn-icon-start-event-compensation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition',
      isInterrupting: true
    }
  },

  // Events — non-interrupting start (event subprocess)
  'non-interrupting-message-start': {
    label: 'Message start event (non-interrupting)',
    className: 'bpmn-icon-start-event-non-interrupting-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      isInterrupting: false
    }
  },
  'non-interrupting-timer-start': {
    label: 'Timer start event (non-interrupting)',
    className: 'bpmn-icon-start-event-non-interrupting-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      isInterrupting: false
    }
  },
  'non-interrupting-conditional-start': {
    label: 'Conditional start event (non-interrupting)',
    className: 'bpmn-icon-start-event-non-interrupting-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      isInterrupting: false
    }
  },
  'non-interrupting-signal-start': {
    label: 'Signal start event (non-interrupting)',
    className: 'bpmn-icon-start-event-non-interrupting-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      isInterrupting: false
    }
  },
  'non-interrupting-escalation-start': {
    label: 'Escalation start event (non-interrupting)',
    className: 'bpmn-icon-start-event-non-interrupting-escalation',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      isInterrupting: false
    }
  },

  // Events — intermediate (catch/throw)
  'message-intermediate-catch': {
    label: 'Message intermediate catch event',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  'message-intermediate-throw': {
    label: 'Message intermediate throw event',
    className: 'bpmn-icon-intermediate-event-throw-message',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  'timer-intermediate-catch': {
    label: 'Timer intermediate catch event',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  'escalation-intermediate-throw': {
    label: 'Escalation intermediate throw event',
    className: 'bpmn-icon-intermediate-event-throw-escalation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  'conditional-intermediate-catch': {
    label: 'Conditional intermediate catch event',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  'link-intermediate-catch': {
    label: 'Link intermediate catch event',
    className: 'bpmn-icon-intermediate-event-catch-link',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:LinkEventDefinition',
      eventDefinitionAttrs: {
        name: ''
      }
    }
  },
  'link-intermediate-throw': {
    label: 'Link intermediate throw event',
    className: 'bpmn-icon-intermediate-event-throw-link',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:LinkEventDefinition',
      eventDefinitionAttrs: {
        name: ''
      }
    }
  },
  'compensation-intermediate-throw': {
    label: 'Compensation intermediate throw event',
    className: 'bpmn-icon-intermediate-event-throw-compensation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  'signal-intermediate-catch': {
    label: 'Signal intermediate catch event',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  'signal-intermediate-throw': {
    label: 'Signal intermediate throw event',
    className: 'bpmn-icon-intermediate-event-throw-signal',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },

  // Events — boundary (interrupting)
  'message-boundary': {
    label: 'Message boundary event',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      cancelActivity: true
    }
  },
  'timer-boundary': {
    label: 'Timer boundary event',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: true
    }
  },
  'escalation-boundary': {
    label: 'Escalation boundary event',
    className: 'bpmn-icon-intermediate-event-catch-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      cancelActivity: true
    }
  },
  'conditional-boundary': {
    label: 'Conditional boundary event',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: true
    }
  },
  'error-boundary': {
    label: 'Error boundary event',
    className: 'bpmn-icon-intermediate-event-catch-error',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition',
      cancelActivity: true
    }
  },
  'cancel-boundary': {
    label: 'Cancel boundary event',
    className: 'bpmn-icon-intermediate-event-catch-cancel',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition',
      cancelActivity: true
    }
  },
  'signal-boundary': {
    label: 'Signal boundary event',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      cancelActivity: true
    }
  },
  'compensation-boundary': {
    label: 'Compensation boundary event',
    className: 'bpmn-icon-intermediate-event-catch-compensation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition',
      cancelActivity: true
    }
  },

  // Events — boundary (non-interrupting)
  'non-interrupting-message-boundary': {
    label: 'Message boundary event (non-interrupting)',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      cancelActivity: false
    }
  },
  'non-interrupting-timer-boundary': {
    label: 'Timer boundary event (non-interrupting)',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: false
    }
  },
  'non-interrupting-escalation-boundary': {
    label: 'Escalation boundary event (non-interrupting)',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      cancelActivity: false
    }
  },
  'non-interrupting-conditional-boundary': {
    label: 'Conditional boundary event (non-interrupting)',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: false
    }
  },
  'non-interrupting-signal-boundary': {
    label: 'Signal boundary event (non-interrupting)',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      cancelActivity: false
    }
  },

  // Events — typed end
  'message-end': {
    label: 'Message end event',
    className: 'bpmn-icon-end-event-message',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  'escalation-end': {
    label: 'Escalation end event',
    className: 'bpmn-icon-end-event-escalation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  'error-end': {
    label: 'Error end event',
    className: 'bpmn-icon-end-event-error',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition'
    }
  },
  'cancel-end': {
    label: 'Cancel end event',
    className: 'bpmn-icon-end-event-cancel',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition'
    }
  },
  'compensation-end': {
    label: 'Compensation end event',
    className: 'bpmn-icon-end-event-compensation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  'signal-end': {
    label: 'Signal end event',
    className: 'bpmn-icon-end-event-signal',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  'terminate-end': {
    label: 'Terminate end event',
    className: 'bpmn-icon-end-event-terminate',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:TerminateEventDefinition'
    }
  }
};
