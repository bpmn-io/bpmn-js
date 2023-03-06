import Viewer from './Viewer';

import { testViewer } from './BaseViewer.spec';

const viewer = new Viewer({
  container: 'container'
});

testViewer(viewer);