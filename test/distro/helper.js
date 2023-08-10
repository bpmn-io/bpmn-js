
async function testImport(BpmnJS, done) {

  var container = document.createElement('div');
  container.style.height = '500px';
  container.style.border = 'solid 1px #666';

  document.body.appendChild(container);

  const response = await fetch('/base/resources/initial.bpmn');

  if (!response.ok) {
    throw new Error('failed to fetch diagram');
  }

  const diagramXML = await response.text();

  var modeler = new BpmnJS({ container: container });

  const { warnings } = await modeler.importXML(diagramXML);

  if (warnings.length) {
    throw new Error('imported with warnings');
  }

  return modeler;
}

window.testImport = testImport;