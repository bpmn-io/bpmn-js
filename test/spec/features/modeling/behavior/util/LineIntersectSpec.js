import intersection from 'lib/features/modeling/behavior/util/LineIntersect';


describe('modeling/behavior/util - LineIntersect', function() {

  it('should compute intersections', function() {
    expect(intersection(
      { x: 10, y: 20 }, { x: 50, y: 50 },
      { x: 10, y: 50 }, { x: 50, y: 50 }
    )).to.eql({ x: 50, y: 50 });

    expect(intersection(
      { x: 10, y: 20 }, { x: 10, y: 50 },
      { x: 10, y: 50 }, { x: 50, y: 50 }
    )).to.eql({ x: 10, y: 50 });

    expect(intersection(
      { x: 50, y: 50 }, { x: 10, y: 40 },
      { x: 10, y: 50 }, { x: 50, y: 50 }
    )).to.eql({ x: 50, y: 50 });

    expect(intersection(
      { x: 0, y: 0 }, { x: 100, y: 100 },
      { x: 40, y: 0 }, { x: 30, y: 10 }
    )).to.eql({ x: 20, y: 20 });

  });

});