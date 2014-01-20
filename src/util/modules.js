var _ = require('./underscore');


/**
 * @function parseDefinition
 *
 * Parses a definition from an appropriate representation (Array || Function).
 * 
 * @param {Array||Function} the service definition
 *
 * @return {Object} the definition object, containing `dependencies` (Array<String>) and the `factory` function for instantiation)
 */
function parseDefinition(fn) {
  
  var constructor, factory;

  if (_.isArray(fn)) {

    dependencies = fn;
    factory = dependencies.pop();
  } else {
    if (fn.$inject) {
      dependencies = fn.$inject;
    } else {
      dependencies = [];
    }
    factory = fn;
  }

  return {
    factory: factory,
    dependencies: dependencies
  };
}

function chainToString(chain, current) {
  if (!chain || !chain.length) {
    return '<' + current + '>';
  } else {
    return '<' + chain.join('> -> <') + '> -> <' + current + '>';
  }
}

/**
 * @class Injector
 *
 * A injector that allows it to resolve
 * known modules.
 */
function Injector(moduleMap) {

  var instanceMap = {};

  /**
   * @method Injector.resolve
   *
   * Resolve a given name using a number of locals
   *
   * @param {String} name the name of the service
   * @param {Object} locals to be injected into the service in case it gets created
   * @param {Array<String>} chain 
   */
  function resolve(name, locals, chain) {

    // check if dependency is currently loading
    // if so, we detected a circluar dependendency
    // (and indicate that by throwing an error)
    if (chain && chain.indexOf(name) !== -1) {
      throw new Error('[modules] circular dependency ' + chainToString(chain, name));
    }

    var instance = instanceMap[name];
    
    if (!instance) {
      var module = moduleMap[name];

      if (!module) {
        throw new Error('[modules] unknown module ' + chainToString(chain, name));
      }

      instance = inject(module, locals, (chain || []).concat([ name ]));
      instanceMap[name] = instance;
    }

    return instance;
  }

  /**
   * @method Injector.inject
   *
   * Inject locals and known services into a function, bringing it to live.
   * 
   * @param {Array||Function} fn constructor to be instantiated.
   * @param {Object} locals locals to employ during injection
   * @param {Array} chain
   */
  function inject(fn, locals, chain) {
    var definition = parseDefinition(fn),
        args = [];
    
    var i, d, value;
    
    for (i = 0, d; !!(d = definition.dependencies[i]); i++) {
      
      // get value from locals
      value = locals ? locals[d] : undefined;
      
      if (!value) {
        value = resolve(d, locals, chain);
      }

      args.push(value);
    }

    return definition.factory.apply(definition.factory, args);
  }

  return {
    inject: inject,
    resolve: resolve
  };
}


/**
 * @class Registry
 * 
 * A registry that can be used to register modules by name.
 */
function Registry() {
  
  var moduleMap = {};

  /**
   * @method Registry.register
   *
   * Registers a new module.
   *
   * @param {String} name
   * @param {Function|Array} constructor
   */
  function register(name, definition) {
    
    if (moduleMap[name]) {
      throw new Error('[mod] module with name <' + name + '> already registered');
    }

    moduleMap[name] = definition;
  }

  /**
   * Creates an injector based on all modules known to this registry.
   *
   * @return {Injector} an injector that can be used to resolve known modules.
   */
  function createInjector() {
    return new Injector(moduleMap);
  }

  return {
    register: register,
    createInjector: createInjector
  };
}

module.exports.Registry = Registry;
module.exports.Injector = Injector;
