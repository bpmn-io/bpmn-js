'use strict';

var IdGenerator = require('../../../lib/util/IdGenerator');


describe('util/IdGenerator', function() {


  it('should configure with prefix', function() {

    // when
    var foos = new IdGenerator('foo');

    // then
    expect(foos.next()).toMatch(/^foo-(\d+)-1$/);
    expect(foos.next()).toMatch(/^foo-(\d+)-2$/);
    expect(foos.next()).toMatch(/^foo-(\d+)-3$/);
  });


  it('should configure without prefix', function() {

    // when
    var foos = new IdGenerator();

    // then
    expect(foos._prefix).toBeDefined();

    expect(foos.next()).toMatch(/^(\d+)-1$/);
    expect(foos.next()).toMatch(/^(\d+)-2$/);
    expect(foos.next()).toMatch(/^(\d+)-3$/);

  });

});
