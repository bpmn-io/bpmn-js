'use strict';

var Model = require('../../lib/model');


describe('matchers/BoundsMatchers', function() {

  describe('bounds', function() {

    it('should .have.bounds() with Bounds', function() {

      // given
      var bounds = { x: 100, y: 100, width: 200, height: 200 },
          expectedBounds = { x: 100, y: 100, width: 200, height: 200 };

      // then
      expect(bounds).to.have.bounds(expectedBounds);
    });


    it('should .not.have.bounds() with Bounds', function() {

      // given
      var bounds = { x: 100, y: 100, width: 200, height: 200 },
          expectedBounds = { x: 50, y: 100, width: 200, height: 200 };

      // then
      expect(bounds).to.not.have.bounds(expectedBounds);
    });


    it('should .have.bounds() with Shape', function() {

      // given
      var element = Model.create('shape', { id: 'someShape', x: 100, y: 100, width: 200, height: 200 }),
          expectedBounds = { x: 100, y: 100, width: 200, height: 200 };

      // then
      expect(element).to.have.bounds(expectedBounds);
    });


    it('should .not.have.bounds() with Shape', function() {

      // given
      var element = Model.create('shape', { id: 'someShape', x: 100, y: 100, width: 200, height: 200 }),
          expectedBounds = { x: 50, y: 100, width: 200, height: 200 };

      // then
      expect(element).to.not.have.bounds(expectedBounds);
    });

  });

});