module.exports = {
  __depends__: [
    require('diagram-js/lib/features/search-pad')
  ],
  __init__: [ 'bpmnSearch'],
  bpmnSearch: [ 'type', require('./BpmnSearchProvider') ]
};
