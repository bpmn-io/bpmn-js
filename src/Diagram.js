var di = require('./di');

// diagram-js main components
require('./core/Canvas');
require('./core/EventBus');


/**
 * @namespace djs
 */

var defaultModule = di.defaultModule;

function createInjector(options) {

  options = options || {};

  var components = [ 'canvas', 'eventBus' ].concat(options.components || []),
      modules = [].concat(options.modules || []);

  if (modules.indexOf(defaultModule) === -1) {
    modules.unshift(defaultModule);
  }

  return di.bootstrap(modules, components, options);
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
  'use strict';

  // create injector unless explicitly specified
  injector = injector || createInjector(options);

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
  injector.get('eventBus').fire('diagram.init');

  return {

    /**
     * Resolves a diagram service
     *
     * @method Diagram#get
     *
     * @param {Function|Object[]} function that should be called with internal diagram services on
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    get: injector.get,

    /**
     * Executes a function into which diagram services are injected
     * 
     * @method Diagram#invoke
     *
     * @param {Function|Object[]} fn the function to resolve
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    invoke: injector.invoke
  };
}

module.exports = Diagram;

/**
 * The main diagram module that can be used
 * to register an extension on the diagram.
 * 
 * @field Diagram.components
 * @type {didi.Module}
 */
module.exports.components = defaultModule;

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
module.exports.plugin = defaultModule.type;