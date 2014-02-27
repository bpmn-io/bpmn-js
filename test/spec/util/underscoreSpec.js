var _ = require('../../../src/util/underscore');


describe('underscore', function() {
  'use strict';

  it('should provide isArray', function() {

    expect(_.isArray).toBeDefined();
  });

  it('should provide forEach', function() {

    expect(_.forEach).toBeDefined();
  });

  it('should provide emptyArray', function() {

    expect(_.emptyArray).toBeDefined();
  });
});

describe('emptyArray', function() {
  'use strict';

  it('should remove all items from the array', function() {
    var array = [21,42,55,66,77];
    expect(array.length).toEqual(5);
    _.emptyArray(array);
    expect(array.length).toEqual(0);
  });
});