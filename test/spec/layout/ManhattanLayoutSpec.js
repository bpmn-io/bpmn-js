'use strict';

var _ = require('lodash');

var ManhattanLayout = require('../../../lib/layout/ManhattanLayout');


function point(x, y) {
  return { x: x, y: y };
}

function rect(x, y, width, height) {
  return { x: x, y: y, width: width, height: height };
}


function expectConnection(connection, expected) {

  var len = Math.max(connection.length, expected.length);

  for (var i = 0; i < len; i++) {
    expect(connection[i]).toEqual(expected[i]);
  }
}


describe('layout/ManhattanLayout', function() {

  describe('#connectPoints', function() {

    var a = point(100, 100),
        b = point(200, 200);


    it('should create h:v manhattan connection', function() {

      // when
      var connection = ManhattanLayout.connectPoints(a, b, 'h:v');

      // expect
      expectConnection(connection, [ a, point(200, 100), b ]);
    });


    it('should create v:h manhattan connection', function() {

      // when
      var connection = ManhattanLayout.connectPoints(a, b, 'v:h');

      // expect
      expectConnection(connection, [ a, point(100, 200), b ]);
    });


    it('should create h:h manhattan connection', function() {

      // when
      var connection = ManhattanLayout.connectPoints(a, b, 'h:h');

      // expect
      expectConnection(connection, [ a, point(150, 100), point(150, 200), b ]);
    });


    it('should create v:v manhattan connection', function() {

      // when
      var connection = ManhattanLayout.connectPoints(a, b, 'v:v');

      // expect
      expectConnection(connection, [ a, point(100, 150), point(200, 150), b ]);
    });


    describe('misc', function() {

      it('should not layout straight connection (h)', function() {

        // given
        var p0 = point(100, 100),
            p1 = point(200, 100);

        // when
        var connection = ManhattanLayout.connectPoints(p0, p1);

        // then
        expectConnection(connection, [ p0, p1 ]);
      });


      it('should not layout straight connection (v)', function() {

        // given
        var p0 = point(100, 100),
            p1 = point(200, 100);

        // when
        var connection = ManhattanLayout.connectPoints(p0, p1);

        // then
        expectConnection(connection, [ p0, p1 ]);
      });


      it('should reverse manhattan layout', function() {

        // given
        var p0 = point(200, 200),
            p1 = point(100, 100);

        // when
        var connection = ManhattanLayout.connectPoints(p0, p1, 'v:v');

        // then
        expectConnection(connection, [ p0, point(200, 150), point(100, 150), p1]);
      });

    });


    describe('error handling', function() {

      it('should throw error on unknown directions', function() {

        expect(function() {
          ManhattanLayout.connectPoints(a, b, 'x:y');
        }).toThrowError(/unknown directions: <x:y>/);

      });

    });

  });

  describe('#connectRectangles', function() {

    var start = rect(100, 100, 100, 100);


    it('should connect top', function() {

      // given
      var end = rect(100, 0, 50, 50);

      // when
      var connection = ManhattanLayout.connectRectangles(start, end);


      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 100 },
        { x: 150, y: 75 },
        { x: 125, y: 75 },
        { original: { x: 125, y: 25 }, x: 125, y: 50 }
      ]);
    });


    it('should connect right', function() {

      // given
      var end = rect(250, 100, 50, 50);

      // when
      var connection = ManhattanLayout.connectRectangles(start, end);

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 200, y: 150 },
        { x: 225, y: 150 },
        { x: 225, y: 125 },
        { original: { x: 275, y: 125 }, x: 250, y: 125 }
      ]);
    });


    it('should connect left', function() {

      // given
      var end = rect(0, 100, 50, 50);

      // when
      var connection = ManhattanLayout.connectRectangles(start, end);


      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 100, y: 150 },
        { x: 75, y: 150 },
        { x: 75, y: 125 },
        { original: { x: 25, y: 125 }, x: 50, y: 125 }
      ]);
    });


    it('should connect bottom', function() {

      // given
      var end = rect(100, 250, 50, 50);

      // when
      var connection = ManhattanLayout.connectRectangles(start, end);

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 200 },
        { x: 150, y: 225 },
        { x: 125, y: 225 },
        { original: { x: 125, y: 275 }, x: 125, y: 250 }
      ]);
    });


    describe('tolerance', function() {

      it('should connect v:v with tolerance', function() {

        // given
        var end = rect(205, 0, 50, 50);


        // when
        var connection = ManhattanLayout.connectRectangles(start, end);

        // expect
        // still layouted v:v because h:h would look super ugly
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 150, y: 100 },
          { x: 150, y: 75 },
          { x: 230, y: 75 },
          { original: { x: 230, y: 25 }, x: 230, y: 50 }
        ]);
      });

    });


  });

});