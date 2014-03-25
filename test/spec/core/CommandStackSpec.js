var Command = require('../../../src/core/CommandStack');

describe('CommandStack should,', function() {
  'use strict';

  var command = new Command();

  var f1 = {
    execute: function f1_execute(param) {

      param.test = 'do_A';
      return true;
    },
    revert: function f1_revert(param) {
      param.test = 'undo_A';
      return true;
    },
    canExecute: function f1_canExecute(param) {
      param.test = 'canExecute_A';
      return true;
    }
  };
  var f2 = {
    execute: function f2_execute(param) {
      param.test = 'do_B';
      return true;
    },
    revert: function f2_revert(param) {
      param.test = 'undo_B';
      return true;
    },
    canExecute: function f2_canExecute(param) {
      param.test = 'canExecute_B';
      return true;
    }
  };
  var f3 = {
    execute: function f3_execute(param) {
      param.test = 'do_C';
      return true;
    },
    revert: function f3_revert(param) {
      param.test = 'undo_C';
      return true;
    },
    canExecute: function f3_canExecute(param) {
      param.test = 'canExecute_C';
      return true;
    }
  };
  var f4 = {
    execute: function f4_execute(param) {
      param.test = 'do_D';
    },
    revert: function f4_revert(param) {
      param.test = 'undo_D';
    },
    canExecute: function f4_canExecute(param) {
      param.test = 'canExecute_D';
    }
  };


  beforeEach(function() {
    command = new Command();
  });

  it('be able to register commands', function() {

    command.register('id_1', f1);
    expect(command.getCommandList()['id_1']).toBeDefined();

    command.register('id_2', f2);
    command.register('id_3', f3);

    expect(command.getCommandList()['id_3']).toBeDefined();
  });

  it('execute commands', function() {

    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    var param1 = {};
    command.execute('id_2', param1);
    expect(param1.test).toEqual('do_B');
    command.register('id_4', f4);
    var param2 = {};
    command.execute('id_4', param2);
    expect(param2.test).toEqual('do_D');
  });

  it('reset the action stack', function() {

    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var stack = command.actionStack();
    expect(stack.length).toBe(0);
    var param1 = {};
    command.execute('id_2', param1);
    command.execute('id_2', param1);
    command.execute('id_3', param1);
    command.execute('id_2', param1);


    expect(stack.length).toBe(4);
    command.clearStack();
    expect(stack.length).toBe(0);
  });

  it('undo last actions', function() {

    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var stack = command.actionStack();
    expect(stack.length).toBe(0);
    var param1 = {};
    command.execute('id_1', param1);
    command.execute('id_1', param1);
    command.execute('id_3', param1);
    command.execute('id_2', param1);
    expect(param1.test).toEqual('do_B');
    command.undo();
    expect(param1.test).toEqual('undo_B');
    command.undo();
    expect(param1.test).toEqual('undo_C');
    command.undo();
    expect(param1.test).toEqual('undo_A');
    command.undo();
    expect(param1.test).toEqual('undo_A');
  });

  it('redo last actions', function() {

    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var param1 = {};
    command.execute('id_1', param1);
    command.execute('id_1', param1);
    command.execute('id_3', param1);
    command.execute('id_2', param1);
    expect(param1.test).toEqual('do_B');
    command.undo();
    expect(param1.test).toEqual('undo_B');
    command.undo();
    expect(param1.test).toEqual('undo_C');
    command.undo();
    expect(param1.test).toEqual('undo_A');
    command.undo();
    expect(param1.test).toEqual('undo_A');
    command.redo();
    expect(param1.test).toEqual('do_A');
    command.redo();
    expect(param1.test).toEqual('do_A');
    command.redo();
    expect(param1.test).toEqual('do_C');
    command.redo();
    expect(param1.test).toEqual('do_B');
  });

  it('not fail on to many redos', function() {
    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var param1 = {};
    command.execute('id_1', param1);
    command.execute('id_1', param1);
    command.execute('id_3', param1);
    command.execute('id_2', param1);

    command.undo();
    command.undo();
    command.undo();

    command.redo();
    command.redo();
    command.redo();
    command.redo();
    command.redo();
    command.redo();
  });

  it('not fail on to many undos', function() {
    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var param1 = {};
    command.execute('id_1', param1);
    command.execute('id_1', param1);
    command.execute('id_3', param1);
    command.execute('id_2', param1);

    command.undo();
    command.undo();
    command.undo();
    command.undo();
    command.undo();
    command.undo();
    command.undo();
  });

  it('test integrity', function() {
    command.register('id_1', f1);
    command.register('id_2', f2);
    command.register('id_3', f3);
    command.register('id_4', f4);

    var param = {};
    command.execute('id_1', param);
    command.execute('id_2', param);
    command.execute('id_3', param);
    expect(param.test).toEqual('do_C');
    command.undo();
    expect(param.test).toEqual('undo_C');
    command.undo();
    expect(param.test).toEqual('undo_B');
    command.redo();
    expect(param.test).toEqual('do_B');
    command.undo();
    expect(param.test).toEqual('undo_B');
  });

});