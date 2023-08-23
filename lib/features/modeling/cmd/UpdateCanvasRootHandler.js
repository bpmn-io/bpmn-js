import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import { getDi } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * @implements {CommandHandler}
 *
 * @param {Canvas} canvas
 * @param {Modeling} modeling
 */
export default function UpdateCanvasRootHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

UpdateCanvasRootHandler.$inject = [
  'canvas',
  'modeling'
];


UpdateCanvasRootHandler.prototype.execute = function(context) {

  var canvas = this._canvas;

  var newRoot = context.newRoot,
      newRootBusinessObject = newRoot.businessObject,
      oldRoot = canvas.getRootElement(),
      oldRootBusinessObject = oldRoot.businessObject,
      bpmnDefinitions = oldRootBusinessObject.$parent,
      diPlane = getDi(oldRoot);

  // (1) replace process old <> new root
  canvas.setRootElement(newRoot);
  canvas.removeRootElement(oldRoot);

  // (2) update root elements
  collectionAdd(bpmnDefinitions.rootElements, newRootBusinessObject);
  newRootBusinessObject.$parent = bpmnDefinitions;

  collectionRemove(bpmnDefinitions.rootElements, oldRootBusinessObject);
  oldRootBusinessObject.$parent = null;

  // (3) wire di
  oldRoot.di = null;

  diPlane.bpmnElement = newRootBusinessObject;
  newRoot.di = diPlane;

  context.oldRoot = oldRoot;

  // TODO(nikku): return changed elements?
  // return [ newRoot, oldRoot ];
  return [];
};


UpdateCanvasRootHandler.prototype.revert = function(context) {

  var canvas = this._canvas;

  var newRoot = context.newRoot,
      newRootBusinessObject = newRoot.businessObject,
      oldRoot = context.oldRoot,
      oldRootBusinessObject = oldRoot.businessObject,
      bpmnDefinitions = newRootBusinessObject.$parent,
      diPlane = getDi(newRoot);

  // (1) replace process old <> new root
  canvas.setRootElement(oldRoot);
  canvas.removeRootElement(newRoot);

  // (2) update root elements
  collectionRemove(bpmnDefinitions.rootElements, newRootBusinessObject);
  newRootBusinessObject.$parent = null;

  collectionAdd(bpmnDefinitions.rootElements, oldRootBusinessObject);
  oldRootBusinessObject.$parent = bpmnDefinitions;

  // (3) wire di
  newRoot.di = null;

  diPlane.bpmnElement = oldRootBusinessObject;
  oldRoot.di = diPlane;

  // TODO(nikku): return changed elements?
  // return [ newRoot, oldRoot ];

  return [];
};