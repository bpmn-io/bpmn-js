import { expect } from 'chai';
import {
  getDistancePointLine,
  getAngle,
  getDistancePointPoint,
  perpendicularFoot,
  rotateVector
} from 'bpmn-js/lib/features/modeling/behavior/util/GeometricUtil.js';


describe('modeling/behavior/util - GeometricUtil', function() {

  it('should re-export diagram-js utility', function() {

    expect(getDistancePointLine).to.exist;
    expect(getAngle).to.exist;
    expect(getDistancePointPoint).to.exist;
    expect(perpendicularFoot).to.exist;
    expect(rotateVector).to.exist;

  });

});
