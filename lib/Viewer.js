'use strict';

var assign = require('lodash/object/assign'),
    omit = require('lodash/object/omit'),
    isString = require('lodash/lang/isString'),
    isNumber = require('lodash/lang/isNumber');

var domify = require('min-dom/lib/domify'),
    domQuery = require('min-dom/lib/query'),
    domRemove = require('min-dom/lib/remove');

var Diagram = require('diagram-js'),
    BpmnModdle = require('bpmn-moddle');

var Importer = require('./import/Importer');


function initListeners(diagram, listeners) {
  var events = diagram.get('eventBus');

  listeners.forEach(function(l) {
    events.on(l.event, l.handler);
  });
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
  position: 'relative',
  container: 'body'
};


/**
 * Ensure the passed argument is a proper unit (defaulting to px)
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '');
}

/**
 * A viewer for BPMN 2.0 diagrams.
 *
 * Have a look at {@link NavigatedViewer} or {@link Modeler} for bundles that include
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
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {String|Number} [options.width] the width of the viewer
 * @param {String|Number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
 */
function Viewer(options) {

  this.options = options = assign({}, DEFAULT_OPTIONS, options || {});

  var parent = options.container;

  // support jquery element
  // unwrap it if passed
  if (parent.get) {
    parent = parent.get(0);
  }

  // support selector
  if (isString(parent)) {
    parent = domQuery(parent);
  }

  var container = this.container = domify('<div class="bjs-container"></div>');
  parent.appendChild(container);

  assign(container.style, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  /**
   * The code in the <project-logo></project-logo> area
   * must not be changed, see http://bpmn.io/license for more information
   *
   * <project-logo>
   */

  /* jshint -W101 */

  // inlined ../resources/bpmnjs.png
  var logoData = 'iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAMAAADypuvZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADBQTFRFiMte9PrwldFwfcZPqtqN0+zEyOe1XLgjvuKncsJAZ70y6fXh3vDT////UrQV////G2zN+AAAABB0Uk5T////////////////////AOAjXRkAAAHDSURBVHjavJZJkoUgDEBJmAX8979tM8u3E6x20VlYJfFFMoL4vBDxATxZcakIOJTWSmxvKWVIkJ8jHvlRv1F2LFrVISCZI+tCtQx+XfewgVTfyY3plPiQEAzI3zWy+kR6NBhFBYeBuscJLOUuA2WVLpCjVIaFzrNQZArxAZKUQm6gsj37L9Cb7dnIBUKxENaaMJQqMpDXvSL+ktxdGRm2IsKgJGGPg7atwUG5CcFUEuSv+CwQqizTrvDTNXdMU2bMiDWZd8d7QIySWVRsb2vBBioxOFt4OinPBapL+neAb5KL5IJ8szOza2/DYoipUCx+CjO0Bpsv0V6mktNZ+k8rlABlWG0FrOpKYVo8DT3dBeLEjUBAj7moDogVii7nSS9QzZnFcOVBp1g2PyBQ3Vr5aIapN91VJy33HTJLC1iX2FY6F8gRdaAeIEfVONgtFCzZTmoLEdOjBDfsIOA6128gw3eu1shAajdZNAORxuQDJN5A5PbEG6gNIu24QJD5iNyRMZIr6bsHbCtCU/OaOaSvgkUyDMdDa1BXGf5HJ1To+/Ym6mCKT02Y+/Sa126ZKyd3jxhzpc1r8zVL6YM1Qy/kR4ABAFJ6iQUnivhAAAAAAElFTkSuQmCC';

  /* jshint +W101 */

  var linkMarkup =
        '<a href="http://bpmn.io" ' +
           'target="_blank" ' +
           'class="bjs-powered-by" ' +
           'title="Powered by bpmn.io" ' +
           'style="position: absolute; bottom: 15px; right: 15px; z-index: 100">' +
            '<img src="data:image/png;base64,' + logoData + '">' +
        '</a>';

  container.appendChild(domify(linkMarkup));

  /* </project-logo> */
}

Viewer.prototype.importXML = function(xml, done) {

  var self = this;

  this.moddle = this.createModdle();

  this.moddle.fromXML(xml, 'bpmn:Definitions', function(err, definitions, context) {

    if (err) {
      err = checkValidationError(err);
      return done(err);
    }

    var parseWarnings = context.warnings;

    self.importDefinitions(definitions, function(err, importWarnings) {
      if (err) {
        return done(err);
      }

      done(null, parseWarnings.concat(importWarnings || []));
    });
  });
};

Viewer.prototype.saveXML = function(options, done) {

  if (!done) {
    done = options;
    options = {};
  }

  var definitions = this.definitions;

  if (!definitions) {
    return done(new Error('no definitions loaded'));
  }

  this.moddle.toXML(definitions, options, done);
};

Viewer.prototype.createModdle = function() {
  return new BpmnModdle(this.options.moddleExtensions);
};

Viewer.prototype.saveSVG = function(options, done) {

  if (!done) {
    done = options;
    options = {};
  }

  var canvas = this.get('canvas');

  var contentNode = canvas.getDefaultLayer(),
      defsNode = canvas._svg.select('defs');

  var contents = contentNode.innerSVG(),
      defs = (defsNode && defsNode.outerSVG()) || '';

  var bbox = contentNode.getBBox();

  var svg =
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<!-- created with bpmn-js / http://bpmn.io -->\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
         'width="' + bbox.width + '" height="' + bbox.height + '" ' +
         'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
      defs + contents +
    '</svg>';

  done(null, svg);
};

Viewer.prototype.get = function(name) {

  if (!this.diagram) {
    throw new Error('no diagram loaded');
  }

  return this.diagram.get(name);
};

Viewer.prototype.invoke = function(fn) {

  if (!this.diagram) {
    throw new Error('no diagram loaded');
  }

  return this.diagram.invoke(fn);
};

Viewer.prototype.importDefinitions = function(definitions, done) {

  // use try/catch to not swallow synchronous exceptions
  // that may be raised during model parsing
  try {
    if (this.diagram) {
      this.clear();
    }

    this.definitions = definitions;

    var diagram = this.diagram = this._createDiagram(this.options);

    this._init(diagram);

    Importer.importBpmnDiagram(diagram, definitions, done);
  } catch (e) {
    done(e);
  }
};

Viewer.prototype._init = function(diagram) {
  initListeners(diagram, this.__listeners || []);
};

Viewer.prototype._createDiagram = function(options) {

  var modules = [].concat(options.modules || this.getModules(), options.additionalModules || []);

  // add self as an available service
  modules.unshift({
    bpmnjs: [ 'value', this ],
    moddle: [ 'value', this.moddle ]
  });

  options = omit(options, 'additionalModules');

  options = assign(options, {
    canvas: { container: this.container },
    modules: modules
  });

  return new Diagram(options);
};


Viewer.prototype.getModules = function() {
  return this._modules;
};

/**
 * Remove all drawn elements from the viewer.
 *
 * After calling this method the viewer can still
 * be reused for opening another diagram.
 */
Viewer.prototype.clear = function() {
  var diagram = this.diagram;

  if (diagram) {
    diagram.destroy();
  }
};

/**
 * Destroy the viewer instance and remove all its remainders
 * from the document tree.
 */
Viewer.prototype.destroy = function() {
  // clear underlying diagram
  this.clear();

  // remove container
  domRemove(this.container);
};

/**
 * Register an event listener on the viewer
 *
 * @param {String} event
 * @param {Function} handler
 */
Viewer.prototype.on = function(event, handler) {
  var diagram = this.diagram,
      listeners = this.__listeners = this.__listeners || [];

  listeners.push({ event: event, handler: handler });

  if (diagram) {
    diagram.get('eventBus').on(event, handler);
  }
};

// modules the viewer is composed of
Viewer.prototype._modules = [
  require('./core'),
  require('diagram-js/lib/features/selection'),
  require('diagram-js/lib/features/overlays')
];

module.exports = Viewer;
