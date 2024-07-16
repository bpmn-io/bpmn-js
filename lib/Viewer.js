import inherits from 'inherits-browser';

import CoreModule from './core';
import DrilldownModdule from './features/drilldown';
import OutlineModule from './features/outline';
import OverlaysModule from 'diagram-js/lib/features/overlays';
import SelectionModule from 'diagram-js/lib/features/selection';
import TranslateModule from 'diagram-js/lib/i18n/translate';

import BaseViewer from './BaseViewer';


/**
 * @typedef { import('./BaseViewer').BaseViewerOptions } BaseViewerOptions
 */

/**
 * A viewer for BPMN 2.0 diagrams.
 *
 * Have a look at {@link bpmn-js/lib/NavigatedViewer} or {@link bpmn-js/lib/Modeler} for bundles that include
 * additional features.
 *
 *
 * ## Extending the Viewer
 *
 * In order to extend the viewer pass extension modules to bootstrap via the
 * `additionalModules` option. An extension module is an object that exposes
 * named services.
 *
 * The following example depicts the integration of a simple
 * logging component that integrates with interaction events:
 *
 *
 * ```javascript
 *
 * // logging component
 * function InteractionLogger(eventBus) {
 *   eventBus.on('element.hover', function(event) {
 *     console.log()
 *   })
 * }
 *
 * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
 *
 * // extension module
 * var extensionModule = {
 *   __init__: [ 'interactionLogger' ],
 *   interactionLogger: [ 'type', InteractionLogger ]
 * };
 *
 * // extend the viewer
 * var bpmnViewer = new Viewer({ additionalModules: [ extensionModule ] });
 * bpmnViewer.importXML(...);
 * ```
 *
 * @template [ServiceMap=null]
 *
 * @extends BaseViewer<ServiceMap>
 *
 * @param {BaseViewerOptions} [options] The options to configure the viewer.
 */
export default function Viewer(options) {
  BaseViewer.call(this, options);
}

inherits(Viewer, BaseViewer);

// modules the viewer is composed of
Viewer.prototype._modules = [
  CoreModule,
  DrilldownModdule,
  OutlineModule,
  OverlaysModule,
  SelectionModule,
  TranslateModule
];

// default moddle extensions the viewer is composed of
Viewer.prototype._moddleExtensions = {};