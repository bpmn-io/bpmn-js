import NavigatedViewer from './NavigatedViewer';

import { testViewer } from './BaseViewer.spec';

const viewer = new NavigatedViewer({
  container: 'container'
});

testViewer(viewer);

const extendedViewer = new NavigatedViewer({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});