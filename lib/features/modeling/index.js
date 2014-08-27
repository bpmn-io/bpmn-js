module.exports = {
  __init__: [ 'modeling', 'bpmnUpdater', 'labelSupport' ],
  __depends__: [
    require('../../core'),
    require('../label-editing'),
    require('diagram-js/lib/command'),
    require('diagram-js/lib/features/change-support')
  ],
  bpmnFactory: [ 'type', require('./BpmnFactory') ],
  bpmnUpdater: [ 'type', require('./BpmnUpdater') ],
  elementFactory: [ 'type', require('./ElementFactory') ],
  modeling: [ 'type', require('./Modeling') ],
  labelSupport: [ 'type', require('./LabelSupport') ],
  layouter: [ 'type', require('./Layouter') ],
  connectionDocking: [ 'type', require('diagram-js/lib/layout/CroppingConnectionDocking') ]
};