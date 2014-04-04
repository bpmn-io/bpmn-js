var _ = require('lodash');
var Diagram = require('../lib/Diagram');

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

    _options = _.extend({}, OPTIONS || {}, _options || {});

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
    DIAGRAM.invoke(fn);
  };
}


module.exports.bootstrapDiagram = bootstrapDiagram;
module.exports.inject = inject;