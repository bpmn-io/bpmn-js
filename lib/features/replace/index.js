module.exports = {
  __depends__: [
    require('diagram-js/lib/features/popup-menu'),
    require('diagram-js/lib/features/replace'),
    require('diagram-js/lib/features/selection'),
    require('../modeling')
  ],
  bpmnReplace: [ 'type', require('./BpmnReplace') ]
};