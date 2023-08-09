/* eslint-env node */

import fs from 'fs/promises';

import BpmnModeler from '../dist/HeadlessModeler.mjs';

async function run() {

  const diagramXML = await fs.readFile('./test/diagram.bpmn', 'utf8');

  const modeler = new BpmnModeler();

  console.log('importing...');

  const { warnings } = await modeler.importXML(diagramXML);

  console.log('imported with warnings', { warnings });

  const result = await modeler.saveXML({ format: true });

  console.log(result);
}

run().catch(err => {
  console.error(err);

  process.exit(1);
});