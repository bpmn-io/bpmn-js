/**
 * The code in the <project-logo></project-logo> area
 * must not be changed.
 *
 * @see http://bpmn.io/license for more information.
 */
import {
  assign,
  find,
  isNumber,
  omit
} from 'min-dash';

import {
  domify,
  assignStyle,
  query as domQuery,
  remove as domRemove
} from 'min-dom';

import {
  innerSVG
} from 'tiny-svg';

import Diagram from 'diagram-js';
import BpmnModdle from 'bpmn-moddle';

import inherits from 'inherits-browser';

import {
  importBpmnDiagram
} from './import/Importer';

import {
  wrapForCompatibility
} from './util/CompatibilityUtil';


/**
 * @typedef { import('didi').ModuleDeclaration } Module
 */

/**
 * A base viewer for BPMN 2.0 diagrams.
 *
 * Have a look at {@link Viewer}, {@link NavigatedViewer} or {@link Modeler} for
 * bundles that include actual features.
 *
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {string|number} [options.width] the width of the viewer
 * @param {string|number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Module[]} [options.modules] a list of modules to override the default modules
 * @param {Module[]} [options.additionalModules] a list of modules to use with the default modules
 */
export default function BaseViewer(options) {

  options = assign({}, DEFAULT_OPTIONS, options);

  this._moddle = this._createModdle(options);

  this._container = this._createContainer(options);

  /* <project-logo> */

  addProjectLogo(this._container);

  /* </project-logo> */

  this._init(this._container, this._moddle, options);
}

inherits(BaseViewer, Diagram);

/**
* The importXML result.
*
* @typedef {Object} ImportXMLResult
*
* @property {Array<string>} warnings
*/

/**
* The importXML error.
*
* @typedef {Error} ImportXMLError
*
* @property {Array<string>} warnings
*/

/**
 * Parse and render a BPMN 2.0 diagram.
 *
 * Once finished the viewer reports back the result to the
 * provided callback function with (err, warnings).
 *
 * ## Life-Cycle Events
 *
 * During import the viewer will fire life-cycle events:
 *
 *   * import.parse.start (about to read model from xml)
 *   * import.parse.complete (model read; may have worked or not)
 *   * import.render.start (graphical import start)
 *   * import.render.complete (graphical import finished)
 *   * import.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {string} xml the BPMN 2.0 xml
 * @param {ModdleElement<BPMNDiagram>|string} [bpmnDiagram] BPMN diagram or id of diagram to render (if not provided, the first one will be rendered)
 *
 * Returns {Promise<ImportXMLResult, ImportXMLError>}
 */
BaseViewer.prototype.importXML = wrapForCompatibility(async function importXML(xml, bpmnDiagram) {

  const self = this;

  function ParseCompleteEvent(data) {

    const event = self.get('eventBus').createEvent(data);

    // TODO(nikku): remove with future bpmn-js version
    Object.defineProperty(event, 'context', {
      enumerable: true,
      get: function() {

        console.warn(new Error(
          'import.parse.complete <context> is deprecated ' +
          'and will be removed in future library versions'
        ));

        return {
          warnings: data.warnings,
          references: data.references,
          elementsById: data.elementsById
        };
      }
    });

    return event;
  }

  let aggregatedWarnings = [];
  try {

    // hook in pre-parse listeners +
    // allow xml manipulation
    xml = this._emit('import.parse.start', { xml: xml }) || xml;

    let parseResult;
    try {
      parseResult = await this._moddle.fromXML(xml, 'bpmn:Definitions');
    } catch (error) {
      this._emit('import.parse.complete', {
        error
      });

      throw error;
    }

    let definitions = parseResult.rootElement;
    const references = parseResult.references;
    const parseWarnings = parseResult.warnings;
    const elementsById = parseResult.elementsById;

    aggregatedWarnings = aggregatedWarnings.concat(parseWarnings);

    // hook in post parse listeners +
    // allow definitions manipulation
    definitions = this._emit('import.parse.complete', ParseCompleteEvent({
      error: null,
      definitions: definitions,
      elementsById: elementsById,
      references: references,
      warnings: aggregatedWarnings
    })) || definitions;

    const importResult = await this.importDefinitions(definitions, bpmnDiagram);

    aggregatedWarnings = aggregatedWarnings.concat(importResult.warnings);

    this._emit('import.done', { error: null, warnings: aggregatedWarnings });

    return { warnings: aggregatedWarnings };
  } catch (err) {
    let error = err;
    aggregatedWarnings = aggregatedWarnings.concat(error.warnings || []);
    addWarningsToError(error, aggregatedWarnings);

    error = checkValidationError(error);

    this._emit('import.done', { error, warnings: error.warnings });

    throw error;
  }
});

/**
* The importDefinitions result.
*
* @typedef {Object} ImportDefinitionsResult
*
* @property {Array<string>} warnings
*/

/**
* The importDefinitions error.
*
* @typedef {Error} ImportDefinitionsError
*
* @property {Array<string>} warnings
*/

/**
 * Import parsed definitions and render a BPMN 2.0 diagram.
 *
 * Once finished the viewer reports back the result to the
 * provided callback function with (err, warnings).
 *
 * ## Life-Cycle Events
 *
 * During import the viewer will fire life-cycle events:
 *
 *   * import.render.start (graphical import start)
 *   * import.render.complete (graphical import finished)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {ModdleElement<Definitions>} definitions parsed BPMN 2.0 definitions
 * @param {ModdleElement<BPMNDiagram>|string} [bpmnDiagram] BPMN diagram or id of diagram to render (if not provided, the first one will be rendered)
 *
 * Returns {Promise<ImportDefinitionsResult, ImportDefinitionsError>}
 */
BaseViewer.prototype.importDefinitions = wrapForCompatibility(async function importDefinitions(definitions, bpmnDiagram) {
  this._setDefinitions(definitions);
  const result = await this.open(bpmnDiagram);

  return { warnings: result.warnings };
});

/**
 * The open result.
 *
 * @typedef {Object} OpenResult
 *
 * @property {Array<string>} warnings
 */

/**
* The open error.
*
* @typedef {Error} OpenError
*
* @property {Array<string>} warnings
*/

/**
 * Open diagram of previously imported XML.
 *
 * Once finished the viewer reports back the result to the
 * provided callback function with (err, warnings).
 *
 * ## Life-Cycle Events
 *
 * During switch the viewer will fire life-cycle events:
 *
 *   * import.render.start (graphical import start)
 *   * import.render.complete (graphical import finished)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {string|ModdleElement<BPMNDiagram>} [bpmnDiagramOrId] id or the diagram to open
 *
 * Returns {Promise<OpenResult, OpenError>}
 */
BaseViewer.prototype.open = wrapForCompatibility(async function open(bpmnDiagramOrId) {

  const definitions = this._definitions;
  let bpmnDiagram = bpmnDiagramOrId;

  if (!definitions) {
    const error = new Error('no XML imported');
    addWarningsToError(error, []);

    throw error;
  }

  if (typeof bpmnDiagramOrId === 'string') {
    bpmnDiagram = findBPMNDiagram(definitions, bpmnDiagramOrId);

    if (!bpmnDiagram) {
      const error = new Error('BPMNDiagram <' + bpmnDiagramOrId + '> not found');
      addWarningsToError(error, []);

      throw error;
    }
  }

  // clear existing rendered diagram
  // catch synchronous exceptions during #clear()
  try {
    this.clear();
  } catch (error) {
    addWarningsToError(error, []);

    throw error;
  }

  // perform graphical import
  const { warnings } = await importBpmnDiagram(this, definitions, bpmnDiagram);

  return { warnings };
});

/**
 * The saveXML result.
 *
 * @typedef {Object} SaveXMLResult
 *
 * @property {string} xml
 */

/**
 * Export the currently displayed BPMN 2.0 diagram as
 * a BPMN 2.0 XML document.
 *
 * ## Life-Cycle Events
 *
 * During XML saving the viewer will fire life-cycle events:
 *
 *   * saveXML.start (before serialization)
 *   * saveXML.serialized (after xml generation)
 *   * saveXML.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {Object} [options] export options
 * @param {boolean} [options.format=false] output formatted XML
 * @param {boolean} [options.preamble=true] output preamble
 *
 * Returns {Promise<SaveXMLResult, Error>}
 */
BaseViewer.prototype.saveXML = wrapForCompatibility(async function saveXML(options) {

  options = options || {};

  let definitions = this._definitions,
      error, xml;

  try {
    if (!definitions) {
      throw new Error('no definitions loaded');
    }

    // allow to fiddle around with definitions
    definitions = this._emit('saveXML.start', {
      definitions
    }) || definitions;

    const result = await this._moddle.toXML(definitions, options);
    xml = result.xml;

    xml = this._emit('saveXML.serialized', {
      xml
    }) || xml;
  } catch (err) {
    error = err;
  }

  const result = error ? { error } : { xml };

  this._emit('saveXML.done', result);

  if (error) {
    throw error;
  }

  return result;
});

/**
 * The saveSVG result.
 *
 * @typedef {Object} SaveSVGResult
 *
 * @property {string} svg
 */

/**
 * Export the currently displayed BPMN 2.0 diagram as
 * an SVG image.
 *
 * ## Life-Cycle Events
 *
 * During SVG saving the viewer will fire life-cycle events:
 *
 *   * saveSVG.start (before serialization)
 *   * saveSVG.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @param {Object} [options]
 *
 * Returns {Promise<SaveSVGResult, Error>}
 */
BaseViewer.prototype.saveSVG = wrapForCompatibility(async function saveSVG(options = {}) {
  this._emit('saveSVG.start');

  let svg, err;

  try {
    const canvas = this.get('canvas');

    const contentNode = canvas.getActiveLayer(),
          defsNode = domQuery('defs', canvas._svg);

    const contents = innerSVG(contentNode),
          defs = defsNode ? '<defs>' + innerSVG(defsNode) + '</defs>' : '';

    const bbox = contentNode.getBBox();

    svg =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<!-- created with bpmn-js / http://bpmn.io -->\n' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'width="' + bbox.width + '" height="' + bbox.height + '" ' +
      'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
      defs + contents +
      '</svg>';
  } catch (e) {
    err = e;
  }

  this._emit('saveSVG.done', {
    error: err,
    svg: svg
  });

  if (err) {
    throw err;
  }

  return { svg };
});

/**
 * Get a named diagram service.
 *
 * @example
 *
 * const elementRegistry = viewer.get('elementRegistry');
 * const startEventShape = elementRegistry.get('StartEvent_1');
 *
 * @param {string} name
 *
 * @return {Object} diagram service instance
 *
 * @method BaseViewer#get
 */

/**
 * Invoke a function in the context of this viewer.
 *
 * @example
 *
 * viewer.invoke(function(elementRegistry) {
 *   const startEventShape = elementRegistry.get('StartEvent_1');
 * });
 *
 * @param {Function} fn to be invoked
 *
 * @return {Object} the functions return value
 *
 * @method BaseViewer#invoke
 */


BaseViewer.prototype._setDefinitions = function(definitions) {
  this._definitions = definitions;
};

/**
 * Return modules to instantiate with.
 *
 * @param {any} options the instance got created with
 *
 * @return {Module[]}
 */
BaseViewer.prototype.getModules = function(options) {
  return this._modules;
};

/**
 * Remove all drawn elements from the viewer.
 *
 * After calling this method the viewer can still
 * be reused for opening another diagram.
 *
 * @method BaseViewer#clear
 */
BaseViewer.prototype.clear = function() {
  if (!this.getDefinitions()) {

    // no diagram to clear
    return;
  }

  // remove drawn elements
  Diagram.prototype.clear.call(this);
};

/**
 * Destroy the viewer instance and remove all its
 * remainders from the document tree.
 */
BaseViewer.prototype.destroy = function() {

  // diagram destroy
  Diagram.prototype.destroy.call(this);

  // dom detach
  domRemove(this._container);
};

/**
 * Register an event listener
 *
 * Remove a previously added listener via {@link #off(event, callback)}.
 *
 * @param {string} event
 * @param {number} [priority]
 * @param {Function} callback
 * @param {Object} [that]
 */
BaseViewer.prototype.on = function(event, priority, callback, target) {
  return this.get('eventBus').on(event, priority, callback, target);
};

/**
 * De-register an event listener
 *
 * @param {string} event
 * @param {Function} callback
 */
BaseViewer.prototype.off = function(event, callback) {
  this.get('eventBus').off(event, callback);
};

BaseViewer.prototype.attachTo = function(parentNode) {

  if (!parentNode) {
    throw new Error('parentNode required');
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  parentNode.appendChild(this._container);

  this._emit('attach', {});

  this.get('canvas').resized();
};

BaseViewer.prototype.getDefinitions = function() {
  return this._definitions;
};

BaseViewer.prototype.detach = function() {

  const container = this._container,
        parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  this._emit('detach', {});

  parentNode.removeChild(container);
};

BaseViewer.prototype._init = function(container, moddle, options) {

  const baseModules = options.modules || this.getModules(options),
        additionalModules = options.additionalModules || [],
        staticModules = [
          {
            bpmnjs: [ 'value', this ],
            moddle: [ 'value', moddle ]
          }
        ];

  const diagramModules = [].concat(staticModules, baseModules, additionalModules);

  const diagramOptions = assign(omit(options, [ 'additionalModules' ]), {
    canvas: assign({}, options.canvas, { container: container }),
    modules: diagramModules
  });

  // invoke diagram constructor
  Diagram.call(this, diagramOptions);

  if (options && options.container) {
    this.attachTo(options.container);
  }
};

/**
 * Emit an event on the underlying {@link EventBus}
 *
 * @param  {string} type
 * @param  {Object} event
 *
 * @return {Object} event processing result (if any)
 */
BaseViewer.prototype._emit = function(type, event) {
  return this.get('eventBus').fire(type, event);
};

BaseViewer.prototype._createContainer = function(options) {

  const container = domify('<div class="bjs-container"></div>');

  assignStyle(container, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

BaseViewer.prototype._createModdle = function(options) {
  const moddleOptions = assign({}, this._moddleExtensions, options.moddleExtensions);

  return new BpmnModdle(moddleOptions);
};

BaseViewer.prototype._modules = [];

// helpers ///////////////

function addWarningsToError(err, warningsAry) {
  err.warnings = warningsAry;
  return err;
}

function checkValidationError(err) {

  // check if we can help the user by indicating wrong BPMN 2.0 xml
  // (in case he or the exporting tool did not get that right)

  const pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
  const match = pattern.exec(err.message);

  if (match) {
    err.message =
      'unparsable content <' + match[1] + '> detected; ' +
      'this may indicate an invalid BPMN 2.0 diagram file' + match[2];
  }

  return err;
}

const DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  position: 'relative'
};


/**
 * Ensure the passed argument is a proper unit (defaulting to px)
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '');
}


/**
 * Find BPMNDiagram in definitions by ID
 *
 * @param {ModdleElement<Definitions>} definitions
 * @param {string} diagramId
 *
 * @return {ModdleElement<BPMNDiagram>|null}
 */
function findBPMNDiagram(definitions, diagramId) {
  if (!diagramId) {
    return null;
  }

  return find(definitions.diagrams, function(element) {
    return element.id === diagramId;
  }) || null;
}


/* <project-logo> */

import {
  open as openPoweredBy,
  BPMNIO_IMG,
  LOGO_STYLES,
  LINK_STYLES
} from './util/PoweredByUtil';

import {
  event as domEvent
} from 'min-dom';

/**
 * Adds the project logo to the diagram container as
 * required by the bpmn.io license.
 *
 * @see http://bpmn.io/license
 *
 * @param {Element} container
 */
function addProjectLogo(container) {
  const img = BPMNIO_IMG;

  const linkMarkup =
    '<a href="http://bpmn.io" ' +
    'target="_blank" ' +
    'class="bjs-powered-by" ' +
    'title="Powered by bpmn.io" ' +
    '>' +
    img +
    '</a>';

  const linkElement = domify(linkMarkup);

  assignStyle(domQuery('svg', linkElement), LOGO_STYLES);
  assignStyle(linkElement, LINK_STYLES, {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    zIndex: '100'
  });

  container.appendChild(linkElement);

  domEvent.bind(linkElement, 'click', function(event) {
    openPoweredBy();

    event.preventDefault();
  });
}

/* </project-logo> */
