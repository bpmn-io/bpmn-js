/* global diagramXML */

import BpmnModeler from './HeadlessModeler';

async function run() {
  try {
    const modeler = new BpmnModeler();

    console.log('importing...');

    const { warnings } = await modeler.importXML(diagramXML);

    console.log('imported with warnings', { warnings });

    const result = await modeler.saveXML({ format: true });

    console.log(result);
  } catch (err) {
    console.error('import failed', err);
  }
}

run().catch(err => {
  console.error(err);
});