'use strict';

var di = require('didi');

/**
 * @namespace djs
 */

/**
 * Bootstrap an injector from a list of modules, instantiating a number of default components
 *
 * @param {Array<didi.Module>} bootstrapModules
 * @param {Object} config
 *
 * @return {didi.Injector} a injector to use to access the components
 */
function bootstrap(bootstrapModules) {

  var modules = [];
  var components = [];

  function hasModule(m) {
    return modules.indexOf(m) >= 0;
  }

  function addModule(m) {
    modules.push(m);
  }

  function visit(m) {
    if (hasModule(m)) {
      return;
    }

    (m.__depends__ || []).forEach(visit);

    if (hasModule(m)) {
      return;
    }

    addModule(m);

    (m.__init__ || []).forEach(function(c) {
      components.push(c);
    });
  }

  bootstrapModules.forEach(visit);

  var injector = new di.Injector(modules);

  components.forEach(function(c) {
    // eagerly resolve main components
    injector.get(c);
  });

  return injector;
}

/**
 * Creates an injector from passed options.
 *
 * @param  {Object} options
 * @return {didi.Injector}
 */
function createInjector(options) {

  options = options || {};

  var configModule = {
    'config': ['value', options]
  };

  var coreModule = require('./core');

  var modules = [ configModule, coreModule ].concat(options.modules || []);

  return bootstrap(modules);
}


/**
 * @class
 *
 * The main diagram-js entry point that bootstraps the diagram with the given
 * configuration.
 *
 * @param {Object} options
 * @param {String[]} options.components a list of components to instantiate when creating the diagram
 * @param {String[]} options.modules a list of modules to use for locating instantiatable diagram components
 */
function Diagram(options, injector) {

  // create injector unless explicitly specified
  this.injector = injector = injector || createInjector(options);

  // API

  /**
   * Resolves a diagram service
   *
   * @method Diagram#get
   *
   * @param {String} name the name of the diagram service to be retrieved
   * @param {Object} [locals] a number of locals to use to resolve certain dependencies
   */
  this.get = injector.get;

  /**
   * Executes a function into which diagram services are injected
   *
   * @method Diagram#invoke
   *
   * @param {Function|Object[]} fn the function to resolve
   * @param {Object} locals a number of locals to use to resolve certain dependencies
   */
  this.invoke = injector.invoke;

  // init

  // indicate via event


  /**
   * An event indicating that all plug-ins are loaded.
   *
   * Use this event to fire other events to interested plug-ins
   *
   * @memberOf Diagram
   *
   * @event diagram.init
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
  this.get('eventBus').fire('diagram.init');
}

module.exports = Diagram;


/**
 * Destroys the diagram
 *
 * @method  Diagram#destroy
 */
Diagram.prototype.destroy = function() {
  this.get('eventBus').fire('diagram.destroy');
};


/**
 * Registers an extension with the diagram.
 *
 * @method Diagram.plugin
 * @example
 *
 * var Diagram = require('Diagram');
 *
 * Diagram.plugin('mySamplePlugin', [ 'eventBus', function(events) {
 *   events.on('shape.added', function(event) {
 *     console.log('shape ', event.shape, ' was added to the diagram');
 *   });
 * }]);
 *
 * var diagram = new Diagram({ components: ['mySamplePlugin'] });
 *
 * diagram.invoke([ 'canvas', function(canvas) {
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