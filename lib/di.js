var di = require('didi');

var Module = di.Module,
    Injector = di.Injector;

/**
 * Bootstrap an injector from a list of modules, instantiating a number of default components
 *
 * @param {Array<didi.Module>} modules
 * @param {Array<String>} components
 * @param {Object} config
 * 
 * @return {didi.Injector} a injector to use to access the components
 */
function bootstrap(modules, components, config) {

  var configModule = {
    'config': ['value', config]
  };

  modules.unshift(configModule);

  var injector = new Injector(modules);

  components.forEach(function(c) {

    // eagerly resolve main components
    injector.get(c);
  });

  return injector;
}

// publish the default module for diagram-js
module.exports = {
  defaultModule: new Module(),
  bootstrap: bootstrap
};