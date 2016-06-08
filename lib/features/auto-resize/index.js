module.exports = {
  __init__: [ 'bpmnAutoResize', 'bpmnAutoResizeProvider' ],
  bpmnAutoResize: [ 'type', require('./BpmnAutoResize') ],
  bpmnAutoResizeProvider: [ 'type', require('./BpmnAutoResizeProvider') ]
};
