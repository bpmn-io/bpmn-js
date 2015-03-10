'use strict';

var startEventReplace = [
  {
    options: {
      eventDefinition: ''
    },
    label: 'Start Event',
    actionName: 'replace-with-none-start',
    className: 'icon-start-event-none',
    targetType: 'bpmn:StartEvent'
  },
  {
    options: {
      eventDefinition: ''
    },
    label: 'Intermediate Throw Event',
    actionName: 'replace-with-intermediate-throwing',
    className: 'icon-intermediate-event-none',
    targetType: 'bpmn:IntermediateThrowEvent'
  },
  {
    options: {
      eventDefinition: ''
    },
    label: 'End Event',
    actionName: 'replace-with-message-end',
    className: 'icon-end-event-none',
    targetType: 'bpmn:EndEvent'
  },
  {
    label: 'Message Start Event',
    actionName: 'replace-with-message-start',
    className: 'icon-start-event-message',
    targetType: 'bpmn:StartEvent',
    options: {
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Timer Start Event',
    actionName: 'replace-with-timer-start',
    className: 'icon-start-event-timer',
    targetType: 'bpmn:StartEvent',
    options: {
      eventDefinition: 'bpmn:TimerEventDefinition'
    }
  },
  {
    label: 'Conditional Start Event',
    actionName: 'replace-with-conditional-start',
    className: 'icon-start-event-condition',
    targetType: 'bpmn:StartEvent',
    options:{
      eventDefinition: 'bpmn:ConditionalEventDefinition'
    }
  },
  {
    label: 'Signal Start Event',
    actionName: 'replace-with-signal-start',
    className: 'icon-start-event-signal',
    targetType: 'bpmn:StartEvent',
    options: {
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  }
];

 var intermediateEventReplace = [
   {
     label: 'Start Event',
     actionName: 'replace-with-none-start',
     className: 'icon-start-event-none',
     targetType: 'bpmn:StartEvent',
     options: {
       eventDefinition: ''
     },
   },
   {
     label: 'Intermediate Throw Event',
     actionName: 'replace-with-message-intermediate-throw',
     className: 'icon-intermediate-event-none',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: ''
     }
   },
   {
     label: 'End Event',
     actionName: 'replace-with-message-end',
     className: 'icon-end-event-none',
     targetType: 'bpmn:EndEvent',
     options: {
       eventDefinition: ''
     }
   },
   {
     label: 'Message Intermediate Catch Event',
     actionName: 'replace-with-intermediate-catch',
     className: 'icon-intermediate-event-catch-message',
     targetType: 'bpmn:IntermediateCatchEvent',
     options: {
       eventDefinition: 'bpmn:MessageEventDefinition'
     }
   },
   {
     label: 'Message Intermediate Throw Event',
     actionName: 'replace-with-intermediate-throw',
     className: 'icon-intermediate-event-throw-message',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: 'bpmn:MessageEventDefinition'
     }
   },
   {
     label: 'Timer Intermediate Catch Event',
     actionName: 'replace-with-timer-intermediate-catch',
     className: 'icon-intermediate-event-catch-timer',
     targetType: 'bpmn:IntermediateCatchEvent',
     options: {
       eventDefinition: 'bpmn:TimerEventDefinition'
     }
   },
   {
     label: 'Escalation Intermediate Catch Event',
     actionName: 'replace-with-escalation-catch',
     className: 'icon-intermediate-event-catch-escalation',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: 'bpmn:EscalationEventDefinition'
     }
   },
   {
     label: 'Conditional Intermediate Catch Event',
     actionName: 'replace-with-conditional-intermediate-catch',
     className: 'icon-intermediate-event-catch-condition',
     targetType: 'bpmn:IntermediateCatchEvent',
     options: {
       eventDefinition: 'bpmn:ConditionalEventDefinition'
     }
   },
   {
     label: 'Link Intermediate Catch Event',
     actionName: 'replace-with-link-intermediate-catch',
     className: 'icon-intermediate-event-catch-link',
     targetType: 'bpmn:IntermediateCatchEvent',
     options: {
       eventDefinition: 'bpmn:LinkEventDefinition'
     }
   },
   {
     label: 'Link Intermediate Throw Event',
     actionName: 'replace-with-link-intermediate-throw',
     className: 'icon-intermediate-event-throw-link',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: 'bpmn:LinkEventDefinition'
     }
   },
   {
     label: 'Compensation Intermediate Throw Event',
     actionName: 'replace-with-compensation-intermediate-throw',
     className: 'icon-intermediate-event-throw-compensation',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: 'bpmn:CompensateEventDefinition'
     }
   },
   {
     label: 'Signal Throw Catch Event',
     actionName: 'replace-with-throw-intermediate-catch',
     className: 'icon-intermediate-event-catch-signal',
     targetType: 'bpmn:IntermediateCatchEvent',
     options: {
       eventDefinition: 'bpmn:SignalEventDefinition'
     }
   },
   {
     label: 'Signal Intermediate Throw Event',
     actionName: 'replace-with-signal-intermediate-throw',
     className: 'icon-intermediate-event-throw-signal',
     targetType: 'bpmn:IntermediateThrowEvent',
     options: {
       eventDefinition: 'bpmn:SignalEventDefinition'
     }
   }
 ];



var endEventReplace = [
  {
    label: 'Start Event',
    actionName: 'replace-with-none-start',
    className: 'icon-start-event-none',
    targetType: 'bpmn:StartEvent',
    options: {
      eventDefinition: ''
    }
  },
  {
    label: 'Intermediate Throw Event',
    actionName: 'replace-with-message-intermediate-throw',
    className: 'icon-intermediate-event-none',
    targetType: 'bpmn:IntermediateThrowEvent',
    options: {
      eventDefinition: ''
    },
  },
  {
    label: 'End Event',
    actionName: 'replace-with-none-end',
    className: 'icon-end-event-none',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: ''
    },
  },
  {
    label: 'Message End Event',
    actionName: 'replace-with-message-end',
    className: 'icon-end-event-message',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:MessageEventDefinition'
    }
  },
  {
    label: 'Escalation End Event',
    actionName: 'replace-with-escalation-end',
    className: 'icon-end-event-escalation',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:EscalationEventDefinition'
    }
  },
  {
    label: 'Error End Event',
    actionName: 'replace-with-error-end',
    className: 'icon-end-event-error',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:ErrorEventDefinition'
    }
  },
  {
    label: 'Cancel End Event',
    actionName: 'replace-with-cancel-end',
    className: 'icon-end-event-cancel',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:CancelEventDefinition'
    }
  },
  {
    label: 'Compensation End Event',
    actionName: 'replace-with-compensation-end',
    className: 'icon-end-event-compensation',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:CompensateEventDefinition'
    }
  },
  {
    label: 'Signal End Event',
    actionName: 'replace-with-signal-end',
    className: 'icon-end-event-signal',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:SignalEventDefinition'
    }
  },
  {
    label: 'Terminate End Event',
    actionName: 'replace-with-terminate-end',
    className: 'icon-end-event-terminate',
    targetType: 'bpmn:EndEvent',
    options: {
      eventDefinition: 'bpmn:TerminateEventDefinition'
    }
  }
];

var gatewayReplace = [
  {
    label: 'Exclusive Gateway',
    actionName: 'replace-with-exclusive-gateway',
    className: 'icon-gateway-xor',
    targetType: 'bpmn:ExclusiveGateway'
  },
  {
    label: 'Parallel Gateway',
    actionName: 'replace-with-parallel-gateway',
    className: 'icon-gateway-parallel',
    targetType: 'bpmn:ParallelGateway'
  },
  {
    label: 'Inclusive Gateway',
    actionName: 'replace-with-inclusive-gateway',
    className: 'icon-gateway-or',
    targetType: 'bpmn:InclusiveGateway'
  },
  {
    label: 'Complex Gateway',
    actionName: 'replace-with-complex-gateway',
    className: 'icon-gateway-complex',
    targetType: 'bpmn:ComplexGateway'
  },
  {
    label: 'Event based Gateway',
    actionName: 'replace-with-event-based-gateway',
    className: 'icon-gateway-eventbased',
    targetType: 'bpmn:EventBasedGateway',
    options: {
      newBusinessAtt: { instantiate: false, eventGatewayType: 'Exclusive' }
    }
  }
  // Gateways deactivated until https://github.com/bpmn-io/bpmn-js/issues/194
  // {
  //   label: 'Event based instantiating Gateway',
  //   actionName: 'replace-with-exclusive-event-based-gateway',
  //   className: 'icon-exclusive-event-based',
  //   targetType: 'bpmn:EventBasedGateway',
  //   options: {
  //     newBusinessAtt: { instantiate: true, eventGatewayType: 'Exclusive' }
  //   }
  // },
  // {
  //   label: 'Parallel Event based instantiating Gateway',
  //   actionName: 'replace-with-parallel-event-based-instantiate-gateway',
  //   className: 'icon-parallel-event-based-instantiate-gateway',
  //   targetType: 'bpmn:EventBasedGateway',
  //   options: {
  //     newBusinessAtt: { instantiate: true, eventGatewayType: 'Parallel' }
  //   }
  // }
];

var taskReplace = [
  {
    label: 'Task',
    actionName: 'replace-with-task',
    className: 'icon-task',
    targetType: 'bpmn:Task'
  },
  {
    label: 'Send Task',
    actionName: 'replace-with-send-task',
    className: 'icon-send',
    targetType: 'bpmn:SendTask'
  },
  {
    label: 'Receive Task',
    actionName: 'replace-with-receive-task',
    className: 'icon-receive',
    targetType: 'bpmn:ReceiveTask'
  },
  {
    label: 'User Task',
    actionName: 'replace-with-user-task',
    className: 'icon-user',
    targetType: 'bpmn:UserTask'
  },
  {
    label: 'Manual Task',
    actionName: 'replace-with-manual-task',
    className: 'icon-manual',
    targetType: 'bpmn:ManualTask'
  },
  {
    label: 'Business Rule Task',
    actionName: 'replace-with-rule-task',
    className: 'icon-business-rule',
    targetType: 'bpmn:BusinessRuleTask'
  },
  {
    label: 'Service Task',
    actionName: 'replace-with-service-task',
    className: 'icon-service',
    targetType: 'bpmn:ServiceTask'
  },
  {
    label: 'Script Task',
    actionName: 'replace-with-script-task',
    className: 'icon-script',
    targetType: 'bpmn:ScriptTask'
  }
];


module.exports.startEventReplace = startEventReplace;
module.exports.intermediateEventReplace = intermediateEventReplace;
module.exports.endEventReplace = endEventReplace;
module.exports.gatewayReplace = gatewayReplace;
module.exports.taskReplace = taskReplace;
