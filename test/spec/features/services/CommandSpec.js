var Command = require('../../../../src/features/services/CommandStack');

describe('CommandStack', function() {
  'use strict';

  var command = new Command();
  var f1 = function f1(param) {
    param.test = 'A';
  };
  var f2 = function f2(param) {
    param.test = 'B';
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
    expect(param1.test).toEqual('B');
    command.register('id_4', f4);
    var param2 = {};
    command.execute('id_4', param2);
    expect(param2.test).toEqual('D');
  });

});