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
 * TestHelper.insertCSS('diagram.css', fs.readFileSync('some-css.css', 'utf-8'));
 * ```
 */

var _ = require('lodash');

var Modeler = require('../../lib/Modeler'),
    Viewer = require('../../lib/Viewer');

try {
  // enhance jasmine with test container API
  require('jasmine-test-container-support').extend(jasmine);
} catch (e) {
  // no test container :-(
}

var OPTIONS, BPMN_JS;

function options(opts) {
  if (_.isFunction(opts)) {
    opts = opts();
  }

  OPTIONS = opts;
}


function bootstrapBpmnJS(BpmnJS, options, locals) {

  var testContainer;

  try {
    testContainer = jasmine.getEnv().getTestContainer();
  } catch (e) {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  }

  var _options = options,
      _locals = locals;

  if (_locals === undefined && _.isFunction(_options)) {
    _locals = _options;
    _options = null;
  }

  if (_.isFunction(_options)) {
    _options = _options();
  }

  if (_.isFunction(_locals)) {
    _locals = _locals();
  }

  _options = _.extend({ container: testContainer }, OPTIONS || {}, _options || {});

  if (_locals) {
    var mockModule = {};

    _.forEach(_locals, function(v, k) {
      mockModule[k] = ['value', v];
    });

    _options.modules = [].concat(_options.modules || [], [ mockModule ]);
  }

  _options.modules = _.unique(_options.modules);

  if (!_options.modules.length) {
    _options.modules = undefined;
  }

  BPMN_JS = new BpmnJS(_options);

  return BPMN_JS;
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

  return function(done) {
    // bootstrap
    var modeler = bootstrapBpmnJS(Modeler, options, locals);

    // import diagram
    modeler.importXML(diagram, done);
  };
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

  return function(done) {
    // bootstrap
    var viewer = bootstrapBpmnJS(Viewer, options, locals);

    // import diagram
    viewer.importXML(diagram, done);
  };
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
 *     expect(events).toBe(mockEvents);
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


module.exports.bootstrapModeler = (window || global).bootstrapModeler = bootstrapModeler;
module.exports.bootstrapViewer = (window || global).bootstrapViewer = bootstrapViewer;
module.exports.inject = (window || global).inject = inject;


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