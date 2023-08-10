/* eslint-env node */

import fs from 'fs/promises';

import BpmnModeler from '../HeadlessModeler';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';
import ConditionElementTemplate from './condition-template.json';


import {
  CloudElementTemplatesModule
} from 'bpmn-js-element-templates/cloud-core';

async function run() {

  const diagramXML = await fs.readFile('./test/diagram.bpmn', 'utf8');

  const modeler = new BpmnModeler({
    additionalModules: [
      CloudElementTemplatesModule
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
    elementTemplates: [
      ConditionElementTemplate
    ]
  });

  console.log('importing...');

  const { warnings } = await modeler.importXML(diagramXML);

  console.log('imported with warnings', { warnings });

  modeler.invoke((elementRegistry, elementTemplates) => {

    const task = elementRegistry.get('Task_1');

    const conditionTemplate = elementTemplates.get('example.com.condition');

    return elementTemplates.applyTemplate(task, conditionTemplate);
  });

  const result = await modeler.saveXML({ format: true });

  console.log('saved diagram');

  console.log(result);
}

run().catch(err => {
  console.error(err);

  process.exit(1);
});