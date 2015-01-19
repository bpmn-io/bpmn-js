module.exports = {
  __depends__: [
    require('diagram-js/lib/features/rules')
  ],
  __init__: [ 'replace' ],
  replace: [ 'type', require('./BpmnReplace') ],
};
