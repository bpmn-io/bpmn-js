import {
  getDistancePointLine,
  getAngle,
  getDistancePointPoint,
  perpendicularFoot,
  rotateVector
} from 'lib/features/modeling/behavior/util/GeometricUtil';


describe('modeling/behavior/util - GeometricUtil', function() {

  it('should re-export diagram-js utility', function() {

    expect(getDistancePointLine).to.exist;
    expect(getAngle).to.exist;
    expect(getDistancePointPoint).to.exist;
    expect(perpendicularFoot).to.exist;
    expect(rotateVector).to.exist;

  });

});
