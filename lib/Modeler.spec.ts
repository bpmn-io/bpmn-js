import Modeler from './Modeler';

import { testViewer } from './BaseViewer.spec';

const modeler = new Modeler({
  container: 'container'
});

testViewer(modeler);

modeler.createDiagram();