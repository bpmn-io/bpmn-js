'use strict';

var bundle = require('./bundle');

bundle({
  'bpmn-viewer': 'lib/Viewer.js',
  'bpmn-navigated-viewer': 'lib/NavigatedViewer.js',
  'bpmn-modeler': 'lib/Modeler.js'
}, function(err) {

  if (err) {
    console.error('bundling failed', err);
  }
});