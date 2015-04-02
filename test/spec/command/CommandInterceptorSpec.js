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


  describe('should intercept command events', function() {

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
      expect(e).to.be.defined;

      e.context.element.trace.push(e.command);
    }

    function traceUnwrappedCommand(context, command, event) {
      expect(context).to.be.defined;
      expect(command).to.be.defined;
      expect(event).to.be.defined;

      context.element.trace.push(command);
    }


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

});
