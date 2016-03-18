'use strict';

require('../../TestHelper');
/* global bootstrapDiagram, inject */


var cmdModule = require('../../../lib/command');

// example commands

function TracableCommand(id) {

  this.execute = function(ctx) {
    ctx.element.trace.push(id);
  };

  this.revert = function(ctx) {
    expect(ctx.element.trace.pop()).to.equal(id);
  };
}

function SimpleCommand() {
  TracableCommand.call(this, 'simple-command');
}

function ComplexCommand(commandStack) {

  TracableCommand.call(this, 'complex-command');

  this.preExecute = function(ctx) {
    commandStack.execute('pre-command', { element: ctx.element });
  };

  this.postExecute = function(ctx) {
    commandStack.execute('post-command', { element: ctx.element });
  };
}

function PreCommand() {
  TracableCommand.call(this, 'pre-command');
}

function PostCommand() {
  TracableCommand.call(this, 'post-command');
}


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
      expect(commandStack._getHandler('heho')).to.equal(handler);
    }));

  });


  describe('#registerHandler', function() {

    var Handler = function(eventBus) {

      this.execute = function(ctx) {
        expect(eventBus).to.be.an('object');
        ctx.heho = 'HE';
      };

      this.revert = function(ctx) {
        ctx.heho = 'HO';
        expect(eventBus).to.be.an('object');
      };
    };


    it('should register handler class', inject(function(commandStack) {

      // when
      commandStack.registerHandler('heho', Handler);

      // then
      expect(commandStack._getHandler('heho') instanceof Handler).to.eql(true);
    }));


    it('should inject handler instance', inject(function(commandStack) {

      // given
      commandStack.registerHandler('heho', Handler);

      var context = {};

      // when
      commandStack.execute('heho', context);

      // then
      expect(context.heho).to.equal('HE');
    }));

  });


  describe('#execute', function() {

    it('should throw error on no command', inject(function(commandStack) {

      expect(function() {
        commandStack.execute();
      }).to.throw();

    }));


    it('should throw error on no handler', inject(function(commandStack) {

      expect(function() {
        commandStack.execute('non-existing-command');
      }).to.throw();

    }));


    it('should execute command', inject(function(commandStack) {

      // given
      commandStack.registerHandler('simple-command', SimpleCommand);

      var context = { element: { trace: [] } };

      // when
      commandStack.execute('simple-command', context);

      // then
      expect(context.element.trace).to.eql([ 'simple-command' ]);
      expect(commandStack._stack.length).to.equal(1);
      expect(commandStack._stackIdx).to.equal(0);
    }));

  });


  describe('#canExecute', function() {

    it('should reject unhandled', inject(function(commandStack) {

      // when
      var canExecute = commandStack.canExecute('non-existing-command');

      // then
      expect(canExecute).to.be.false;
    }));


    describe('should forward to handler', function() {

      function testCanExecute(commandStack, accept) {

        // given
        commandStack.register('command', {
          canExecute: function(context) {
            return (context.canExecute = accept);
          }
        });

        var context = { };

        // when
        var canExecute = commandStack.canExecute('command', context);

        // then
        expect(canExecute).to.equal(accept);
        expect(context.canExecute).to.equal(accept);
      }


      it('accepting', inject(function(commandStack) {
        testCanExecute(commandStack, true);
      }));


      it('rejecting', inject(function(commandStack) {
        testCanExecute(commandStack, false);
      }));

    });


    describe('should integrate with eventBus', function() {

      it('rejecting in listener', inject(function(eventBus, commandStack) {

        // given
        eventBus.on('commandStack.command.canExecute', function(event) {
          return (event.context.listenerCanExecute = false);
        });

        commandStack.register('command', {
          canExecute: function(context) {
            return (context.commandCanExecute = true);
          }
        });

        var context = { };

        // when
        var canExecute = commandStack.canExecute('command', context);

        // then
        expect(canExecute).to.be.false;
        expect(context.listenerCanExecute).to.be.false;
        expect(context.commandCanExecute).to.not.be.defined;
      }));


      it('allowing in listener', inject(function(eventBus, commandStack) {

        // given
        eventBus.on('commandStack.command.canExecute', function(event) {
          return (event.context.listenerCanExecute = true);
        });

        commandStack.register('command', {
          canExecute: function(context) {
            return (context.commandCanExecute = false);
          }
        });

        var context = { };

        // when
        var canExecute = commandStack.canExecute('command', context);

        // then
        expect(canExecute).to.be.true;
        expect(context.listenerCanExecute).to.be.true;
        expect(context.commandCanExecute).to.not.be.defined;
      }));


      it('rejecting in command', inject(function(eventBus, commandStack) {

        // given
        eventBus.on('commandStack.command.canExecute', function(event) {
          // do nothing, just chill
        });

        commandStack.register('command', {
          canExecute: function(context) {
            return (context.commandCanExecute = false);
          }
        });

        var context = { };

        // when
        var canExecute = commandStack.canExecute('command', context);

        // then
        expect(canExecute).to.be.false;
        expect(context.commandCanExecute).to.be.false;
      }));

    });

  });


  describe('#undo', function() {

    it('should not fail if nothing to undo', inject(function(commandStack) {

      expect(function() {
        commandStack.undo();
      }).not.to.throw();

    }));


    it('should undo command', inject(function(commandStack) {

      // given
      commandStack.registerHandler('simple-command', SimpleCommand);

      var context = { element: { trace: [] } };

      commandStack.execute('simple-command', context);

      // when
      commandStack.undo();

      // then
      expect(context.element.trace).to.eql([]);
      expect(commandStack._stack.length).to.equal(1);
      expect(commandStack._stackIdx).to.equal(-1);
    }));

  });


  describe('#redo', function() {

    it('should not fail if nothing to redo', inject(function(commandStack) {

      expect(function() {
        commandStack.redo();
      }).not.to.throw();

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
      expect(context.element.trace).to.eql([ 'simple-command' ]);
      expect(commandStack._stack.length).to.equal(1);
      expect(commandStack._stackIdx).to.equal(0);
    }));

  });


  describe('command context', function() {

    it('should pass command context to handler', inject(function(commandStack) {

      // given
      var context = {};

      commandStack.register('command', {

        execute: function(ctx) {
          expect(ctx).to.equal(context);
        },

        revert: function(ctx) {
          expect(ctx).to.equal(context);
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
      expect(element.trace).to.eql([
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
      expect(stack.length).to.equal(3);
      expect(stackIdx).to.equal(2);

      // expect same id(s)
      expect(stack[0].id).to.equal(stack[1].id);
      expect(stack[2].id).to.equal(stack[1].id);
    }));


    it('should undo {pre,actual,post} commands', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);
      commandStack.undo();

      var stack = commandStack._stack,
          stackIdx = commandStack._stackIdx;

      // then
      expect(stack.length).to.equal(3);
      expect(stackIdx).to.equal(-1);

      expect(element.trace).eql([]);
    }));


    it('should redo pre/post commands', inject(function(commandStack) {

      // when
      commandStack.execute('complex-command', context);
      commandStack.undo();
      commandStack.redo();

      var stack = commandStack._stack,
          stackIdx = commandStack._stackIdx;

      // then
      expect(stack.length).to.equal(3);
      expect(stackIdx).to.equal(2);

      expect(element.trace).eql([
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
          'commandStack.preExecuted',
          'commandStack.execute',
          'commandStack.postExecute',
          'commandStack.postExecuted'
        ], logEvent);

        // when
        commandStack.execute('complex-command', context);

        // then
        expect(events).eql([
          'commandStack.preExecute complex-command',
          'commandStack.preExecute pre-command',
          'commandStack.preExecuted pre-command',
          'commandStack.execute pre-command',
          'commandStack.postExecute pre-command',
          'commandStack.postExecuted pre-command',
          'commandStack.preExecuted complex-command',
          'commandStack.execute complex-command',
          'commandStack.postExecute complex-command',
          'commandStack.preExecute post-command',
          'commandStack.preExecuted post-command',
          'commandStack.execute post-command',
          'commandStack.postExecute post-command',
          'commandStack.postExecuted post-command',
          'commandStack.postExecuted complex-command'
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
        expect(events).to.eql([
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
        expect(events).to.eql([
          'post-command',
          'complex-command',
          'pre-command',
          'changed'
        ]);
      }));

    });

  });


  describe('missing handler #execute / #revert', function() {

    function JustPrePostCommand() {

      var id = 'just-pre-post-command';

      this.preExecute = function(ctx) {
        ctx.element.trace.push(id + '-pre-execute');
      };

      this.postExecute = function(ctx) {
        ctx.element.trace.push(id + '-post-execute');
      };
    }


    it('should execute anyway', inject(function(commandStack) {

      // given
      var element = { trace: [] };

      commandStack.registerHandler('just-pre-post-command', JustPrePostCommand);

      // when
      commandStack.execute('just-pre-post-command', { element: element });

      // then
      expect(element.trace).to.eql([
        'just-pre-post-command-pre-execute',
        'just-pre-post-command-post-execute'
      ]);
    }));


    it('should undo anyway', inject(function(commandStack) {

      // given
      var element = { trace: [] };

      commandStack.registerHandler('just-pre-post-command', JustPrePostCommand);

      commandStack.execute('just-pre-post-command', { element: element });

      // then
      expect(function() {
        commandStack.undo();
      }).to.not.throw;
    }));

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
        events.push(e.elements);
      }

      eventBus.on('elements.changed', logEvent);

      // when
      commandStack.execute('outer-command', context);

      // then
      expect(events).to.eql([ [ s1, s2 ] ]);
    }));

  });


  describe('stack information', function() {

    var Handler = function(eventBus) {

      this.execute = function(ctx) {
        expect(eventBus).to.be.an('object');
        ctx.heho = 'HE';
      };

      this.revert = function(ctx) {
        ctx.heho = 'HO';
        expect(eventBus).to.be.an('object');
      };
    };


    describe('stack information #canUndo', function() {

      it('should return true', inject(function(commandStack) {

        // given
        commandStack.registerHandler('heho', Handler);

        var context = {};

        // when
        commandStack.execute('heho', context);

        // then
        expect(commandStack.canUndo()).to.be.true;
      }));


      it('should return false', inject(function(commandStack) {

        // then
        expect(commandStack.canUndo()).to.be.false;
      }));
    });


    describe('stack information #canRedo', function() {

      it('should return true', inject(function(commandStack) {

        // given
        commandStack.registerHandler('heho', Handler);

        var context = {};

        // when
        commandStack.execute('heho', context);
        commandStack.undo();

        // then
        expect(commandStack.canRedo()).to.be.true;
      }));


      it('should return false', inject(function(commandStack) {

        // given
        commandStack.registerHandler('heho', Handler);

        var context = {};

        // when
        commandStack.execute('heho', context);

        // then
        expect(commandStack.canRedo()).to.be.false;
      }));
    });

  });


  describe('diagram life-cycle integration', function() {

    function verifyClearOn(eventName) {

      return function(eventBus, commandStack) {

        // given
        commandStack._stack.push('FOO');
        commandStack._stackIdx = 10;

        var changedSpy = sinon.spy(function() {});

        eventBus.on('commandStack.changed', changedSpy);

        // when
        eventBus.fire(eventName);

        // then
        expect(commandStack._stack).to.be.empty;
        expect(commandStack._stackIdx).to.eql(-1);

        expect(changedSpy).to.have.been.called;
      };
    }

    it('should clear on diagram.destroy', inject(verifyClearOn('diagram.destroy')));

    it('should clear on diagram.clear', inject(verifyClearOn('diagram.clear')));

  });

});
