'use strict';

module.exports.START_EVENT = [
  {
    label: 'Start Event',
    actionName: 'replace-with-none-start',
    className: 'icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate Throw Event',
    actionName: 'replace-with-none-intermediate-throwing',
    className: 'icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End Event',
    actionName: 'replace-with-none-end',
    className: 'icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message Start Event',
    actionName: 'replace-with-message-start',
    className: 'icon-start-event-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Start Event',
    actionName: 'replace-with-timer-start',
    className: 'icon-start-event-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinition: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Conditional Start Event',
    actionName: 'replace-with-conditional-start',
    className: 'icon-start-event-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinition: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Signal Start Event',
    actionName: 'replace-with-signal-start',
    className: 'icon-start-event-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  }
];

module.exports.INTERMEDIATE_EVENT = [
  {
    label: 'Start Event',
    actionName: 'replace-with-none-start',
    className: 'icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate Throw Event',
    actionName: 'replace-with-none-intermediate-throw',
    className: 'icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End Event',
    actionName: 'replace-with-none-end',
    className: 'icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message Intermediate Catch Event',
    actionName: 'replace-with-message-intermediate-catch',
    className: 'icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Message Intermediate Throw Event',
    actionName: 'replace-with-message-intermediate-throw',
    className: 'icon-intermediate-event-throw-message',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Intermediate Catch Event',
    actionName: 'replace-with-timer-intermediate-catch',
    className: 'icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Escalation Intermediate Catch Event',
    actionName: 'replace-with-escalation-intermediate-catch',
    className: 'icon-intermediate-event-catch-escalation',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Conditional Intermediate Catch Event',
    actionName: 'replace-with-conditional-intermediate-catch',
    className: 'icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Link Intermediate Catch Event',
    actionName: 'replace-with-link-intermediate-catch',
    className: 'icon-intermediate-event-catch-link',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:LinkEventDefinition'
    }
  },
  {
    label: 'Link Intermediate Throw Event',
    actionName: 'replace-with-link-intermediate-throw',
    className: 'icon-intermediate-event-throw-link',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinition: 'bpmn:LinkEventDefinition'
    }
  },
  {
    label: 'Compensation Intermediate Throw Event',
    actionName: 'replace-with-compensation-intermediate-throw',
    className: 'icon-intermediate-event-throw-compensation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinition: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal Intermediate Catch Event',
    actionName: 'replace-with-signal-intermediate-catch',
    className: 'icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Signal Intermediate Throw Event',
    actionName: 'replace-with-signal-intermediate-throw',
    className: 'icon-intermediate-event-throw-signal',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  }
];

module.exports.END_EVENT = [
  {
    label: 'Start Event',
    actionName: 'replace-with-none-start',
    className: 'icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate Throw Event',
    actionName: 'replace-with-none-intermediate-throw',
    className: 'icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'End Event',
    actionName: 'replace-with-none-end',
    className: 'icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  },
  {
    label: 'Message End Event',
    actionName: 'replace-with-message-end',
    className: 'icon-end-event-message',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Escalation End Event',
    actionName: 'replace-with-escalation-end',
    className: 'icon-end-event-escalation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Error End Event',
    actionName: 'replace-with-error-end',
    className: 'icon-end-event-error',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Cancel End Event',
    actionName: 'replace-with-cancel-end',
    className: 'icon-end-event-cancel',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:CancelEventDefinition'
    }
  },
  {
    label: 'Compensation End Event',
    actionName: 'replace-with-compensation-end',
    className: 'icon-end-event-compensation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal End Event',
    actionName: 'replace-with-signal-end',
    className: 'icon-end-event-signal',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Terminate End Event',
    actionName: 'replace-with-terminate-end',
    className: 'icon-end-event-terminate',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinition: 'bpmn:TerminateEventDefinition'
    }
  }
];

module.exports.GATEWAY = [
  {
    label: 'Exclusive Gateway',
    actionName: 'replace-with-exclusive-gateway',
    className: 'icon-gateway-xor',
    target: {
      type: 'bpmn:ExclusiveGateway'
    }
  },
  {
    label: 'Parallel Gateway',
    actionName: 'replace-with-parallel-gateway',
    className: 'icon-gateway-parallel',
    target: {
      type: 'bpmn:ParallelGateway'
    }
  },
  {
    label: 'Inclusive Gateway',
    actionName: 'replace-with-inclusive-gateway',
    className: 'icon-gateway-or',
    target: {
      type: 'bpmn:InclusiveGateway'
    }
  },
  {
    label: 'Complex Gateway',
    actionName: 'replace-with-complex-gateway',
    className: 'icon-gateway-complex',
    target: {
      type: 'bpmn:ComplexGateway'
    }
  },
  {
    label: 'Event based Gateway',
    actionName: 'replace-with-event-based-gateway',
    className: 'icon-gateway-eventbased',
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
  //   className: 'icon-exclusive-event-based',
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
  //   className: 'icon-parallel-event-based-instantiate-gateway',
  //   target: {
  //     type: 'bpmn:EventBasedGateway'
  //   },
  //   options: {
  //     businessObject: { instantiate: true, eventGatewayType: 'Parallel' }
  //   }
  // }
];

module.exports.SUBPROCESS_EXPANDED = [
  {
    label: 'Transaction',
    actionName: 'replace-with-transaction',
    className: 'icon-transaction',
    target: {
      type: 'bpmn:Transaction',
      isExpanded: true
    }
  }
];

module.exports.TRANSACTION = [
  {
    label: 'Sub Process',
    actionName: 'replace-with-subprocess',
    className: 'icon-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess'
    }
  }
];

module.exports.TASK = [
  {
    label: 'Task',
    actionName: 'replace-with-task',
    className: 'icon-task',
    target: {
      type: 'bpmn:Task'
    }
  },
  {
    label: 'Send Task',
    actionName: 'replace-with-send-task',
    className: 'icon-send',
    target: {
      type: 'bpmn:SendTask'
    }
  },
  {
    label: 'Receive Task',
    actionName: 'replace-with-receive-task',
    className: 'icon-receive',
    target: {
      type: 'bpmn:ReceiveTask'
    }
  },
  {
    label: 'User Task',
    actionName: 'replace-with-user-task',
    className: 'icon-user',
    target: {
      type: 'bpmn:UserTask'
    }
  },
  {
    label: 'Manual Task',
    actionName: 'replace-with-manual-task',
    className: 'icon-manual',
    target: {
      type: 'bpmn:ManualTask'
    }
  },
  {
    label: 'Business Rule Task',
    actionName: 'replace-with-rule-task',
    className: 'icon-business-rule',
    target: {
      type: 'bpmn:BusinessRuleTask'
    }
  },
  {
    label: 'Service Task',
    actionName: 'replace-with-service-task',
    className: 'icon-service',
    target: {
      type: 'bpmn:ServiceTask'
    }
  },
  {
    label: 'Script Task',
    actionName: 'replace-with-script-task',
    className: 'icon-script',
    target: {
      type: 'bpmn:ScriptTask'
    }
  },
  {
    label: 'Call Activity',
    actionName: 'replace-with-call-activity',
    className: 'icon-call-activity',
    target: {
      type: 'bpmn:CallActivity'
    }
  },
  {
    label: 'Sub Process (collapsed)',
    actionName: 'replace-with-collapsed-subprocess',
    className: 'icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false
    }
  }
];

module.exports.BOUNDARY_EVENT = [
  {
    label: 'Message Boundary Event',
    actionName: 'replace-with-message-boundary',
    className: 'icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Boundary Event',
    actionName: 'replace-with-timer-boundary',
    className: 'icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Escalation Boundary Event',
    actionName: 'replace-with-escalation-boundary',
    className: 'icon-intermediate-event-catch-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Conditional Boundary Event',
    actionName: 'replace-with-conditional-boundary',
    className: 'icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Error Boundary Event',
    actionName: 'replace-with-error-boundary',
    className: 'icon-intermediate-event-catch-error',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Signal Boundary Event',
    actionName: 'replace-with-signal-boundary',
    className: 'icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Message Boundary Event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-message-boundary',
    className: 'icon-intermediate-event-catch-non-interrupting-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:MessageEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Timer Boundary Event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-timer-boundary',
    className: 'icon-intermediate-event-catch-non-interrupting-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:TimerEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Escalation Boundary Event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-escalation-boundary',
    className: 'icon-intermediate-event-catch-non-interrupting-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:EscalationEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Conditional Boundary Event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-conditional-boundary',
    className: 'icon-intermediate-event-catch-non-interrupting-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:ConditionalEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Signal Boundary Event (non-interrupting)',
    actionName: 'replace-with-non-interrupting-signal-boundary',
    className: 'icon-intermediate-event-catch-non-interrupting-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinition: 'bpmn:SignalEventDefinition',
      cancelActivity: false
    }
  },
];
