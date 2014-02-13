var Command = require('../../../../src/features/services/CommandStack');

describe('CommandStack', function() {
  'use strict';

  var command = new Command();
  var f1 = {
    do: function f1_do(param) {
      param.test = 'do_A';
    },
    undo: function f1_undo(param) {
      param.test = 'undo_A';
    },
    canDo: function f1_canDo(param) {
      param.test = 'canDo_A';
    }
  };
  var f2 = {
    do: function f2_do(param) {
      param.test = 'do_B';
    },
    undo: function f2_undo(param) {
      param.test = 'undo_B';
    },
    canDo: function f2_canDo(param) {
      param.test = 'canDo_B';
    }
  };
  var f3 = {
    do: function f3_do(param) {
      param.test = 'do_C';
    },
    undo: function f3_undo(param) {
      param.test = 'undo_C';
    },
    canDo: function f3_canDo(param) {
      param.test = 'canDo_C';
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

  it('Initial test of method registration', function() {

    command.register('id_1', f1);
    expect(command.getCommandList()['id_1']).toBeDefined();

    command.register('id_2', f2);
    command.register('id_3', f3);

    expect(command.getCommandList()['id_3']).toBeDefined();
  });

  it('Execute a command', function() {

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

});