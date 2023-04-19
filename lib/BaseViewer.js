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
 * @template T
 *
 * @typedef {import('diagram-js/lib/core/EventBus').EventBusEventCallback<T>} EventBusEventCallback
 */

/**
 * @typedef {import('didi').ModuleDeclaration} ModuleDeclaration
 *
 * @typedef {import('./model/Types').Moddle} Moddle
 * @typedef {import('./model/Types').ModdleElement} ModdleElement
 * @typedef {import('./model/Types').ModdleExtension} ModdleExtension
 *
 * @typedef { {
 *   width?: number|string;
 *   height?: number|string;
 *   position?: string;
 *   container?: string|HTMLElement;
 *   moddleExtensions?: ModdleExtensions;
 *   additionalModules?: ModuleDeclaration[];
 * } & Record<string, any> } BaseViewerOptions
 *
 * @typedef {Record<string, ModdleElement>} ModdleElementsById
 *
 * @typedef { {
 *   [key: string]: ModdleExtension;
 * } } ModdleExtensions
 *
 * @typedef { {
 *   warnings: string[];
 * } } ImportXMLResult
 *
 * @typedef {ImportXMLResult & Error} ImportXMLError
 *
 * @typedef {ImportXMLResult} ImportDefinitionsResult
 *
 * @typedef {ImportXMLError} ImportDefinitionsError
 *
 * @typedef {ImportXMLResult} OpenResult
 *
 * @typedef {ImportXMLError} OpenError
 *
 * @typedef { {
 *   format?: boolean;
 *   preamble?: boolean;
 * } } SaveXMLOptions
 *
 * @typedef { {
 *   xml?: string;
 *   error?: Error;
 * } } SaveXMLResult
 *
 * @typedef { {
 *   svg: string;
 * } } SaveSVGResult
 *
 * @typedef { {
 *   xml: string;
 * } } ImportParseStartEvent
 *
 * @typedef { {
 *   error?: ImportXMLError;
 *   definitions?: ModdleElement;
 *   elementsById?: ModdleElementsById;
 *   references?: ModdleElement[];
 *   warnings: string[];
 * } } ImportParseCompleteEvent
 *
 * @typedef { {
 *   error?: ImportXMLError;
 *   warnings: string[];
 * } } ImportDoneEvent
 *
 * @typedef { {
 *   definitions: ModdleElement;
 * } } SaveXMLStartEvent
 *
 * @typedef {SaveXMLResult} SaveXMLDoneEvent
 *
 * @typedef { {
 *   error?: Error;
 *   svg: string;
 * } } SaveSVGDoneEvent
 */

/**
 * A base viewer for BPMN 2.0 diagrams.
 *
 * Have a look at {@link Viewer}, {@link NavigatedViewer} or {@link Modeler} for
 * bundles that include actual features.
 *
 * @param {BaseViewerOptions} [options] The options to configure the viewer.
 */
export default function BaseViewer(options) {

  /**
   * @type {BaseViewerOptions}
   */
  options = assign({}, DEFAULT_OPTIONS, options);

  /**
   * @type {Moddle}
   */
  this._moddle = this._createModdle(options);

  /**
   * @type {HTMLElement}
   */
  this._container = this._createContainer(options);

  /* <project-logo> */

  addProjectLogo(this._container);

  /* </project-logo> */

  this._init(this._container, this._moddle, options);
}

inherits(BaseViewer, Diagram);

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
 *   * import.parse.start (about to read model from XML)
 *   * import.parse.complete (model read; may have worked or not)
 *   * import.render.start (graphical import start)
 *   * import.render.complete (graphical import finished)
 *   * import.done (everything done)
 *
 * You can use these events to hook into the life-cycle.
 *
 * @throws {ImportXMLError} An error thrown during the import of the XML.
 *
 * @fires BaseViewer#ImportParseStartEvent
 * @fires BaseViewer#ImportParseCompleteEvent
 * @fires Importer#ImportRenderStartEvent
 * @fires Importer#ImportRenderCompleteEvent
 * @fires BaseViewer#ImportDoneEvent
 *
 * @param {string} xml The BPMN 2.0 XML to be imported.
 * @param {ModdleElement|string} [bpmnDiagram] The optional diagram or Id of the BPMN diagram to open.
 *
 * @return {Promise<ImportXMLResult>} A promise resolving with warnings that were produced during the import.
 */
BaseViewer.prototype.importXML = async function importXML(xml, bpmnDiagram) {

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

    /**
     * A `import.parse.start` event.
     *
     * @event BaseViewer#ImportParseStartEvent
     * @type {ImportParseStartEvent}
     */
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

    /**
     * A `import.parse.complete` event.
     *
     * @event BaseViewer#ImportParseCompleteEvent
     * @type {ImportParseCompleteEvent}
     */
    definitions = this._emit('import.parse.complete', ParseCompleteEvent({
      error: null,
      definitions: definitions,
      elementsById: elementsById,
      references: references,
      warnings: aggregatedWarnings
    })) || definitions;

    const importResult = await this.importDefinitions(definitions, bpmnDiagram);

    aggregatedWarnings = aggregatedWarnings.concat(importResult.warnings);

    /**
     * A `import.parse.complete` event.
     *
     * @event BaseViewer#ImportDoneEvent
     * @type {ImportDoneEvent}
     */
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
};

BaseViewer.prototype.importXML = wrapForCompatibility(BaseViewer.prototype.importXML);


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
 * @throws {ImportDefinitionsError} An error thrown during the import of the definitions.
 *
 * @param {ModdleElement} definitions The definitions.
 * @param {ModdleElement|string} [bpmnDiagram] The optional diagram or ID of the BPMN diagram to open.
 *
 * @return {Promise<ImportDefinitionsResult>} A promise resolving with warnings that were produced during the import.
 */
BaseViewer.prototype.importDefinitions = async function importDefinitions(definitions, bpmnDiagram) {
  this._setDefinitions(definitions);
  const result = await this.open(bpmnDiagram);

  return { warnings: result.warnings };
};

BaseViewer.prototype.importDefinitions = wrapForCompatibility(BaseViewer.prototype.importDefinitions);


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
 * @throws {OpenError} An error thrown during opening.
 *
 * @param {ModdleElement|string} bpmnDiagramOrId The diagram or Id of the BPMN diagram to open.
 *
 * @return {Promise<OpenResult>} A promise resolving with warnings that were produced during opening.
 */
BaseViewer.prototype.open = async function open(bpmnDiagramOrId) {

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
};

BaseViewer.prototype.open = wrapForCompatibility(BaseViewer.prototype.open);

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
 * @throws {Error} An error thrown during export.
 *
 * @fires BaseViewer#SaveXMLStart
 * @fires BaseViewer#SaveXMLDone
 *
 * @param {SaveXMLOptions} [options] The options.
 *
 * @return {Promise<SaveXMLResult>} A promise resolving with the XML.
 */
BaseViewer.prototype.saveXML = async function saveXML(options) {

  options = options || {};

  let definitions = this._definitions,
      error, xml;

  try {
    if (!definitions) {
      throw new Error('no definitions loaded');
    }

    // allow to fiddle around with definitions

    /**
     * A `saveXML.start` event.
     *
     * @event BaseViewer#SaveXMLStartEvent
     * @type {SaveXMLStartEvent}
     */
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

  /**
   * A `saveXML.done` event.
   *
   * @event BaseViewer#SaveXMLDoneEvent
   * @type {SaveXMLDoneEvent}
   */
  this._emit('saveXML.done', result);

  if (error) {
    throw error;
  }

  return result;
};

BaseViewer.prototype.saveXML = wrapForCompatibility(BaseViewer.prototype.saveXML);


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
 * @throws {Error} An error thrown during export.
 *
 * @fires BaseViewer#SaveSVGDone
 *
 * @return {Promise<SaveSVGResult>} A promise resolving with the SVG.
 */
BaseViewer.prototype.saveSVG = async function saveSVG() {
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

  /**
   * A `saveSVG.done` event.
   *
   * @event BaseViewer#SaveSVGDoneEvent
   * @type {SaveSVGDoneEvent}
   */
  this._emit('saveSVG.done', {
    error: err,
    svg: svg
  });

  if (err) {
    throw err;
  }

  return { svg };
};

BaseViewer.prototype.saveSVG = wrapForCompatibility(BaseViewer.prototype.saveSVG);

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
 * @return {ModuleDeclaration[]} The modules.
 */
BaseViewer.prototype.getModules = function() {
  return this._modules;
};

/**
 * Remove all drawn elements from the viewer.
 *
 * After calling this method the viewer can still be reused for opening another
 * diagram.
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
 * Destroy the viewer instance and remove all its remainders from the document
 * tree.
 */
BaseViewer.prototype.destroy = function() {

  // diagram destroy
  Diagram.prototype.destroy.call(this);

  // dom detach
  domRemove(this._container);
};

/**
 * Register an event listener.
 *
 * Remove an event listener via {@link BaseViewer#off}.
 *
 * @template T
 *
 * @param {string|string[]} events The event(s) to listen to.
 * @param {number} [priority] The priority with which to listen.
 * @param {EventBusEventCallback<T>} callback The callback.
 * @param {any} [that] Value of `this` the callback will be called with.
 */
BaseViewer.prototype.on = function(events, priority, callback, that) {
  return this.get('eventBus').on(events, priority, callback, that);
};

/**
 * Remove an event listener.
 *
 * @param {string|string[]} events The event(s).
 * @param {Function} [callback] The callback.
 */
BaseViewer.prototype.off = function(events, callback) {
  this.get('eventBus').off(events, callback);
};

/**
 * Attach the viewer to an HTML element.
 *
 * @param {HTMLElement} parentNode The parent node to attach to.
 */
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

/**
 * Get the definitions model element.
 *
 * @return {ModdleElement} The definitions model element.
 */
BaseViewer.prototype.getDefinitions = function() {
  return this._definitions;
};

/**
 * Detach the viewer.
 *
 * @fires BaseViewer#DetachEvent
 */
BaseViewer.prototype.detach = function() {

  const container = this._container,
        parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  /**
   * A `detach` event.
   *
   * @event BaseViewer#DetachEvent
   * @type {Object}
   */
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
 * @return {Object} The return value after calling all event listeners.
 */
BaseViewer.prototype._emit = function(type, event) {
  return this.get('eventBus').fire(type, event);
};

/**
 * @param {BaseViewerOptions} options
 *
 * @return {HTMLElement}
 */
BaseViewer.prototype._createContainer = function(options) {

  const container = domify('<div class="bjs-container"></div>');

  assignStyle(container, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

/**
 * @param {BaseViewerOptions} options
 *
 * @return {Moddle}
 */
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
