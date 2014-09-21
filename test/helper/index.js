'use strict';

var _ = require('lodash');
var Diagram = require('../../lib/Diagram');

try {
  // enhance jasmine with test container API
  require('jasmine-test-container-support').extend(jasmine);
} catch (e) {
  // no test container :-(
}

var OPTIONS, DIAGRAM;

function options(opts) {
  if (_.isFunction(opts)) {
    opts = opts();
  }

  OPTIONS = opts;
}

/**
 * Bootstrap the diagram given the specified options and a number of locals (i.e. services)
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapDiagram(function() {
 *     mockEvents = new Events();
 *
 *     return {
 *       events: mockEvents
 *     };
 *   }));
 *
 * });
 *
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
function bootstrapDiagram(options, locals) {

  return function() {

    var testContainer;

    try {
      testContainer = jasmine.getEnv().getTestContainer();
    } catch (e) {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
    }

    var _options = options,
        _locals = locals;

    if (!_locals && _.isFunction(_options)) {
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

    var mockModule = {};

    _.forEach(_locals, function(v, k) {
      mockModule[k] = ['value', v];
    });

    _options.modules = _.unique([].concat(_options.modules || [], [ mockModule ]));

    DIAGRAM = new Diagram(_options);
  };
}

/**
 * Injects services of an instantiated diagram into the argument.
 *
 * Use it in conjunction with {@link #bootstrapDiagram}.
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapDiagram(...));
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

    if (!DIAGRAM) {
      throw new Error('no bootstraped diagram, ensure you created it via #bootstrapDiagram');
    }

    DIAGRAM.invoke(fn);
  };
}


module.exports.bootstrapDiagram = (window || global).bootstrapDiagram = bootstrapDiagram;
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