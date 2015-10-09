'use strict';


describe('matchers/ConnectionMatchers', function() {

  var Model = require('../../lib/model');

  var connectionWaypoints = [
    { x: 100, y: 100, original: { x: 120, y: 120 } },
    { x: 80, y: 80, original: { x: 50, y: 50 } }
  ];

  var connection = Model.create('connection', { id: 'someConnection', waypoints: connectionWaypoints });


  describe('waypoints', function() {

    it('should .have.waypoints() with Connection', function() {

      // given
      var expectedWaypoints = [
        { x: 100, y: 100 },
        { x: 80, y: 80 }
      ];

      // then
      expect(connection).to.have.waypoints(expectedWaypoints);
    });


    it('should .not.have.waypoints() with Connection', function() {

      // given
      var expectedWaypoints = [
        { x: 100, y: 100 },
        { x: 100, y: 80 } // wrong (!)
      ];

      // then
      expect(connection).to.not.have.waypoints(expectedWaypoints);
    });

  });


  describe('startDocking', function() {

    it('should .have.startDocking() with Connection', function() {

      // given
      var expectedStartDocking = {
        x: 120,
        y: 120
      };

      // then
      expect(connection).to.have.startDocking(expectedStartDocking);
    });


    it('should .not.have.startDocking() with Connection', function() {

      // given
      var expectedStartDocking = {
        x: 70, // wrong (!)
        y: 120
      };

      // then
      expect(connection).to.not.have.startDocking(expectedStartDocking);
    });

  });


  describe('endDocking', function() {

    it('should .have.endDocking() with Connection', function() {

      // given
      var expectedEndDocking = {
        x: 50,
        y: 50
      };

      // then
      expect(connection).to.have.endDocking(expectedEndDocking);
    });


    it('should .not.have.endDocking() with Connection', function() {

      // given
      var expectedEndDocking = {
        x: 50,
        y: 70 // wrong (!)
      };

      // then
      expect(connection).to.not.have.endDocking(expectedEndDocking);
    });

  });

});