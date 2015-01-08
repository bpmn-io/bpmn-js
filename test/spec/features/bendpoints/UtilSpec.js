var Util = require('../../../../lib/features/bendpoints/Util');


describe('features/bendpoints - Util', function() {

  describe('#getApproxIntersection', function() {

    var waypoints = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 100, y: 100 }
    ];


    it('should match start point', function() {
      var intersection = Util.getApproxIntersection(waypoints, waypoints[0]);

      expect(intersection.bendpoint).toBe(true);
      expect(intersection.index).toBe(0);
      expect(intersection.point).toEqual(waypoints[0]);
    });


    it('should fuzzy match start point', function() {
      var intersection = Util.getApproxIntersection(waypoints, { x: 7, y: -7 });

      expect(intersection.bendpoint).toBe(true);
      expect(intersection.index).toBe(0);
      expect(intersection.point).toEqual(waypoints[0]);
    });


    it('should not match start point', function() {
      var intersection = Util.getApproxIntersection(waypoints, { x: 10, y: -10 });

      expect(intersection).toBeFalsy();
    });


    it('should fuzzy match intermediate waypoint', function() {
      var intersection = Util.getApproxIntersection(waypoints, { x: 55, y: 45 });

      expect(intersection.bendpoint).toBeTruthy();
      expect(intersection.index).toBe(1);
    });


    it('should fuzzy match inbetween point', function() {
      var intersection = Util.getApproxIntersection(waypoints, { x: 24.5, y: 25.5 });

      expect(intersection.bendpoint).toBeFalsy();
      expect(intersection.index).toBe(1);
      expect(intersection.point).toEqual({ x: 25, y: 25 });
    });


    it('should fuzzy match end point', function() {
      var intersection = Util.getApproxIntersection(waypoints, { x: 105, y: 95 });

      expect(intersection.bendpoint).toBe(true);
      expect(intersection.index).toBe(3);
      expect(intersection.point).toEqual(waypoints[waypoints.length - 1]);
    });

  });

});