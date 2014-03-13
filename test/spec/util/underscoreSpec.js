var _ = require('../../../src/util/underscore');

describe('emptyArray', function() {
  'use strict';

  it('should remove all items from the array', function() {
    var array = [21,42,55,66,77];
    expect(array.length).toEqual(5);
    _.emptyArray(array);
    expect(array.length).toEqual(0);
  });
});