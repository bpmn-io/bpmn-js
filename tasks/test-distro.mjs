import { execaSync as exec } from 'execa';

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

function test() {

  runTest('bpmn-modeler', 'development');
  runTest('bpmn-modeler', 'production');

  runTest('bpmn-navigated-viewer', 'development');
  runTest('bpmn-navigated-viewer', 'production');

  runTest('bpmn-viewer', 'development');
  runTest('bpmn-viewer', 'production');

  if (failures) {
    process.exit(1);
  }
}


test();