module.exports = {
  __init__: [ 'modeling', 'bpmnUpdater', 'bpmnLabelSupport' ],
  __depends__: [
    require('../translate'),
    require('./behavior'),
    require('../label-editing'),
    require('../rules'),
    require('../ordering'),
    require('../replace'),
    require('diagram-js/lib/command'),
    require('diagram-js/lib/features/tooltips'),
    require('diagram-js/lib/features/label-support'),
    require('diagram-js/lib/features/attach-support'),
    require('diagram-js/lib/features/selection'),
    require('diagram-js/lib/features/change-support'),
    require('diagram-js/lib/features/space-tool')
  ],
  bpmnFactory: [ 'type', require('./BpmnFactory') ],
  bpmnUpdater: [ 'type', require('./BpmnUpdater') ],
  elementFactory: [ 'type', require('./ElementFactory') ],
  modeling: [ 'type', require('./Modeling') ],
  bpmnLabelSupport: [ 'type', require('./BpmnLabelSupport') ],
  layouter: [ 'type', require('./BpmnLayouter') ],
  connectionDocking: [ 'type', require('diagram-js/lib/layout/CroppingConnectionDocking') ]
};
