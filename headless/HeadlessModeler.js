import BaseModeler from '../lib/BaseModeler';

import CoreModule from '../lib/core';
import TranslateModule from 'diagram-js/lib/i18n/translate';
import SelectionModule from 'diagram-js/lib/features/selection';

import AutoPlaceModule from '../lib/features/auto-place';
import AutoResizeModule from '../lib/features/auto-resize';
import CopyPasteModule from '../lib/features/copy-paste';
import EditorActionsModule from '../lib/features/editor-actions';
import LabelEditingModule from '../lib/features/label-editing';
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
export default class HeadlessModeler extends BaseModeler {
  constructor(options) {
    super(options);
  }
}

HeadlessModeler.prototype._interactionModules = [

];

HeadlessModeler.prototype._modelingModules = [
  AutoPlaceModule,
  AutoResizeModule,
  CopyPasteModule,
  LabelEditingModule,
  ModelingModule,
  EditorActionsModule
];

// modules the viewer is composed of
HeadlessModeler.prototype._baseModules = [
  CoreModule,
  TranslateModule,
  SelectionModule,
  CoreOverrideModule
];

HeadlessModeler.prototype._modules = [].concat(
  HeadlessModeler.prototype._baseModules,
  HeadlessModeler.prototype._interactionModules,
  HeadlessModeler.prototype._modelingModules
);
