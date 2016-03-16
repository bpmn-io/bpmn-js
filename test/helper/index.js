'use strict';

/**
 * A helper file that may be used in test cases for bpmn-js and extensions.
 *
 * Publishes the globals
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
 * var TestHelper = module.exports = require('bpmn-js/test/helper');
 *
 * var fs = require('fs');
 *
 * // insert diagram.css
 * TestHelper.insertCSS('diagram.css', fs.readFileSync('some-css.css', 'utf8'));
 * ```
 */

var unique = require('lodash/array/unique'),
    isFunction = require('lodash/lang/isFunction'),
    merge = require('lodash/object/merge'),
    forEach = require('lodash/collection/forEach');

var TestContainer = require('mocha-test-container-support');

var Modeler = require('../../lib/Modeler'),
    Viewer = require('../../lib/Viewer');

var OPTIONS, BPMN_JS;

function bootstrapBpmnJS(BpmnJS, diagram, options, locals) {

  return function(done) {
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

    _options.modules = unique(_options.modules);

    if (!_options.modules.length) {
      _options.modules = undefined;
    }

    BPMN_JS = new BpmnJS(_options);

    BPMN_JS.importXML(diagram, done);
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
 * @param  {String} xml document to display
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
function bootstrapModeler(diagram, options, locals) {
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
 * @param  {String} xml document to display
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
function bootstrapViewer(diagram, options, locals) {
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
function inject(fn) {
  return function() {

    if (!BPMN_JS) {
      throw new Error('no bootstraped bpmn-js instance, ensure you created it via #boostrap(Modeler|Viewer)');
    }

    BPMN_JS.invoke(fn);
  };
}


module.exports.bootstrapBpmnJS = (window || global).bootstrapBpmnJS = bootstrapBpmnJS;
module.exports.bootstrapModeler = (window || global).bootstrapModeler = bootstrapModeler;
module.exports.bootstrapViewer = (window || global).bootstrapViewer = bootstrapViewer;
module.exports.inject = (window || global).inject = inject;


/**
 * Returns the current active BpmnJS instance.
 *
 * @return {BpmnJS}
 */
module.exports.getBpmnJS = function() {
  return BPMN_JS;
};


function insertCSS(name, css) {
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

module.exports.insertCSS = insertCSS;
