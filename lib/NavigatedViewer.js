import inherits from 'inherits';

import Viewer from './Viewer';

import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

/**
 * A viewer that includes mouse navigation facilities
 *
 * @param {Object} options
 */
export default function NavigatedViewer(options) {
  Viewer.call(this, options);
}

inherits(NavigatedViewer, Viewer);

NavigatedViewer.prototype._navigationModules = [
  MoveCanvasModule,
  ZoomScrollModule
];

NavigatedViewer.prototype._modules = [].concat(
  NavigatedViewer.prototype._modules,
  NavigatedViewer.prototype._navigationModules);