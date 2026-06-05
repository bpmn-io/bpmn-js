import inherits from 'inherits-browser';

import BaseModeler from './BaseModeler.js';

import Viewer from './Viewer.js';
import NavigatedViewer from './NavigatedViewer.js';

import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

import AlignElementsModule from './features/align-elements/index.js';
import AutoPlaceModule from './features/auto-place/index.js';
import AutoResizeModule from './features/auto-resize/index.js';
import AutoScrollModule from 'diagram-js/lib/features/auto-scroll';
import BendpointsModule from 'diagram-js/lib/features/bendpoints';
import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import ContextPadModule from './features/context-pad/index.js';
import CopyPasteModule from './features/copy-paste/index.js';
import CreateModule from 'diagram-js/lib/features/create';
import DistributeElementsModule from './features/distribute-elements/index.js';
import EditorActionsModule from './features/editor-actions/index.js';
import GridSnappingModule from './features/grid-snapping/index.js';
import InteractionEventsModule from './features/interaction-events/index.js';
import KeyboardModule from './features/keyboard/index.js';
import KeyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import LabelEditingModule from './features/label-editing/index.js';
import LabelLink from './features/label-link/index.js';
import ModelingModule from './features/modeling/index.js';
import ModelingFeedbackModule from './features/modeling-feedback/index.js';
import MoveModule from 'diagram-js/lib/features/move';
import PaletteModule from './features/palette/index.js';
import ReplacePreviewModule from './features/replace-preview/index.js';
import ResizeModule from 'diagram-js/lib/features/resize';
import SnappingModule from './features/snapping/index.js';
import SearchModule from './features/search/index.js';
import OutlineModule from './features/outline/index.js';

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
      '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
          '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        '</bpmndi:BPMNShape>' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';


/**
 * @typedef {import('./BaseViewer.js').BaseViewerOptions} BaseViewerOptions
 * @typedef {import('./BaseViewer.js').ImportXMLResult} ImportXMLResult
 */

/**
 * A modeler for BPMN 2.0 diagrams.
 *
 * ## Extending the Modeler
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
 * var bpmnModeler = new Modeler({ additionalModules: [ extensionModule ] });
 * bpmnModeler.importXML(...);
 * ```
 *
 *
 * ## Customizing / Replacing Components
 *
 * You can replace individual diagram components by redefining them in override modules.
 * This works for all components, including those defined in the core.
 *
 * Pass in override modules via the `options.additionalModules` flag like this:
 *
 * ```javascript
 * function CustomContextPadProvider(contextPad) {
 *
 *   contextPad.registerProvider(this);
 *
 *   this.getContextPadEntries = function(element) {
 *     // no entries, effectively disable the context pad
 *     return {};
 *   };
 * }
 *
 * CustomContextPadProvider.$inject = [ 'contextPad' ];
 *
 * var overrideModule = {
 *   contextPadProvider: [ 'type', CustomContextPadProvider ]
 * };
 *
 * var bpmnModeler = new Modeler({ additionalModules: [ overrideModule ]});
 * ```
 *
 * @template [ServiceMap=null]
 *
 * @extends BaseModeler<ServiceMap>
 *
 * @param {BaseViewerOptions} [options] The options to configure the modeler.
 */
export default function Modeler(options) {
  BaseModeler.call(this, options);
}

inherits(Modeler, BaseModeler);


Modeler.Viewer = Viewer;
Modeler.NavigatedViewer = NavigatedViewer;

/**
 * Create a new diagram to start modeling.
 *
 * @throws {ImportXMLError} An error thrown during the import of the XML.
 *
 * @return {Promise<ImportXMLResult>} A promise resolving with warnings that were produced during the import.
 */
Modeler.prototype.createDiagram = function createDiagram() {
  return this.importXML(initialDiagram);
};


Modeler.prototype._interactionModules = [

  // non-modeling components
  KeyboardMoveModule,
  MoveCanvasModule,
  ZoomScrollModule
];

Modeler.prototype._modelingModules = [

  // modeling components
  AlignElementsModule,
  AutoPlaceModule,
  AutoScrollModule,
  AutoResizeModule,
  BendpointsModule,
  ConnectModule,
  ConnectionPreviewModule,
  ContextPadModule,
  CopyPasteModule,
  CreateModule,
  DistributeElementsModule,
  EditorActionsModule,
  GridSnappingModule,
  InteractionEventsModule,
  KeyboardModule,
  KeyboardMoveSelectionModule,
  LabelEditingModule,
  LabelLink,
  ModelingModule,
  ModelingFeedbackModule,
  MoveModule,
  PaletteModule,
  ReplacePreviewModule,
  ResizeModule,
  SnappingModule,
  SearchModule,
  OutlineModule
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

Modeler.prototype._modules = [].concat(
  Viewer.prototype._modules,
  Modeler.prototype._interactionModules,
  Modeler.prototype._modelingModules
);
