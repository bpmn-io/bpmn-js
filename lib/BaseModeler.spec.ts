import BaseModeler from './BaseModeler';

import { testViewer } from './BaseViewer.spec';

const modeler = new BaseModeler({
  container: 'container'
});

testViewer(modeler);