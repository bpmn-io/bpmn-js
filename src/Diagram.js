var modules = require('./util/modules'),
    Canvas = require('./core/Canvas'),
    Events = require('./core/Events'),
    SvgFactory = require('./core/SvgFactory');

// require snapsvg extensions
require('./snapsvg.ext');

var registry = new modules.Registry();

/**
 * @class
 *
 * The main diagram.js entry point.
 * 
 * @param {Object} options
 * @param {String[]} options.plugins a list of plugins to use when creating the diagram
 */
function Diagram(options) {

  var injector;

  /**
   * Bootstrap the diagram with the given modules
   * configured through an options hash
   */
  function bootstrap(modules, options) {
    var di = registry.createInjector();
    
    var locals = { config: options };

    for (var i = 0, m; !!(m = modules[i]); i++) {
      di.resolve(m, locals);
    }

    return di;
  }

  options = options || {};
  options.plugins = (options.plugins || []).concat([ 'canvas', 'events', 'svgFactory' ]);

  injector = bootstrap(options.plugins, options);

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