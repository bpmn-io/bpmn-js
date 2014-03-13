var modules = require('./util/modules'),
    Canvas = require('./core/Canvas'),
    Events = require('./core/Events'),
    Shapes = require('./core/Shapes'),
    SvgFactory = require('./core/SvgFactory'),
    CommandStack = require('./core/CommandStack');

var _ = require('lodash');

// require snapsvg extensions
require('./snapsvg.ext');

var registry = new modules.Registry();


/**
 * @namespace djs
 */

/**
 * @class
 *
 * The main diagram.js entry point.
 *
 * @param {Object} options
 * @param {String[]} options.plugins a list of plugins to use when creating the diagram
 */
/**
 * Bootstrap the diagram with the given modules
 * configured through an options hash
 */

function Diagram(options) {
  'use strict';

  var injector;
  function bootstrap(modules, options) {

    var di = registry.createInjector();
    
    var locals = _.extend({}, { config: options }, options.locals || {});

    _.forEach(modules, function(m) {
      di.resolve(m, locals);
    });

    return di;
  }

  options = options || {};
  options.plugins = [ 'canvas', 'events', 'svgFactory' ].concat(options.plugins || []);

  injector = bootstrap(options.plugins, options);

  // fire diagram init because
  // all components have been loaded now

  /**
   * An event indicating that all plug-ins are loaded.
   *
   * Use this event to fire other events to interested plug-ins
   *
   * @memberOf Diagram
   *
   * @event canvas.init
   *
   * @example
   *
   * events.on('diagram.init', function() {
   *   events.fire('my-custom-event', { foo: 'BAR' });
   * });
   * 
   * @type {Object}
   * @property {snapsvg.Paper} paper the initialized drawing paper
   */
  injector.resolve('events').fire('diagram.init');

  return {

    /**
     * Resolves a diagram service
     *
     * @method Diagram#resolve
     *
     * @param {Function|Object[]} function that should be called with internal diag<asdf></asdf>ram services on
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    resolve: injector.resolve,

    /**
     * Executes a function into which diagram services are injected
     * 
     * @method Diagram#inject
     *
     * @param {Function|Object[]} fn the function to resolve
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    inject: injector.inject
  };
}

// register default modules here as part of the core
// prevents circular dependency core_module -> diagram -> core_module
registry.register('canvas', Canvas);
registry.register('events', Events);
registry.register('svgFactory', SvgFactory);
registry.register('commandStack', CommandStack);
registry.register('shapes', Shapes);

module.exports = Diagram;

/**
 * Register a new plugin with the diagram.
 * 
 * @method Diagram.plugin
 *
 * @example
 *
 * var Diagram = require('Diagram');
 *
 * Diagram.plugin('mySamplePlugin', [ 'events', function(events) {
 *   events.on('shape.added', function(event) {
 *     console.log('shape ', event.shape, ' was added to the diagram');
 *   });
 * }]);
 *
 * var diagram = new Diagram({ plugins: 'mySamplePlugin' });
 *
 * diagram.resolve([ 'canvas', function(canvas) {
 *   
 *   // add shape to drawing canvas
 *   canvas.addShape({ x: 10, y: 10 });
 * });
 *
 * // 'shape ... was added to the diagram' logged to console
 * 
 * @param {String} pluginId a unique identifier to reference this plugin from other components
 * @param {Object[]|Function} definition the plugin definition
 *
 * @see Diagram
 */
module.exports.plugin = registry.register;