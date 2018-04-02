'use strict';

var path = require('path');

var exec = require('execa').sync,
    mkdirp = require('mkdirp').sync,
    cp = require('cpx').copySync,
    del = require('del').sync;

var dest = process.env.DISTRO_DIST || 'dist';


function resolve(module, sub) {
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

console.log('clean ' + dest);
del(dest);

console.log('mkdir -p ' + dest);
mkdirp(dest);

console.log('copy bpmn-font to ' + dest + '/bpmn-font');
cp(resolve('bpmn-font', '/dist/{font,css}/**'), dest + '/assets/bpmn-font');

console.log('copy diagram-js.css to ' + dest);
cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

console.log('building pre-packaged distributions');

var NODE_ENV = process.env.NODE_ENV;

[ 'production', 'development' ].forEach(function(env) {

  try {
    process.env.NODE_ENV = env;

    exec('rollup', [ '-c' ]);
  } catch (e) {
    console.error('failed to build pre-package distributions', e);

    process.exit(1);
  }

  process.env.NODE_ENV = NODE_ENV;
});

console.log('done.');