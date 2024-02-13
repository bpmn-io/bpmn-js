import path from 'node:path';
import fs from 'node:fs';

import cp from 'cpy';
import del from 'del';

import { execa as exec } from 'execa';

import { createRequire } from 'node:module';

var dest = process.env.DISTRO_DIST || 'dist';

function resolve(module, sub) {
  var require = createRequire(import.meta.url);
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

async function run() {

  console.log('clean ' + dest);
  await del(dest);

  console.log('mkdir -p ' + dest);
  fs.mkdirSync(dest, { recursive: true });

  console.log('copy bpmn-font to ' + dest + '/bpmn-font');
  await cp(resolve('bpmn-font', '/dist/css/**'), dest + '/assets/bpmn-font/css');
  await cp(resolve('bpmn-font', '/dist/font/**'), dest + '/assets/bpmn-font/font');

  console.log('copy diagram-js.css to ' + dest);
  await cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

  console.log('copy bpmn-js.css to ' + dest);
  await cp('./assets/*.css', dest + '/assets');

  console.log('building pre-packaged distributions');

  await exec('rollup', [ '-c', '--bundleConfigAsCjs' ], {
    stdio: 'inherit'
  });

  console.log('done.');
}

run().catch(e => {
  console.error('failed to build distribution', e);

  process.exit(1);
});