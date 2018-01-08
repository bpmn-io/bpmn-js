'use strict';

var bundle = require('./bundle');

var path = require('path');

var mkdirp = require('mkdirp').sync,
    cp = require('cpx').copySync,
    del = require('del').sync;

var dest = 'dist';


function resolve(module, sub) {
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

console.log('clean ' + dest);
del(dest);

console.log('mkdir -p ' + dest);
mkdirp(dest);

console.log(`copy bpmn-font to ${dest}/bpmn-font`);
cp('assets/bpmn-font/*', dest + '/assets/bpmn-font');

console.log(`copy diagram-js.css to ${dest}`);
cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

bundle(dest, {
  'bpmn-viewer': 'lib/Viewer.js',
  'bpmn-navigated-viewer': 'lib/NavigatedViewer.js',
  'bpmn-modeler': 'lib/Modeler.js'
}, function(err) {

  if (err) {
    console.error('bundling failed', err);
  }
});