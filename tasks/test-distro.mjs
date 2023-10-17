import { execaSync as exec } from 'execa';

import assert from 'node:assert';
import fs from 'node:fs';

var failures = 0;

function runTest(variant, env) {

  var NODE_ENV = process.env.NODE_ENV;

  process.env.VARIANT = variant;
  process.env.NODE_ENV = env;

  console.log('[TEST] ' + variant + '@' + env);
  console.log(`[EXEC] VARIANT=${variant} NODE_ENV=${env} karma start test/config/karma.distro.js`);

  try {
    exec('karma', [ 'start', 'test/config/karma.distro.js' ], {
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('[TEST] FAILURE ' + variant + '@' + env);
    console.error(e);

    failures++;
  } finally {
    process.env.NODE_ENV = NODE_ENV;
  }
}

function verifyAssets() {

  const assets = [
    'bpmn-font/css/bpmn-embedded.css',
    'bpmn-font/font/bpmn.woff',
    'bpmn-js.css',
    'diagram-js.css'
  ];

  for (const asset of assets) {
    try {
      assert.ok(fs.existsSync('dist/assets/' + asset), `${asset} missing`);
    } catch (e) {
      console.error('[TEST] ASSET ' + asset);
      console.error(e);

      failures++;
    }
  }
}

function test() {

  runTest('bpmn-modeler', 'development');
  runTest('bpmn-modeler', 'production');

  runTest('bpmn-navigated-viewer', 'development');
  runTest('bpmn-navigated-viewer', 'production');

  runTest('bpmn-viewer', 'development');
  runTest('bpmn-viewer', 'production');

  verifyAssets();

  if (failures) {
    process.exit(1);
  }
}


test();