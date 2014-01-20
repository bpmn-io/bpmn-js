var modules = require('./util/modules'),
    
    Canvas = require('./core/Canvas'),
    Events = require('./core/Events'),
    SvgFactory = require('./core/SvgFactory');

var registry = new modules.Registry();

/**
 * @class Diagram
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
  options.modules = (options.modules || []).concat([ 'canvas', 'events', 'svgFactory' ]);

  injector = bootstrap(options.modules, options);

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
module.exports.modules = registry;