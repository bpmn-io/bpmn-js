module.exports = {
  __depends__: [
    require('diagram-js/lib/features/popup-menu'),
    require('diagram-js/lib/features/replace'),
    require('../modeling')
  ],
  bpmnReplace: [ 'type', require('./BpmnReplace') ]
};