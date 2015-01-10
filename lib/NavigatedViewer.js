var Viewer = require('./Viewer');

/**
 * A viewer that includes mouse navigation facilities
 *
 * @param {Object} options
 */
function NavigatedViewer(options) {
  Viewer.call(this, options);
}

NavigatedViewer.prototype = Object.create(Viewer.prototype);

module.exports = NavigatedViewer;

NavigatedViewer.prototype._navigationModules = [
  require('diagram-js/lib/navigation/zoomscroll'),
  require('diagram-js/lib/navigation/movecanvas')
];

NavigatedViewer.prototype._modules = [].concat(
  NavigatedViewer.prototype._modules,
  NavigatedViewer.prototype._navigationModules);