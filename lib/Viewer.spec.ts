import Viewer from './Viewer';

import { testViewer } from './BaseViewer.spec';

const viewer = new Viewer({
  container: 'container'
});

testViewer(viewer);

const extendedViewer = new Viewer({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});