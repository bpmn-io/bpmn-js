export var EVENT_GROUP = {
  id: 'events',
  name: 'Events'
};

export var TASK_GROUP = {
  id: 'tasks',
  name: 'Tasks'
};

export var DATA_GROUP = {
  id: 'data',
  name: 'Data'
};

export var PARTICIPANT_GROUP = {
  id: 'participants',
  name: 'Participants'
};

export var SUBPROCESS_GROUP = {
  id: 'subprocess',
  name: 'Sub Processes'
};

export var GATEWAY_GROUP = {
  id: 'gateways',
  name: 'Gateways'
};

export var NONE_EVENTS = [
  {
    label: 'Start Event',
    actionName: 'none-start-event',
    className: 'bpmn-icon-start-event-none',
    target: {
      type: 'bpmn:StartEvent'
    }
  },
  {
    label: 'Intermediate Throw Event',
    actionName: 'none-intermediate-throwing',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:IntermediateThrowEvent'
    }
  },
  {
    label: 'Boundary Event',
    actionName: 'none-boundary-event',
    className: 'bpmn-icon-intermediate-event-none',
    target: {
      type: 'bpmn:BoundaryEvent'
    }
  },
  {
    label: 'End Event',
    actionName: 'none-end-event',
    className: 'bpmn-icon-end-event-none',
    target: {
      type: 'bpmn:EndEvent'
    }
  }
].map(option => ({ ...option, group: EVENT_GROUP }));

export var TYPED_START_EVENTS = [
  {
    label: 'Message Start Event',
    actionName: 'message-start',
    className: 'bpmn-icon-start-event-message',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Start Event',
    actionName: 'timer-start',
    className: 'bpmn-icon-start-event-timer',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Conditional Start Event',
    actionName: 'conditional-start',
    className: 'bpmn-icon-start-event-condition',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Signal Start Event',
    actionName: 'signal-start',
    className: 'bpmn-icon-start-event-signal',
    target: {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  }
].map(option => ({ ...option, group: EVENT_GROUP }));

export var TYPED_INTERMEDIATE_EVENT = [
  {
    label: 'Message Intermediate Catch Event',
    actionName: 'message-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Message Intermediate Throw Event',
    actionName: 'message-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-message',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Intermediate Catch Event',
    actionName: 'timer-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Escalation Intermediate Throw Event',
    actionName: 'escalation-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-escalation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Conditional Intermediate Catch Event',
    actionName: 'conditional-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Link Intermediate Catch Event',
    actionName: 'link-intermediate-catch',
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
    label: 'Link Intermediate Throw Event',
    actionName: 'link-intermediate-throw',
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
    label: 'Compensation Intermediate Throw Event',
    actionName: 'compensation-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-compensation',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal Intermediate Catch Event',
    actionName: 'signal-intermediate-catch',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:IntermediateCatchEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Signal Intermediate Throw Event',
    actionName: 'signal-intermediate-throw',
    className: 'bpmn-icon-intermediate-event-throw-signal',
    target: {
      type: 'bpmn:IntermediateThrowEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  }
].map(option => ({ ...option, group: EVENT_GROUP }));

export var TYPED_BOUNDARY_EVENT = [
  {
    label: 'Message Boundary Event',
    actionName: 'message-boundary',
    className: 'bpmn-icon-intermediate-event-catch-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Boundary Event',
    actionName: 'timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Escalation Boundary Event',
    actionName: 'escalation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Conditional Boundary Event',
    actionName: 'conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Error Boundary Event',
    actionName: 'error-boundary',
    className: 'bpmn-icon-intermediate-event-catch-error',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Cancel Boundary Event',
    actionName: 'cancel-boundary',
    className: 'bpmn-icon-intermediate-event-catch-cancel',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition'
    }
  },
  {
    label: 'Signal Boundary Event',
    actionName: 'signal-boundary',
    className: 'bpmn-icon-intermediate-event-catch-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Compensation Boundary Event',
    actionName: 'compensation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-compensation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Message Boundary Event (non-interrupting)',
    actionName: 'non-interrupting-message-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-message',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Timer Boundary Event (non-interrupting)',
    actionName: 'non-interrupting-timer-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-timer',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Escalation Boundary Event (non-interrupting)',
    actionName: 'non-interrupting-escalation-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-escalation',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Conditional Boundary Event (non-interrupting)',
    actionName: 'non-interrupting-conditional-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-condition',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:ConditionalEventDefinition',
      cancelActivity: false
    }
  },
  {
    label: 'Signal Boundary Event (non-interrupting)',
    actionName: 'non-interrupting-signal-boundary',
    className: 'bpmn-icon-intermediate-event-catch-non-interrupting-signal',
    target: {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition',
      cancelActivity: false
    }
  }
].map(option => ({ ...option, group: EVENT_GROUP }));

export var TYPED_END_EVENT = [
  {
    label: 'Message End Event',
    actionName: 'message-end',
    className: 'bpmn-icon-end-event-message',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Escalation End Event',
    actionName: 'escalation-end',
    className: 'bpmn-icon-end-event-escalation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Error End Event',
    actionName: 'error-end',
    className: 'bpmn-icon-end-event-error',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Cancel End Event',
    actionName: 'cancel-end',
    className: 'bpmn-icon-end-event-cancel',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CancelEventDefinition'
    }
  },
  {
    label: 'Compensation End Event',
    actionName: 'compensation-end',
    className: 'bpmn-icon-end-event-compensation',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal End Event',
    actionName: 'signal-end',
    className: 'bpmn-icon-end-event-signal',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Terminate End Event',
    actionName: 'terminate-end',
    className: 'bpmn-icon-end-event-terminate',
    target: {
      type: 'bpmn:EndEvent',
      eventDefinitionType: 'bpmn:TerminateEventDefinition'
    }
  }
].map(option => ({ ...option, group: EVENT_GROUP }));

export var GATEWAY = [
  {
    label: 'Exclusive Gateway',
    actionName: 'exclusive-gateway',
    className: 'bpmn-icon-gateway-xor',
    target: {
      type: 'bpmn:ExclusiveGateway'
    }
  },
  {
    label: 'Parallel Gateway',
    actionName: 'parallel-gateway',
    className: 'bpmn-icon-gateway-parallel',
    target: {
      type: 'bpmn:ParallelGateway'
    }
  },
  {
    label: 'Inclusive Gateway',
    search: 'or',
    actionName: 'inclusive-gateway',
    className: 'bpmn-icon-gateway-or',
    target: {
      type: 'bpmn:InclusiveGateway'
    },
    rank: -1
  },
  {
    label: 'Complex Gateway',
    actionName: 'complex-gateway',
    className: 'bpmn-icon-gateway-complex',
    target: {
      type: 'bpmn:ComplexGateway'
    },
    rank: -1
  },
  {
    label: 'Event based Gateway',
    actionName: 'event-based-gateway',
    className: 'bpmn-icon-gateway-eventbased',
    target: {
      type: 'bpmn:EventBasedGateway',
      instantiate: false,
      eventGatewayType: 'Exclusive'
    }
  }
].map(option => ({ ...option, group: GATEWAY_GROUP }));

export var SUBPROCESS = [
  {
    label: 'Transaction',
    actionName: 'transaction',
    className: 'bpmn-icon-transaction',
    target: {
      type: 'bpmn:Transaction',
      isExpanded: true
    }
  },
  {
    label: 'Event Sub Process',
    search: 'subprocess',
    actionName: 'event-subprocess',
    className: 'bpmn-icon-event-subprocess-expanded',
    target: {
      type: 'bpmn:SubProcess',
      triggeredByEvent: true,
      isExpanded: true
    }
  },
  {
    label: 'Sub Process (collapsed)',
    search: 'subprocess',
    actionName: 'collapsed-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: false
    }
  },
  {
    label: 'Sub Process (expanded)',
    search: 'subprocess',
    actionName: 'expanded-subprocess',
    className: 'bpmn-icon-subprocess-collapsed',
    target: {
      type: 'bpmn:SubProcess',
      isExpanded: true
    }
  }
].map(option => ({ ...option, group: SUBPROCESS_GROUP }));

export var TASK = [
  {
    label: 'Task',
    actionName: 'task',
    className: 'bpmn-icon-task',
    target: {
      type: 'bpmn:Task'
    }
  },
  {
    label: 'User Task',
    actionName: 'user-task',
    className: 'bpmn-icon-user',
    target: {
      type: 'bpmn:UserTask'
    }
  },
  {
    label: 'Service Task',
    actionName: 'service-task',
    className: 'bpmn-icon-service',
    target: {
      type: 'bpmn:ServiceTask'
    }
  },
  {
    label: 'Send Task',
    actionName: 'send-task',
    className: 'bpmn-icon-send',
    target: {
      type: 'bpmn:SendTask'
    },
    rank: -1
  },
  {
    label: 'Receive Task',
    actionName: 'receive-task',
    className: 'bpmn-icon-receive',
    target: {
      type: 'bpmn:ReceiveTask'
    },
    rank: -1
  },
  {
    label: 'Manual Task',
    actionName: 'manual-task',
    className: 'bpmn-icon-manual',
    target: {
      type: 'bpmn:ManualTask'
    },
    rank: -1
  },
  {
    label: 'Business Rule Task',
    actionName: 'rule-task',
    className: 'bpmn-icon-business-rule',
    target: {
      type: 'bpmn:BusinessRuleTask'
    }
  },
  {
    label: 'Script Task',
    actionName: 'script-task',
    className: 'bpmn-icon-script',
    target: {
      type: 'bpmn:ScriptTask'
    }
  },
  {
    label: 'Call Activity',
    actionName: 'call-activity',
    className: 'bpmn-icon-call-activity',
    target: {
      type: 'bpmn:CallActivity'
    }
  }
].map(option => ({ ...option, group: TASK_GROUP }));

export var DATA_OBJECTS = [
  {
    label: 'Data Store Reference',
    actionName: 'data-store-reference',
    className: 'bpmn-icon-data-store',
    target: {
      type: 'bpmn:DataStoreReference'
    }
  },
  {
    label: 'Data Object Reference',
    actionName: 'data-object-reference',
    className: 'bpmn-icon-data-object',
    target: {
      type: 'bpmn:DataObjectReference'
    }
  }
].map(option => ({ ...option, group: DATA_GROUP }));

export var PARTICIPANT = [
  {
    label: 'Expanded Pool',
    search: 'Participant',
    actionName: 'expanded-pool',
    className: 'bpmn-icon-participant',
    target: {
      type: 'bpmn:Participant',
      isExpanded: true
    }
  },
  {
    label: 'Empty Pool',
    search: 'Collapsed Participant',
    actionName: 'collapsed-pool',
    className: 'bpmn-icon-lane',
    target: {
      type: 'bpmn:Participant',
      isExpanded: false
    }
  }
].map(option => ({ ...option, group: PARTICIPANT_GROUP }));

export var CREATE_OPTIONS = [
  ...GATEWAY,
  ...TASK,
  ...SUBPROCESS,
  ...NONE_EVENTS,
  ...TYPED_START_EVENTS,
  ...TYPED_INTERMEDIATE_EVENT,
  ...TYPED_END_EVENT,
  ...TYPED_BOUNDARY_EVENT,
  ...DATA_OBJECTS,
  ...PARTICIPANT
];