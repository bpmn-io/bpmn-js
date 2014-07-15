'use strict';

var CommandStack = require('../../../lib/cmd/CommandStack'),
    Events = require('../../../lib/core/EventBus');


describe('CommandStack', function() {

  /**
   * Create a new handler with the given identifier
   */
  function handler(name) {

    return {
      execute: function(ctx) {
        ctx.last = 'execute-' + name;
      },
      revert: function(ctx) {
        ctx.last = 'revert-' + name;
      },
      canExecute: function(ctx) {
        ctx.last = 'can-execute-' + name;
      }
    };
  }

  var handlerA = handler('A');
  var handlerB = handler('B');
  var handlerC = handler('C');


  var fired;
  var commandStack, events;


  beforeEach(function() {
    events = new Events();
    fired = [];

    events.fire = function() {
      fired.push(Array.prototype.slice.call(arguments));
    };

    commandStack = new CommandStack(null, events);
  });


  function expectFired(events) {
    expect(fired).toEqual(events);
  }

  function expectStack(actions, idx) {
    expect(commandStack.getStack()).toEqual(actions);
    expect(commandStack.getStackIndex()).toEqual(idx);
  }

  function action(id, ctx) {
    return { id: id, ctx: ctx };
  }


  describe('register', function() {

    it('should register handler', function() {

      // when
      commandStack.register('a', handlerA);
      commandStack.register('c', handlerC);

      // then
      var handlers_a = commandStack.getHandlers('a');
      var handlers_c = commandStack.getHandlers('c');

      expect(handlers_a).toEqual([ handlerA ]);
      expect(handlers_c).toEqual([ handlerC ]);
    });

  });


  describe('execute', function() {

    it('should put action on stack', function() {

      // given
      commandStack.register('a', handlerA);

      var ctx = {};

      // when
      commandStack.execute('a', ctx);

      // then
      expect(ctx.last).toEqual('execute-A');

      expectStack([ action('a', ctx) ], 0);
    });


    it('should fire commandStack.(execute|changed) events', function() {

      // given

      // when
      commandStack.execute('a', {});

      // then
      expectFired([
        [ 'commandStack.execute', { id: 'a' } ],
        [ 'commandStack.changed' ]
      ]);

    });


    it('should put multiple actions on stack', function() {

      // given
      commandStack.register('a', handlerA);
      commandStack.register('b', handlerB);

      var ctx = {};

      // when
      commandStack.execute('a', ctx);
      commandStack.execute('b', ctx);

      // then
      expect(ctx.last).toEqual('execute-B');

      expectStack([ action('a', ctx), action('b', ctx) ], 1);
    });

  });


  describe('undo', function() {

    it('should undo single action', function() {

      // given
      commandStack.register('a', handlerA);

      var ctx = {};

      // when
      commandStack.execute('a', ctx);
      commandStack.undo();

      // then
      expect(ctx.last).toEqual('revert-A');

      expectStack([ action('a', ctx) ], -1);
    });


    it('should fire commandStack.(revert|changed) events', function() {

      // given

      // when
      commandStack.execute('a', {});
      commandStack.undo();

      // then
      expectFired([
        [ 'commandStack.execute', { id: 'a' } ],
        [ 'commandStack.changed' ],
        [ 'commandStack.revert', { id: 'a' } ],
        [ 'commandStack.changed' ]
      ]);

    });


    it('should undo multiple actions', function() {

      // given
      commandStack.register('a', handlerA);
      commandStack.register('b', handlerB);

      var ctx = {};

      // when
      commandStack.execute('a', ctx);
      commandStack.execute('b', ctx);
      commandStack.undo();
      commandStack.undo();

      // then
      expect(ctx.last).toEqual('revert-A');

      expectStack([ action('a', ctx), action('b', ctx) ], -1);
    });


    it('should not fail if nothing to undo', function() {

      // given

      // when
      commandStack.undo();

      // then
      expectStack([ ], -1);
    });

  });


  describe('redo', function() {

    it('should redo previously undone action', function() {

      // given
      commandStack.register('a', handlerA);

      var ctx = {};

      // when
      commandStack.execute('a', ctx);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(ctx.last).toEqual('execute-A');

      expectStack([ action('a', ctx) ], 0);
    });


    it('should not fail if nothing to redo', function() {

      // given

      // when
      commandStack.redo();

      // then
      expectStack([ ], -1);
    });

  });


  describe('reset', function() {

    it('should clear stack', function() {

      // given
      commandStack.register('a', handlerA);

      commandStack.execute('a', {});
      commandStack.execute('a', {});
      commandStack.undo();
      commandStack.redo();
      commandStack.execute('a', {});
      commandStack.undo();

      // when
      commandStack.clear();

      // then
      expectStack([ ], -1);
    });

  });

});