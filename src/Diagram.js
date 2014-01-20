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
    injector = registry.createInjector();
    
    var locals = { config: options };

    for (var i = 0, m; !!(m = modules[i]); i++) {
      injector.resolve(m, locals);
    }
  }

  options = options || {};
  options.modules = (options.modules || []).concat([ 'canvas', 'events', 'svgFactory' ]);

  bootstrap(options.modules, options);

  return {
    resolve: injector.resolve,
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