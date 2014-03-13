var Command = require('../../../src/core/CommandStack');

describe('CommandStack should,', function() {
  'use strict';

  var command = new Command();

  var f1 = {
    do: function f1_do(param) {

      param.test = 'do_A';
      return true;
    },
    undo: function f1_undo(param) {
      param.test = 'undo_A';
      return true;
    },
    canDo: function f1_canDo(param) {
      param.test = 'canDo_A';
      return true;
    }
  };
  var f2 = {
    do: function f2_do(param) {
      param.test = 'do_B';
      return true;
    },
    undo: function f2_undo(param) {
      param.test = 'undo_B';
      return true;
    },
    canDo: function f2_canDo(param) {
      param.test = 'canDo_B';
      return true;
    }
  };
  var f3 = {
    do: function f3_do(param) {
      param.test = 'do_C';
      return true;
    },
    undo: function f3_undo(param) {
      param.test = 'undo_C';
      return true;
    },
    canDo: function f3_canDo(param) {
      param.test = 'canDo_C';
      return true;
    }
  };
  var f4 = {
    do: function f4_do(param) {
      param.test = 'do_D';
    },
    undo: function f4_undo(param) {
      param.test = 'undo_D';
    },
    canDo: function f4_canDo(param) {
      param.test = 'canDo_D';
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