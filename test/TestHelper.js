'use strict';

var _ = require('lodash');
var BpmnJS = require('../');

// enhance jasmine with test container API
require('jasmine-test-container-support').extend(jasmine);


var OPTIONS, BPMN_JS;

function options(opts) {
  if (_.isFunction(opts)) {
    opts = opts();
  }

  OPTIONS = opts;
}

/**
 * Bootstrap BpmnJS given the specified options and a number of locals (i.e. services)
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapBpmnJS(function() {
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
function bootstrapBpmnJS(diagram, options, locals) {

  return function(done) {

    var testContainer = jasmine.getEnv().getTestContainer();

    var _diagram = diagram,
        _options = options,
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

    if (_options.modules.length == 0) {
      _options.modules = undefined;
    }

    BPMN_JS = new BpmnJS(_options);

    // import diagram
    BPMN_JS.importXML(_diagram, done);
  };
}

/**
 * Injects services of an instantiated diagram into the argument.
 *
 * Use it in conjunction with {@link #bootstrapBpmnJS}.
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapBpmnJS(...));
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
      throw new Error('no bootstraped bpmn-js instance, ensure you created it via #bootstrapBpmnJS');
    }

    BPMN_JS.invoke(fn);
  };
}


module.exports.bootstrapBpmnJS = (window || global).bootstrapBpmnJS = bootstrapBpmnJS;
module.exports.inject = (window || global).inject = inject;