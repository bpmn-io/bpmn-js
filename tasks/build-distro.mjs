import path from 'node:path';
import fs from 'node:fs';

import { copySync as cp } from 'cpx';
import { sync as del } from 'del';
import { execaSync as exec } from 'execa';

import { createRequire } from 'node:module';

var dest = process.env.DISTRO_DIST || 'dist';

function resolve(module, sub) {
  var require = createRequire(import.meta.url);
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

console.log('clean ' + dest);
del(dest);

console.log('mkdir -p ' + dest);
fs.mkdirSync(dest, { recursive: true });

console.log('copy bpmn-font to ' + dest + '/bpmn-font');
cp(resolve('bpmn-font', '/dist/{font,css}/**'), dest + '/assets/bpmn-font');

console.log('copy diagram-js.css to ' + dest);
cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

console.log('copy bpmn-js.css to ' + dest);
cp('./assets/bpmn-js.css', dest + '/assets');

console.log('building pre-packaged distributions');

try {
  exec('rollup', [ '-c', '--bundleConfigAsCjs' ], {
    stdio: 'inherit'
  });
} catch (e) {
  console.error('failed to build pre-package distributions', e);

  process.exit(1);
}

console.log('done.');