import BaseModeler from '../lib/BaseModeler';

import CoreModule from '../lib/core';
import TranslateModule from 'diagram-js/lib/i18n/translate';
import SelectionModule from 'diagram-js/lib/features/selection';

import AutoPlaceModule from '../lib/features/auto-place';
import AutoResizeModule from '../lib/features/auto-resize';
import CopyPasteModule from '../lib/features/copy-paste';
import EditorActionsModule from '../lib/features/editor-actions';
import ModelingModule from '../lib/features/modeling';

import CoreOverrideModule from './overrides/diagram-js/lib/core';


/**
 * @typedef {import('../lib/BaseViewer').BaseViewerOptions} BaseViewerOptions
 *
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

/**
 * A headless modeler for BPMN 2.0 diagrams.
 *
 * @param {BaseViewerOptions} [options] The options to configure the modeler.
 */
export default function HeadlessModeler(options) {

  // derived from BaseViewer.js /////////

  /**
   * @type {BaseViewerOptions}
   */
  options = { ...options };

  /**
   * @type {Moddle}
   */
  this._moddle = this._createModdle(options);

  /**
   * @type {HTMLElement}
   */
  this._container = this._createContainer(options);

  this._init(this._container, this._moddle, options);

  // derived from BaseModeler.js //////////

  // hook ID collection into the modeler
  this.on('import.parse.complete', function(event) {
    if (!event.error) {
      this._collectIds(event.definitions, event.elementsById);
    }
  }, this);

  this.on('diagram.destroy', function() {
    this.get('moddle').ids.clear();
  }, this);
}

HeadlessModeler.prototype = Object.create(BaseModeler.prototype);

HeadlessModeler.prototype._createContainer = function() {
  return {};
};

HeadlessModeler.prototype.saveSVG = function() {
  throw new Error('not implemented in headless bpmn-js');
};

HeadlessModeler.prototype._interactionModules = [

];

HeadlessModeler.prototype._modelingModules = [
  AutoPlaceModule,
  AutoResizeModule,
  CopyPasteModule,
  ModelingModule,
  EditorActionsModule
];

// modules the viewer is composed of
HeadlessModeler.prototype._baseModules = [
  CoreModule,
  TranslateModule,
  SelectionModule
];

HeadlessModeler.prototype._overrideModules = [
  CoreOverrideModule
];

HeadlessModeler.prototype._modules = [].concat(
  HeadlessModeler.prototype._baseModules,
  HeadlessModeler.prototype._interactionModules,
  HeadlessModeler.prototype._modelingModules,
  HeadlessModeler.prototype._overrideModules
);