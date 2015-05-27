'use strict';

var getApproxIntersection = require('../../../lib/util/LineIntersection').getApproxIntersection;


describe('features/bendpoints - LineIntersection', function() {

  describe('#getApproxIntersection', function() {

    var waypoints = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 100, y: 100 }
    ];


    it('should match start point', function() {
      var intersection = getApproxIntersection(waypoints, waypoints[0]);

      expect(intersection.bendpoint).to.be.true;
      expect(intersection.index).to.equal(0);
      expect(intersection.point).to.equal(waypoints[0]);
    });


    it('should fuzzy match start point', function() {
      var intersection = getApproxIntersection(waypoints, { x: 7, y: -7 });

      expect(intersection.bendpoint).to.be.true;
      expect(intersection.index).to.equal(0);
      expect(intersection.point).to.equal(waypoints[0]);
    });


    it('should not match start point', function() {
      var intersection = getApproxIntersection(waypoints, { x: 10, y: -10 });

      expect(intersection).to.be.null;
    });


    it('should fuzzy match intermediate waypoint', function() {
      var intersection = getApproxIntersection(waypoints, { x: 55, y: 45 });

      expect(intersection.bendpoint).to.be.true;
      expect(intersection.index).to.equal(1);
    });


    it('should fuzzy match inbetween point', function() {
      var intersection = getApproxIntersection(waypoints, { x: 24.5, y: 25.5 });

      expect(intersection.bendpoint).to.not.be.defined;
      expect(intersection.index).to.equal(1);
      expect(intersection.point).to.eql({ x: 25, y: 25 });
    });


    it('should fuzzy match end point', function() {
      var intersection = getApproxIntersection(waypoints, { x: 105, y: 95 });

      expect(intersection.bendpoint).to.be.true;
      expect(intersection.index).to.equal(3);
      expect(intersection.point).to.eql(waypoints[waypoints.length - 1]);
    });

  });

});