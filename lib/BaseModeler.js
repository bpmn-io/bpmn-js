import inherits from 'inherits-browser';

import Ids from 'ids';

import BaseViewer from './BaseViewer';


/**
 * @typedef {import('./BaseViewer').BaseViewerOptions} BaseViewerOptions
 * @typedef {import('./BaseViewer').ModdleElementsById} ModdleElementsById
 *
 * @typedef {import('./model/Types').ModdleElement} ModdleElement
 */

/**
 * A base modeler for BPMN 2.0 diagrams.
 *
 * See {@link Modeler} for a fully-featured modeler.
 *
 * @param {BaseViewerOptions} [options] The options to configure the modeler.
 */
export default function BaseModeler(options) {
  BaseViewer.call(this, options);

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

inherits(BaseModeler, BaseViewer);


/**
 * Create a moddle instance, attaching IDs to it.
 *
 * @param {BaseViewerOptions} options
 *
 * @return {Moddle}
 */
BaseModeler.prototype._createModdle = function(options) {
  var moddle = BaseViewer.prototype._createModdle.call(this, options);

  // attach ids to moddle to be able to track and validated ids in the BPMN 2.0
  // XML document tree
  moddle.ids = new Ids([ 32, 36, 1 ]);

  return moddle;
};

/**
 * Collect IDs processed during parsing of the definitions object.
 *
 * @param {ModdleElement} definitions
 * @param {ModdleElementsById} elementsById
 */
BaseModeler.prototype._collectIds = function(definitions, elementsById) {

  var moddle = definitions.$model,
      ids = moddle.ids,
      id;

  // remove references from previous import
  ids.clear();

  for (id in elementsById) {
    ids.claim(id, elementsById[ id ]);
  }
};
