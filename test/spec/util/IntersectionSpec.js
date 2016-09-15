'use strict';

var intersect = require('../../../lib/util/Intersection').intersection;

function expectIntersection(intersection, expected) {
  return Math.abs(intersection.x - expected.x) < 1
    && Math.abs(intersection.y - expected.y) < 1
    && intersection.segment1 === expected.segment1
    && intersection.segment2 === expected.segment2;
}


describe('Intersection', function() {


  it('should intersect line with rounded rectangle (edge)', function() {

    // given
    var pathData1 = 'M80,140L100,140',
        pathData2 = 'M100,100l80,0a10,10,0,0,1,10,10l0,60a10,10,0,0,1,-10,10l-80,0a10,10,0,0,1,-10,-10l0,-60a10,10,0,0,1,10,-10z';

    // when
    var intersection = intersect(pathData1, pathData2);

    var expected = {
      x: 90,
      y: 140,
      segment1: 1,
      segment2: 7
    };

    // then
    expect(intersection.length).to.equal(1);

    expect(expectIntersection(intersection[0], expected)).to.be.true;
  });


  it('should intersect line with rounded rectangle (corner)', function() {

    // given
    var pathData1 = 'M80,105L100,105',
        pathData2 = 'M100,100l80,0a10,10,0,0,1,10,10l0,60a10,10,0,0,1,-10,10l-80,0a10,10,0,0,1,-10,-10l0,-60a10,10,0,0,1,10,-10z';

    // when
    var intersection = intersect(pathData1, pathData2);

    var expected = {
      x: 95,
      y: 105,
      segment1: 1,
      segment2: 8
    };

    // then
    expect(intersection.length).to.equal(1);

    expect(expectIntersection(intersection[0], expected)).to.be.true;
  });


  it('should intersect line with circle', function() {

    // given
    var pathData1 = 'M150,150m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-36z',
        pathData2 = 'M100,100L150,150';

    // when
    var intersection = intersect(pathData1, pathData2);

    var expected = {
      x: 138,
      y: 138,
      segment1: 5,
      segment2: 1
    };

    // then
    expect(intersection.length).to.equal(1);

    expect(expectIntersection(intersection[0], expected)).to.be.true;
  });

});
