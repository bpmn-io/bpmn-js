'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


var cmdModule = require('../../../lib/command');


// example commands

function TracableCommand(id) {

  this.execute = function(ctx) {
    ctx.element.trace.push(id);
  };

  this.revert = function(ctx) {
    expect(ctx.element.trace.pop()).toBe(id);
  };
}


var ComplexCommand = function(commandStack) {

  TracableCommand.call(this, 'complex-command');

  this.preExecute = function(ctx) {
    commandStack.execute('pre-command', { element: ctx.element });
  };

  this.postExecute = function(ctx) {
    commandStack.execute('post-command', { element: ctx.element });
  };
};

var PreCommand = function() {
  TracableCommand.call(this, 'pre-command');
};

var PostCommand = function() {
  TracableCommand.call(this, 'post-command');
};

var SimpleCommand = function() {
  TracableCommand.call(this, 'simple-command');
};


describe('command/CommandStack', function() {

  beforeEach(bootstrapDiagram({ modules: [ cmdModule ] }));


  describe('#register', function() {

    var handler = {
      execute: function(ctx) {
        ctx.heho = 'HE';
      },

      revert: function(ctx) {
        ctx.heho = 'HO';
      }
    };


    it('should register handler instance', inject(function(commandStack) {

      // when
      commandStack.register('heho', handler);

      // then
      expect(commandStack._getHandler('heho')).toBe(handler);
    }));

  });


  describe('#registerHandler', function() {

    var Handler = function(eventBus) {

      this.execute = function(ctx) {
        expect(eventBus).toBeDefined();
        ctx.heho = 'HE';
      };

      this.revert = function(ctx) {
        ctx.heho = 'HO';
        expect(eventBus).toBeDefined();
      };
    };


    it('should register handler class', inject(function(commandStack) {

      // when
      commandStack.registerHandler('heho', Handler);

      // then
      expect(commandStack._getHandler('heho') instanceof Handler).toBe(true);
    }));


    it('should inject handler instance', inject(function(commandStack) {

      // given
      commandStack.registerHandler('heho', Handler);

      var context = {};

      // when
      commandStack.execute('heho', context);

      // then
      expect(context.heho).toBe('HE');
    }));

  });


  describe('#execute', function() {

    it('should throw error on no command', inject(function(commandStack) {

      expect(function() {
        commandStack.execute();
      }).toThrow();

    }));


    it('should throw error on no handler', inject(function(commandStack) {

      expect(function() {
        commandStack.execute('non-existing-command');
      }).toThrow();

    }));


    it('should execute command', inject(function(commandStack) {

      // given
      commandStack.registerHandler('simple-command', SimpleCommand);

      var context = { element: { trace: [] } };

      // when
      commandStack.execute('simple-command', context);

      // then
      expect(context.element.trace).toEqual([ 'simple-command' ]);
      expect(commandStack._stack.length).toBe(1);
      expect(commandStack._stackIdx).toBe(0);
    }));

  });


  describe('#undo', function() {

    it('should not fail if nothing to undo', inject(function(commandStack) {

      expect(function() {
        commandStack.undo();
      }).not.toThrow();

    }));


    it('should undo command', inject(function(commandStack) {

      // given
      commandStack.registerHandler('simple-command', SimpleCommand);

      var context = { element: { trace: [] } };

      commandStack.execute('simple-command', context);

      // when
      commandStack.undo();

      // then
      expect(context.element.trace).toEqual([]);
      expect(commandStack._stack.length).toBe(1);
      expect(commandStack._stackIdx).toBe(-1);
    }));

  });


  describe('#redo', function() {

    it('should not fail if nothing to redo', inject(function(commandStack) {

      expect(function() {
        commandStack.redo();
      }).not.toThrow();

    }));


    it('should redo command', inject(function(commandStack) {

      // given
      commandStack.registerHandler('simple-command', SimpleCommand);

      var context = { element: { trace: [] } };

      commandStack.execute('simple-command', context);
      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(context.element.trace).toEqual([ 'simple-command' ]);
      expect(commandStack._stack.length).toBe(1);
      expect(commandStack._stackIdx).toBe(0);
    }));

  });


  describe('command context', function() {

    it('should pass command context to handler', inject(function(commandStack) {

      // given
      var context = {};

      commandStack.register('command', {

        execute: function(ctx) {
          expect(ctx).toBe(context);
        },

        revert: function(ctx) {
          expect(ctx).toBe(context);
        }
      });

      // then
      // expect not to fail
      commandStack.execute('command', context);
      commandStack.undo();
      commandStack.redo('command', context);
    }));

  });


  describe('#preExecute / #postExecute support', function() {

    var element, context;

    beforeEach(inject(function(commandStack) {

      element = { trace: [] };

      context = {
        element: element
      };

      commandStack.registerHandler('complex-command', ComplexCommand);
      commandStack.registerHandler('pre-command', PreCommand);
      commandStack.registerHandler('post-command', PostCommand);
    }));


    it('should invoke #preExecute and #postExecute in order', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);

      // then
      expect(element.trace).toEqual([
        'pre-command',
        'complex-command',
        'post-command'
      ]);
    }));


    it('should group {pre,actual,post} commands on commandStack', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);

      var stack = commandStack._stack,
          stackIdx = commandStack._stackIdx;

      // then
      expect(stack.length).toBe(3);
      expect(stackIdx).toBe(2);

      // expect same id(s)
      expect(stack[0].id).toEqual(stack[1].id);
      expect(stack[2].id).toEqual(stack[1].id);
    }));


    it('should undo {pre,actual,post} commands', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);
      commandStack.undo();

      var stack = commandStack._stack,
          stackIdx = commandStack._stackIdx;

      // then
      expect(stack.length).toBe(3);
      expect(stackIdx).toBe(-1);

      expect(element.trace).toEqual([]);
    }));


    it('should redo pre/post commands', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);
      commandStack.undo();
      commandStack.redo();

      var stack = commandStack._stack,
          stackIdx = commandStack._stackIdx;

      // then
      expect(stack.length).toBe(3);
      expect(stackIdx).toBe(2);

      expect(element.trace).toEqual([
        'pre-command',
        'complex-command',
        'post-command'
      ]);
    }));


    describe('event integration', function() {

      it('should emit #preExecute and #postExecute events', inject(function(commandStack, eventBus) {

        // given
        var events = [];

        function logEvent(e) {
          events.push(e.type + ' ' + e.command);
        }

        eventBus.on([
          'commandStack.preExecute',
          'commandStack.execute',
          'commandStack.postExecute'
        ], logEvent);

        // when
        commandStack.execute('complex-command', context);

        // then
        expect(events).toEqual([
          'commandStack.preExecute complex-command',
          'commandStack.preExecute pre-command',
          'commandStack.execute pre-command',
          'commandStack.postExecute pre-command',
          'commandStack.execute complex-command',
          'commandStack.postExecute complex-command',
          'commandStack.preExecute post-command',
          'commandStack.execute post-command',
          'commandStack.postExecute post-command'
        ]);
      }));


      it('should emit execute* events', inject(function(commandStack, eventBus) {

        // given
        var events = [];

        function logEvent(e) {
          events.push((e && e.command) || 'changed');
        }

        eventBus.on([ 'commandStack.execute', 'commandStack.changed' ], logEvent);

        // when
        commandStack.execute('complex-command', context);

        // then
        expect(events).toEqual([
          'pre-command',
          'complex-command',
          'post-command',
          'changed'
        ]);
      }));


      it('should emit revert* events', inject(function(commandStack, eventBus) {

        // given
        var events = [];

        function logEvent(e) {
          events.push((e && e.command) || 'changed');
        }

        commandStack.execute('complex-command', context);

        eventBus.on([ 'commandStack.revert', 'commandStack.changed' ], logEvent);

        // when
        commandStack.undo();

        // then
        expect(events).toEqual([
          'post-command',
          'complex-command',
          'pre-command',
          'changed'
        ]);
      }));

    });

  });


  describe('dirty handling', function() {

    var OuterHandler = function(commandStack) {

      this.execute = function(context) {
        return context.s1;
      };

      this.revert = function(context) {
        return context.s1;
      };

      this.postExecute = function(context)  {
        commandStack.execute('inner-command', context);
      };
    };


    var InnerHandler = function() {

      this.execute = function(context) {
        return [ context.s1, context.s2 ];
      };

      this.revert = function(context) {
        return [ context.s1, context.s2 ];
      };
    };


    it('should update dirty shapes after change', inject(function(commandStack, eventBus) {

      // given
      commandStack.registerHandler('outer-command', OuterHandler);
      commandStack.registerHandler('inner-command', InnerHandler);

      var s1 = {}, s2 = {}, context = { s1: s1, s2: s2 };

      var events = [];

      function logEvent(e) {
        events.push(e.element);
      }

      eventBus.on('element.changed', logEvent);

      // when
      commandStack.execute('outer-command', context);

      // then
      expect(events).toEqual([ s1, s2 ]);
    }));

  });

});