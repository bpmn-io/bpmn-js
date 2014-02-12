var Command = require('../../../src/features/Command');

describe('Command', function() {
  'use strict';

  var command = new Command();
  var f1 = function f1(param) {
    param.test = 'A';
  };
  var f2 = function f2(param) {
    param.test = 'B';
    console.log(param);
  };
  var f3 = function f3(param) {
    param.test = 'C';
  };
  var f4 = function f4(param) {
    param.test = 'D';
  };


  beforeEach(function() {
    command = new Command();
  });

  it('Initial test of method registration', function() {

    command.registerCommand('id_1', f1);
    expect(command.getCommandList()['id_1']).toBeDefined();

    command.registerCommand('id_2', f2);
    command.registerCommand('id_3', f3);

    expect(command.getCommandList()['id_3']).toBeDefined();
  });

  it('Execute a command', function() {

    command.registerCommand('id_1', f1);
    command.registerCommand('id_2', f2);
    command.registerCommand('id_3', f3);
    var param1 = {};
    command.doCommand('id_2', param1);
    expect(param1.test).toEqual('B');
    command.registerCommand('id_4', f4);
    var param2 = {};
    command.doCommand('id_4', param2);
    expect(param2.test).toEqual('D');
  });

});