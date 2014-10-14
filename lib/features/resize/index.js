module.exports = {
  __depends__: [
    require('diagram-js/lib/features/resize')
  ],
  __init__: [ 'bpmnResizeHandler' ],
  bpmnResizeHandler: [ 'type', require('./BpmnResizeHandler') ]
};
