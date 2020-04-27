import inherits from 'inherits';

import Ids from 'ids';

import BaseViewer from './BaseViewer';


/**
 * A base modeler for BPMN 2.0 diagrams.
 *
 * Have a look at {@link Modeler} for a bundle that includes actual features.
 *
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {string|number} [options.width] the width of the viewer
 * @param {string|number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
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
 * Create a moddle instance, attaching ids to it.
 *
 * @param {Object} options
 */
BaseModeler.prototype._createModdle = function(options) {
  var moddle = BaseViewer.prototype._createModdle.call(this, options);

  // attach ids to moddle to be able to track
  // and validated ids in the BPMN 2.0 XML document
  // tree
  moddle.ids = new Ids([ 32, 36, 1 ]);

  return moddle;
};

/**
 * Collect ids processed during parsing of the
 * definitions object.
 *
 * @param {ModdleElement} definitions
 * @param {Context} context
 */
BaseModeler.prototype._collectIds = function(definitions, elementsById) {

  var moddle = definitions.$model,
      ids = moddle.ids,
      id;

  // remove references from previous import
  ids.clear();

  for (id in elementsById) {
    ids.claim(id, elementsById[id]);
  }
};
