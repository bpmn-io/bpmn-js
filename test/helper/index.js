/**
 * A helper file that may be used in test cases for bpmn-js and extensions.
 *
 * Provides the globals
 *
 * * bootstrapModeler(): bootstrap a modeler instance
 * * bootstrapViewer(): bootstrap a viewer instance
 * * inject(function(a, b) {}): inject the bpmn-js services in the given function
 *
 *
 * In addition it provides the utilities
 *
 * * insertCSS(name, css): add a CSS file to be used in test cases
 *
 *
 * It is recommended to expose the helper through a per-project utility and
 * and perform custom bootstrapping (CSS, ...) in that utility.
 *
 * ```
 * export * from 'bpmn-js/test/helper';
 *
 * import {
 *   insertCSS
 * } from 'bpmn-js/test/helper';
 *
 * var fs = require('fs');
 *
 * // insert diagram.css
 * insertCSS('diagram.css', fs.readFileSync('some-css.css', 'utf8'));
 * ```
 */

import {
  isFunction,
  forEach,
  merge
} from 'min-dash';

import TestContainer from 'mocha-test-container-support';

import Modeler from '../../lib/Modeler';
import NavigatedViewer from '../../lib/NavigatedViewer';
import Viewer from '../../lib/Viewer';

var OPTIONS, BPMN_JS;

import translationModule from './TranslationCollector';

export var collectTranslations = window.__env__ && window.__env__.TRANSLATIONS === 'enabled';

// inject logging translation module into default modules
if (collectTranslations) {

  [ Modeler, Viewer, NavigatedViewer ].forEach(function(constructor) {
    constructor.prototype._modules.push(translationModule);
  });
}

export function bootstrapBpmnJS(BpmnJS, diagram, options, locals) {

  return function() {
    var testContainer;

    // Make sure the test container is an optional dependency and we fall back
    // to an empty <div> if it does not exist.
    //
    // This is needed if other libraries rely on this helper for testing
    // while not adding the mocha-test-container-support as a dependency.
    try {

      // 'this' is the current test context
      testContainer = TestContainer.get(this);
    } catch (e) {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
    }

    testContainer.classList.add('test-container');

    var _options = options,
        _locals = locals;

    if (_locals === undefined && isFunction(_options)) {
      _locals = _options;
      _options = null;
    }

    if (isFunction(_options)) {
      _options = _options();
    }

    if (isFunction(_locals)) {
      _locals = _locals();
    }

    _options = merge({
      container: testContainer,
      canvas: {
        deferUpdate: false
      }
    }, OPTIONS, _options);

    if (_locals) {
      var mockModule = {};

      forEach(_locals, function(v, k) {
        mockModule[k] = ['value', v];
      });

      _options.modules = [].concat(_options.modules || [], [ mockModule ]);
    }

    if (_options.modules && !_options.modules.length) {
      _options.modules = undefined;
    }

    // used to extract translations used during tests
    if (collectTranslations) {
      _options.additionalModules = [].concat(
        _options.additionalModules || [],
        [ translationModule ]
      );
    }

    clearBpmnJS();

    var instance = new BpmnJS(_options);

    setBpmnJS(instance);

    return instance.importXML(diagram).then(function(result) {
      return { error: null, warnings: result.warnings };
    }).catch(function(err) {
      return { error: err, warnings: err.warnings };
    });
  };
}


/**
 * Bootstrap the Modeler given the specified options and a number of locals (i.e. services)
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapModeler('some-xml', function() {
 *     mockEvents = new Events();
 *
 *     return {
 *       events: mockEvents
 *     };
 *   }));
 *
 * });
 *
 * @param  {string} xml document to display
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
export function bootstrapModeler(diagram, options, locals) {
  return bootstrapBpmnJS(Modeler, diagram, options, locals);
}

/**
 * Bootstrap the Viewer given the specified options and a number of locals (i.e. services)
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapViewer('some-xml', function() {
 *     mockEvents = new Events();
 *
 *     return {
 *       events: mockEvents
 *     };
 *   }));
 *
 * });
 *
 * @param  {string} xml document to display
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
export function bootstrapViewer(diagram, options, locals) {
  return bootstrapBpmnJS(Viewer, diagram, options, locals);
}


/**
 * Injects services of an instantiated diagram into the argument.
 *
 * Use it in conjunction with {@link #bootstrapModeler} or {@link #bootstrapViewer}.
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapViewer(...));
 *
 *   it('should provide mocked events', inject(function(events) {
 *     expect(events).to.eql(mockEvents);
 *   }));
 *
 * });
 *
 * @param  {Function} fn the function to inject to
 * @return {Function} a function that can be passed to it to carry out the injection
 */
export function inject(fn) {
  return function() {

    if (!BPMN_JS) {
      throw new Error(
        'no bootstraped bpmn-js instance, ' +
        'ensure you created it via #boostrap(Modeler|Viewer)'
      );
    }

    BPMN_JS.invoke(fn);
  };
}


/**
 * Returns the current active BpmnJS instance.
 *
 * @return {BpmnJS}
 */
export function getBpmnJS() {
  return BPMN_JS;
}

export function clearBpmnJS() {

  // clean up old bpmn-js instance
  if (BPMN_JS) {
    BPMN_JS.destroy();

    BPMN_JS = null;
  }
}

// This method always resolves.
// It helps us to do done(err) within the same block.
export function createViewer(container, viewerInstance, xml, diagramId) {

  clearBpmnJS();

  var viewer = new viewerInstance({ container: container });

  setBpmnJS(viewer);

  return viewer.importXML(xml, diagramId).then(function(result) {
    return { warnings: result.warnings, viewer: viewer };
  }).catch(function(err) {
    return { error: err, viewer: viewer, warnings: err.warnings };
  });
}

export function setBpmnJS(instance) {
  BPMN_JS = instance;
}

export function insertCSS(name, css) {
  if (document.querySelector('[data-css-file="' + name + '"]')) {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
  style.setAttribute('data-css-file', name);

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}