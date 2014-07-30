module.exports = {
  __init__: [ 'modeling', 'bpmnUpdater', 'labelSupport' ],
  __depends__: [
    require('../../core'),
    require('diagram-js/lib/cmd'),
    require('diagram-js/lib/features/change-support')
  ],
  bpmnFactory: [ 'type', require('./BpmnFactory') ],
  bpmnUpdater: [ 'type', require('./BpmnUpdater') ],
  elementFactory: [ 'type', require('./ElementFactory') ],
  modeling: [ 'type', require('./Modeling') ],
  labelSupport: [ 'type', require('./LabelSupport') ],
  layouter: [ 'type', require('diagram-js/lib/features/modeling/Layouter') ],
  connectionLayouter: [ 'type', require('diagram-js/lib/layout/CroppingConnectionLayouter') ]
};