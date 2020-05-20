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
  query as domQuery,
  remove as domRemove
} from 'min-dom';

import {
  innerSVG
} from 'tiny-svg';

import Diagram from 'diagram-js';
import BpmnModdle from 'bpmn-moddle';

import inherits from 'inherits';

import {
  importBpmnDiagram
} from './import/Importer';

import {
  wrapForCompatibility
} from './util/CompatibilityUtil';

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
 * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
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
BaseViewer.prototype.importXML = wrapForCompatibility(function importXML(xml, bpmnDiagram) {

  var self = this;

  function ParseCompleteEvent(data) {

    var event = self.get('eventBus').createEvent(data);

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

  return new Promise(function(resolve, reject) {

    // hook in pre-parse listeners +
    // allow xml manipulation
    xml = self._emit('import.parse.start', { xml: xml }) || xml;

    self._moddle.fromXML(xml, 'bpmn:Definitions').then(function(result) {
      var definitions = result.rootElement;
      var references = result.references;
      var parseWarnings = result.warnings;
      var elementsById = result.elementsById;

      // hook in post parse listeners +
      // allow definitions manipulation
      definitions = self._emit('import.parse.complete', ParseCompleteEvent({
        error: null,
        definitions: definitions,
        elementsById: elementsById,
        references: references,
        warnings: parseWarnings
      })) || definitions;

      self.importDefinitions(definitions, bpmnDiagram).then(function(result) {
        var allWarnings = [].concat(parseWarnings, result.warnings || []);

        self._emit('import.done', { error: null, warnings: allWarnings });

        return resolve({ warnings: allWarnings });
      }).catch(function(err) {
        var allWarnings = [].concat(parseWarnings, err.warnings || []);

        self._emit('import.done', { error: err, warnings: allWarnings });

        return reject(addWarningsToError(err, allWarnings));
      });
    }).catch(function(err) {

      self._emit('import.parse.complete', {
        error: err
      });

      err = checkValidationError(err);

      self._emit('import.done', { error: err, warnings: err.warnings });

      return reject(err);
    });
  });
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
BaseViewer.prototype.importDefinitions = wrapForCompatibility(function importDefinitions(definitions, bpmnDiagram) {

  var self = this;

  return new Promise(function(resolve, reject) {

    self._setDefinitions(definitions);

    self.open(bpmnDiagram).then(function(result) {

      var warnings = result.warnings;

      return resolve({ warnings: warnings });
    }).catch(function(err) {

      return reject(err);
    });
  });
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
BaseViewer.prototype.open = wrapForCompatibility(function open(bpmnDiagramOrId) {

  var definitions = this._definitions;
  var bpmnDiagram = bpmnDiagramOrId;

  var self = this;

  return new Promise(function(resolve, reject) {
    if (!definitions) {
      var err1 = new Error('no XML imported');

      return reject(addWarningsToError(err1, []));
    }

    if (typeof bpmnDiagramOrId === 'string') {
      bpmnDiagram = findBPMNDiagram(definitions, bpmnDiagramOrId);

      if (!bpmnDiagram) {
        var err2 = new Error('BPMNDiagram <' + bpmnDiagramOrId + '> not found');

        return reject(addWarningsToError(err2, []));
      }
    }

    // clear existing rendered diagram
    // catch synchronous exceptions during #clear()
    try {
      self.clear();
    } catch (error) {

      return reject(addWarningsToError(error, []));
    }

    // perform graphical import
    importBpmnDiagram(self, definitions, bpmnDiagram).then(function(result) {

      var warnings = result.warnings;

      return resolve({ warnings: warnings });
    }).catch(function(err) {

      return reject(err);
    });
  });
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
BaseViewer.prototype.saveXML = wrapForCompatibility(function saveXML(options) {

  options = options || {};

  var self = this;

  var definitions = this._definitions;

  return new Promise(function(resolve, reject) {

    if (!definitions) {
      var err = new Error('no definitions loaded');

      return reject(err);
    }

    // allow to fiddle around with definitions
    definitions = self._emit('saveXML.start', {
      definitions: definitions
    }) || definitions;

    self._moddle.toXML(definitions, options).then(function(result) {

      var xml = result.xml;

      try {
        xml = self._emit('saveXML.serialized', {
          error: null,
          xml: xml
        }) || xml;

        self._emit('saveXML.done', {
          error: null,
          xml: xml
        });
      } catch (e) {
        console.error('error in saveXML life-cycle listener', e);
      }

      return resolve({ xml: xml });
    }).catch(function(err) {

      return reject(err);
    });
  });
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
BaseViewer.prototype.saveSVG = wrapForCompatibility(function saveSVG(options) {

  options = options || {};

  var self = this;

  return new Promise(function(resolve, reject) {

    self._emit('saveSVG.start');

    var svg, err;

    try {
      var canvas = self.get('canvas');

      var contentNode = canvas.getDefaultLayer(),
          defsNode = domQuery('defs', canvas._svg);

      var contents = innerSVG(contentNode),
          defs = defsNode ? '<defs>' + innerSVG(defsNode) + '</defs>' : '';

      var bbox = contentNode.getBBox();

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

    self._emit('saveSVG.done', {
      error: err,
      svg: svg
    });

    if (!err) {
      return resolve({ svg: svg });
    }

    return reject(err);
  });
});

/**
 * Get a named diagram service.
 *
 * @example
 *
 * var elementRegistry = viewer.get('elementRegistry');
 * var startEventShape = elementRegistry.get('StartEvent_1');
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
 *   var startEventShape = elementRegistry.get('StartEvent_1');
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

BaseViewer.prototype.getModules = function() {
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

  // remove businessObject#di binding
  //
  // this is necessary, as we establish the bindings
  // in the BpmnTreeWalker (and assume none are given
  // on reimport)
  this.get('elementRegistry').forEach(function(element) {
    var bo = element.businessObject;

    if (bo && bo.di) {
      delete bo.di;
    }
  });

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

  var container = this._container,
      parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  this._emit('detach', {});

  parentNode.removeChild(container);
};

BaseViewer.prototype._init = function(container, moddle, options) {

  var baseModules = options.modules || this.getModules(),
      additionalModules = options.additionalModules || [],
      staticModules = [
        {
          bpmnjs: [ 'value', this ],
          moddle: [ 'value', moddle ]
        }
      ];

  var diagramModules = [].concat(staticModules, baseModules, additionalModules);

  var diagramOptions = assign(omit(options, [ 'additionalModules' ]), {
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

  var container = domify('<div class="bjs-container"></div>');

  assign(container.style, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

BaseViewer.prototype._createModdle = function(options) {
  var moddleOptions = assign({}, this._moddleExtensions, options.moddleExtensions);

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

  var pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
  var match = pattern.exec(err.message);

  if (match) {
    err.message =
      'unparsable content <' + match[1] + '> detected; ' +
      'this may indicate an invalid BPMN 2.0 diagram file' + match[2];
  }

  return err;
}

var DEFAULT_OPTIONS = {
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
  LINK_STYLES as BPMNIO_LINK_STYLES
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
  var img = BPMNIO_IMG;

  var linkMarkup =
    '<a href="http://bpmn.io" ' +
       'target="_blank" ' +
       'class="bjs-powered-by" ' +
       'title="Powered by bpmn.io" ' +
       'style="position: absolute; bottom: 15px; right: 15px; z-index: 100; ' + BPMNIO_LINK_STYLES + '">' +
      img +
    '</a>';

  var linkElement = domify(linkMarkup);

  container.appendChild(linkElement);

  domEvent.bind(linkElement, 'click', function(event) {
    openPoweredBy();

    event.preventDefault();
  });
}

/* </project-logo> */
