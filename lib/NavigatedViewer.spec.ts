import NavigatedViewer from './NavigatedViewer';

import { testViewer } from './BaseViewer.spec';

const viewer = new NavigatedViewer({
  container: 'container'
});

testViewer(viewer);