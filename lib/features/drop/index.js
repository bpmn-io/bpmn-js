'use strict';

module.exports = {
  __init__:  [ 'bpmnDrop', 'openSequenceflowHandler', 'updateSequenceFlowParentHandler' ],
  __depends__: [
    require('diagram-js/lib/features/drop')
  ],
  bpmnDrop: [ 'type', require('./BpmnDrop') ],
  openSequenceflowHandler: [ 'type', require('./OpenSequenceflowHandler') ],
  updateSequenceFlowParentHandler: [ 'type', require('./UpdateSequenceFlowParentHandler') ]
};
