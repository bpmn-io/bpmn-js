import Modeler from './Modeler';

import { testViewer } from './BaseViewer.spec';

const modeler = new Modeler({
  container: 'container'
});

testViewer(modeler);

modeler.createDiagram();


const otherModeler = new Modeler({
  container: 'container'
});

const extendedModeler = new Modeler({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});