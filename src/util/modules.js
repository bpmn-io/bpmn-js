var _ = require('./underscore');


/**
 * Parses a definition from an appropriate representation.
 * 
 * @function
 * 
 * @param {Object[]|Function} the service definition
 *
 * @return {Object} the definition object, containing `dependencies` (`String[]`) and the `factory` (`Function`) for instantiation)
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
 * @class
 * 
 * A injector that allows it to resolve
 * known modules.
 */
function Injector(moduleMap) {

  var instanceMap = {};

  /**
   * Resolve a given name using a number of locals
   * 
   * @method Injector#resolve
   *
   * @param {String} name the name of the service
   * @param {Object} locals to be injected into the service in case it gets created
   * @param {String[]} chain
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
   * Inject locals and known services into a function, bringing it to live.
   * 
   * @method Injector#inject
   * 
   * @param {Object[]|Function} fn constructor to be instantiated.
   * @param {Object} locals locals to employ during injection
   * @param {String[]} chain
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
 * @class
 * 
 * A registry that can be used to register modules by name that can later
 * be instantiated using an {@link Injector}.
 */
function Registry() {
  
  var moduleMap = {};

  /**
   * Registers a new module.
   *
   * @method Registry#register
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
   * @method Registry#createInjector
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
