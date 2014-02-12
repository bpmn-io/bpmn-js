var Command = require('../../../src/features/Command');

describe('Command', function() {
  'use strict';

  var command = new Command();
  var f1 = function f1() {
    return 'A';
  };
  var f2 = function f2() {
    return 'B';
  };
  var f3 = function f3() {
    return 'C';
  };


  beforeEach(function() {
    command = new Command();
  });

  it('Inital test of method registration', function() {

    command.registerCommand('id_1', f1);
    expect(command.getCommandList()['id_1']).toBeDefined();

    command.registerCommand('id_2', f2);
    command.registerCommand('id_3', f3);

    expect(command.getCommandList()['id_3']).toBeDefined();
  });

});