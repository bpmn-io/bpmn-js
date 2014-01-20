var _ = require('../../../src/util/underscore');

describe('underscore', function() {

  it('should provide isArray', function() {

    expect(_.isArray).toBeDefined();
  });

  it('should provide forEach', function() {

    expect(_.forEach).toBeDefined();
  });
});