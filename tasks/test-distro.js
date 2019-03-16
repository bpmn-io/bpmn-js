var execSync = require('execa').sync;

var failures = 0;

function runTest(variant, env, isModule = false) {

  var NODE_ENV = process.env.NODE_ENV;

  process.env.VARIANT = variant;
  process.env.NODE_ENV = env;
  process.env.IS_MODULE = isModule;

  console.log('[TEST] ' + variant + '@' + env);

  try {
    execSync('karma', [ 'start', 'test/config/karma.distro.js' ]);
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

  runTest('bpmn-modeler.esm', 'development', true);
  runTest('bpmn-modeler.esm', 'production', true);

  runTest('bpmn-navigated-viewer', 'development');
  runTest('bpmn-navigated-viewer', 'production');

  runTest('bpmn-navigated-viewer.esm', 'development', true);
  runTest('bpmn-navigated-viewer.esm', 'production', true);

  runTest('bpmn-viewer', 'development');
  runTest('bpmn-viewer', 'production');

  runTest('bpmn-viewer.esm', 'development', true);
  runTest('bpmn-viewer.esm', 'production', true);

  if (failures) {
    process.exit(1);
  }
}


test();