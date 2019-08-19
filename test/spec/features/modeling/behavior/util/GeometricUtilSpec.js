import {
  getDistancePointLine,
  getAngle,
  getDistancePointPoint,
  perpendicularFoot,
  rotateVector
} from 'lib/features/modeling/behavior/util/GeometricUtil';


describe('modeling/behavior/util - GeometricUtil', function() {

  it('should calculate right horizontal-line/point distance', function() {

    // given
    var testData = [
      { point: { x: 2, y: 4 }, line: [ { x: 1, y: 1 }, { x: 4, y: 1 } ], distance: 3 },
      { point: { x: 2, y: 2 }, line: [ { x: 1, y: 1 }, { x: 1, y: 4 } ], distance: 1 },
      { point: { x: 0, y: 0 }, line: [ { x: 0, y: 4 }, { x: 4, y: 0 } ], distance: 3 }
    ];

    for (var i=0; i<testData.length; i++) {

      // when
      var d = getDistancePointLine(testData[i].point, testData[i].line);

      // then
      expect(Math.round(d)).to.be.equal(testData[i].distance);
    }
  });


  it('should calculate right perpendicular foot', function() {

    // given
    var testData = [
      { point: { x: 2, y: 2 }, line: [ { x: 1, y: 1 }, { x: 1, y: 3 } ], foot: { x: 1, y: 2 } },
      { point: { x: 2, y: 4 }, line: [ { x: 1, y: 1 }, { x: 4, y: 1 } ], foot: { x: 2, y: 1 } }
    ];

    for (var i=0; i<testData.length; i++) {

      // when
      var foot = perpendicularFoot(testData[i].point, testData[i].line);

      // then
      expect(rounded(foot)).to.be.eql(testData[i].foot);
    }
  });


  it('should calculate right distance', function() {

    var testData = [
      { p1: { x: 1, y: 1 }, p2: { x: 5, y: 1 }, distance: 4 },
      { p1: { x: 1, y: 1 }, p2: { x: 1, y: 5 }, distance: 4 },
      { p1: { x: 1, y: 1 }, p2: { x: 5, y: 5 }, distance: 6 },
      { p1: { x: 1, y: 1 }, p2: { x: -5, y: -5 }, distance: 8 }
    ];

    for (var i=0; i<testData.length; i++) {

      // when
      var d = getDistancePointPoint(testData[i].p1, testData[i].p2);

      // then
      expect(Math.round(d)).to.be.eql(testData[i].distance);
    }
  });


  it('should calculate right line angle', function() {

    // given
    var testLines = [
      { line: [ { x: 0, y: 0 }, { x: 10, y: 10 } ], angle: 45 },
      { line: [ { x: 0, y: 0 }, { x: 0, y: 10 } ], angle: 90 },
      { line: [ { x: 0, y: 0 }, { x: -10, y: 10 } ], angle: -45 },
      { line: [ { x: 0, y: 0 }, { x: 10, y: 0 } ], angle: 0 },
      { line: [ { x: 0, y: 0 }, { x: 0, y: -10 } ], angle: -90 },
      { line: [ { x: 0, y: 0 }, { x: -10, y: 0 } ], angle: 0 }
    ];

    for (var i=0; i<testLines.length; i++) {

      // when
      var angle = getAngle(testLines[i].line);

      // to degree
      angle = angle * (180 / Math.PI);

      // then
      expect(angle).to.be.equal(testLines[i].angle);
    }
  });


  it('should rotate vector', function() {

    // given
    var testVectors = [

      // x=-10 because we have system with flipped y axis
      { vector: { x: 0, y: 10 }, angle: 90, rotated: { x: -10, y: 0 } },
      { vector: { x: 10, y: 0 }, angle: 90, rotated: { x: 0, y: 10 } },
      { vector: { x: 10, y: 0 }, angle: 45, rotated: { x: 7, y: 7 } }
    ];

    for (var i=0; i<testVectors.length; i++) {

      // degree to radian
      var angle = testVectors[i].angle * (Math.PI / 180);

      // when
      var rotatedVector = rotateVector(testVectors[i].vector, angle);

      // then
      expect(rounded(rotatedVector)).to.be.eql(testVectors[i].rotated);
    }
  });

});


function rounded(v) {

  return {
    x: Math.round(v.x),
    y: Math.round(v.y)
  };
}
