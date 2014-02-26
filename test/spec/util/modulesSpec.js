var modules = require('../../../src/util/modules');

var Registry = modules.Registry;

describe('util/modules', function() {

  function createFunctionSpy(fn) {
    return jasmine.createSpy('aFactory').and.callFake(fn);
  }

  function moduleError(msg) {
    return '[modules] ' + msg;
  }

  function buildRegistry() {

    var registry = new Registry();

    registry.aFactory = createFunctionSpy(function() {
      return 'a';
    });

    registry.bFactory = createFunctionSpy(function(a) {
      return 'b/' + a;
    });

    registry.cFactory = createFunctionSpy(function(a) {
      return 'c/' + a;
    });

    registry.dFactory = createFunctionSpy(function(a, b) {
      return 'd/' + a + '/' + b;
    });

    registry.register('a', registry.aFactory);
    registry.register('b', [ 'a', registry.bFactory ]);
    registry.register('c', [ 'a', registry.cFactory ]);
    registry.register('d', [ 'a', 'b', registry.dFactory ]);

    return registry;
  }

  describe('injector', function() {

    //// resolve services /////////////////////////////

    describe('resolve, should handle', function() {

      it('fn syntax', function() {

        // given
        var registry = new Registry();

        registry.register('a', function() {
          return 'a';
        });

        var injector = registry.createInjector();

        // when
        var a = injector.resolve('a');

        // then
        expect(a).toEqual('a');
      });

      it('array syntax', function() {

        // given
        var registry = new Registry();

        registry.register('a', [ function() {
          return 'a';
        }]);

        var injector = registry.createInjector();
        
        // when
        var a = injector.resolve('a');

        // then
        expect(a).toEqual('a');
      });

      it('fn / $inject syntax', function() {

        // given
        var registry = new Registry();

        // a
        registry.register('a', function() {
          return 'a';
        });

        // b <- a
        var B = function(a) {
          return 'b/' + a;
        };
        B.$inject = [ 'a' ];

        registry.register('b', B);

        var injector = registry.createInjector();
        
        // when
        var b = injector.resolve('b');

        // then
        expect(b).toEqual('b/a');
      });

      it('dependency', function() {
        
        // given
        var registry = buildRegistry();
        var injector = registry.createInjector();

        // when
        var b = injector.resolve('b');

        // then
        expect(b).toBeDefined();
        expect(b).toEqual('b/a');
      });

      it('multiple dependencies', function() {
        
        // given
        var registry = buildRegistry();
        var injector = registry.createInjector();

        // when
        var d = injector.resolve('d');

        // then
        expect(d).toBeDefined();
        expect(d).toEqual('d/a/b/a');
      });

      it('locals', function() {

        // given
        var registry = new Registry();

        registry.register('a', [ 'b', function(b) {
          return b;
        }]);

        var injector = registry.createInjector();
        
        // when
        var a = injector.resolve('a', { b: 'b' });

        // then
        expect(a).toEqual('b');
      });
    });


    //// cache instances /////////////////////////////

    it('should cache instances', function() {

      // given
      var registry = buildRegistry();
      var injector = registry.createInjector();

      var a = injector.resolve('a');

      // reset spy
      registry.aFactory.calls.reset();

      // when
      var anotherA = injector.resolve('a');

      // then
      expect(registry.aFactory).not.toHaveBeenCalled();
      expect(a).toBe(anotherA);
    });

    it('should create placeholder for anonymous modules', function() {

      // given
      var registry = new Registry();

      registry.register('a', function() {
        // do not return stuff
      });

      var injector = registry.createInjector();

      // when
      var a = injector.resolve('a');

      // then
      expect(a).toBeDefined();
    });

    describe('can resolve injector as standalone module', function() {
      'use strict';

      var registry = new Registry();
      var injector = registry.createInjector();
      var injectorInstance = injector.resolve('injector');

      expect(injectorInstance).toBeDefined();

    });

    //// error handling ////////////////////////////////

    describe('error handling, should', function() {

      it('fail resolving non-existing module', function() {

        // given
        var registry = new Registry();
        var injector = registry.createInjector();

        // then
        expect(function() {
          var module = injector.resolve('non-existing-module');
        }).toThrowError(moduleError('unknown module <non-existing-module>'));
      });

      it('fail resolving non-existing module - nested', function() {

        // given
        var registry = new Registry();
        
        registry.register('a', [ 'non-existing-module', function(b) {
          return 'a';
        }]);

        var injector = registry.createInjector();

        // then
        expect(function() {
          var module = injector.resolve('a');
        }).toThrowError(moduleError('unknown module <a> -> <non-existing-module>'));
      });

      it('fail on circular dependencies', function() {

        // given
        var registry = new Registry();

        registry.register('a', [ 'b', function(b) {
          return 'a';
        }]);

        registry.register('b', [ 'a', function(a) {
          return 'b';
        }]);

        var injector = registry.createInjector();

        // then
        expect(function() {
          var module = injector.resolve('a');
        }).toThrowError(moduleError('circular dependency <a> -> <b> -> <a>'));
      });
    });
  });
});