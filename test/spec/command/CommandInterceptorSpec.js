'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */

var inherits = require('inherits');

var cmdModule = require('../../../lib/command');

var CommandInterceptor = require('../../../lib/command/CommandInterceptor');


// example commands

function TracableCommand() {
  this.execute = function(ctx) { };
  this.revert = function(ctx) { };
}

function SimpleCommand() {
  TracableCommand.call(this);
}

function ComplexCommand(commandStack) {
  TracableCommand.call(this);

  this.preExecute = function(ctx) {
    commandStack.execute('pre-command', { element: ctx.element });
  };

  this.postExecute = function(ctx) {
    commandStack.execute('post-command', { element: ctx.element });
  };
}

function PreCommand() {
  TracableCommand.call(this);
}

function PostCommand() {
  TracableCommand.call(this);
}


/**
 * A command interceptor used for testing
 */
function TestInterceptor(eventBus) {
  CommandInterceptor.call(this, eventBus);
}

TestInterceptor.$inject = [ 'eventBus' ];

inherits(TestInterceptor, CommandInterceptor);


describe('command/CommandInterceptor', function() {

  beforeEach(bootstrapDiagram({ modules: [ cmdModule ] }));


  var element, context;

  beforeEach(inject(function(commandStack) {

    element = { trace: [] };

    context = {
      element: element
    };

    commandStack.registerHandler('simple-command', SimpleCommand);
    commandStack.registerHandler('complex-command', ComplexCommand);
    commandStack.registerHandler('pre-command', PreCommand);
    commandStack.registerHandler('post-command', PostCommand);
  }));

  function traceCommand(e) {
    expect(e).to.exist;

    e.context.element.trace.push(e.command);
  }

  function traceUnwrappedCommand(context, command, event) {
    expect(context).to.exist;
    expect(command).to.exist;
    expect(event).to.exist;

    context.element.trace.push(command);
  }


  describe('should hook into commands', function() {

    describe('#preExecute', function() {

      it('should register global', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute(traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command',
          'pre-command'
        ]);
      }));


      it('should register global / unwrap', inject(function(commandStack, eventBus) {
        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute(traceUnwrappedCommand, true);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command',
          'pre-command'
        ]);

      }));


      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));


      it('should register scoped / unwrap', inject(function(commandStack, eventBus) {
        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute('simple-command', traceUnwrappedCommand, true);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);

      }));

    });


    describe('#preExecuted', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecuted('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#postExecute', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.postExecute('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#postExecuted', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.postExecuted('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#canExecute', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.canExecute('simple-command', traceCommand);

        // when
        commandStack.canExecute('simple-command', context);
        commandStack.canExecute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#execute', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.execute('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#executed', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.executed('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#revert', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.executed('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);

        commandStack.undo();
        commandStack.undo();

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#reverted', function() {

      it('should register scoped', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.executed('simple-command', traceCommand);

        // when
        commandStack.execute('simple-command', context);
        commandStack.execute('pre-command', context);
        commandStack.undo();
        commandStack.undo();

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });


    describe('#on', function() {

      it('should register global preExecute', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.on('preExecute', traceCommand);

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));


      it('should register global preExecute / unwrap', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.on('preExecute', traceUnwrappedCommand, true);

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command'
        ]);
      }));

    });

  });


  describe('priorities', function() {

    function trace(suffix) {
      return function(e) {
        e.context.element.trace.push(e.command + '-' + suffix);
      };
    }


    describe('via #preExecute', function() {

      it('should register globally', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute(500, trace('low'));
        interceptor.preExecute(trace('default'));
        interceptor.preExecute(1600, trace('high'));

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command-high',
          'simple-command-default',
          'simple-command-low'
        ]);
      }));


      it('should register locally', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.preExecute('simple-command', 500, trace('low'));
        interceptor.preExecute('simple-command', trace('default'));
        interceptor.preExecute('simple-command', 1600, trace('high'));

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command-high',
          'simple-command-default',
          'simple-command-low'
        ]);
      }));

    });


    describe('via #on', function() {

      it('should register', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.on('preExecute', 500, trace('global-low'));
        interceptor.on([ 'simple-command.preExecute' ], trace('local-default'));
        interceptor.on('simple-command', 'preExecute', 1600, trace('local-high'));

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          'simple-command-local-high',
          'simple-command-local-default',
          'simple-command-global-low'
        ]);
      }));

    });


    describe('mixed', function() {

      it('should register mixed', inject(function(commandStack, eventBus) {

        var interceptor = new TestInterceptor(eventBus);

        interceptor.on([ 'simple-command.preExecute', 'preExecute'], 500, trace('raw-multiple-low'));

        interceptor.preExecute([ 'simple-command' ], 500, trace('local-multiple-low'));
        interceptor.preExecute(500, trace('global-low'));
        interceptor.preExecute('simple-command', trace('default'));
        interceptor.preExecute(1500, trace('global-high'));
        interceptor.preExecute('simple-command', 1600, trace('local-high'));

        // when
        commandStack.execute('simple-command', context);

        // then
        expect(element.trace).to.eql([
          // local listeners are invoked first
          'simple-command-local-high',
          'simple-command-default',
          'simple-command-raw-multiple-low',
          'simple-command-local-multiple-low',

          // global listeners are invoked after local ones
          'simple-command-global-high',
          'simple-command-raw-multiple-low',
          'simple-command-global-low'
        ]);
      }));

    });

  });


  describe('context', function () {

    function Dog() {
      this.barks = [];
    }

    Dog.prototype.bark = function () {
      this.barks.push('WOOF WOOF');
    };

    beforeEach(inject(function(commandStack) {
      commandStack.registerHandler('bark', ComplexCommand);
    }));

    it('should pass context -> WITHOUT unwrap', inject(function(commandStack, eventBus) {
      var interceptor = new TestInterceptor(eventBus);

      // given
      Dog.prototype.bindListener = function() {
        interceptor.execute('bark', function(event) {
          return this.bark();
        }, this);
      };

      var bobby = new Dog();

      bobby.bindListener();

      // when
      commandStack.execute('bark', context);

      // then
      expect(bobby.barks).to.have.length(1);
    }));


    it('should pass context -> WITH unwrap', inject(function(commandStack, eventBus) {
      var interceptor = new TestInterceptor(eventBus);

      // given
      Dog.prototype.bindListener = function() {
        interceptor.execute('bark', function(event) {
          return this.bark();
        }, true, this);
      };

      var bobby = new Dog();

      bobby.bindListener();

      // when
      commandStack.execute('bark', context);

      // then
      expect(bobby.barks).to.have.length(1);
    }));


    it('should pass context -> WITH everything', inject(function(commandStack, eventBus) {
      var interceptor = new TestInterceptor(eventBus);

      // given
      Dog.prototype.bindListener = function() {
        interceptor.execute('bark', 1000, function(event) {
          return this.bark();
        }, false, this);
      };

      var bobby = new Dog();

      bobby.bindListener();

      // when
      commandStack.execute('bark', context);

      // then
      expect(bobby.barks).to.have.length(1);
    }));

  });

});
