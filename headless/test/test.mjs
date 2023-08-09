/* eslint-env node */

import fs from 'fs/promises';

import vm from 'vm';

import { JSDOM } from 'jsdom';

async function run() {

  const diagramXML = await fs.readFile('./test/diagram.bpmn', 'utf8');

  const scriptSrc = await fs.readFile('./dist/headless-test.js', 'utf8');

  const dom = new JSDOM('<body></body>');

  const script = new vm.Script(scriptSrc);

  script.runInNewContext(Object.assign(dom.window, { console, diagramXML }));
}

run().catch(err => {
  console.error(err);

  process.exit(1);
});