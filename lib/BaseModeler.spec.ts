import BaseModeler from './BaseModeler';

import { testViewer } from './BaseViewer.spec';

const modeler = new BaseModeler({
  container: 'container'
});

testViewer(modeler);


const otherModeler = new BaseModeler({
  container: 'container'
});

const extendedModeler = new BaseModeler({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});