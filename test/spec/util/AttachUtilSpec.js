'use strict';

var AttachUtil = require('../../../lib/util/AttachUtil');


describe('AttachUtil', function() {

  describe('#getNewAttachPoint', function() {

    it('should return new point\'s position delta for growing', function() {
      // given
      var point = {
        x: -2,
        y: 2
      };

      var oldBounds = {
        x: -2,
        y: -2,
        width: 4,
        height: 4
      };

      var newBounds = {
        x: -2,
        y: -2,
        width: 8,
        height: 8
      };

      // then
      expect(AttachUtil.getNewAttachPoint(point, oldBounds, newBounds)).to.eql({ x: -2, y: 6 });
    });

    it('should return new point\'s position delta for shrinking', function() {
      // given
      var point = {
        x: -4,
        y: 4
      };

      var oldBounds = {
        x: -4,
        y: -4,
        width: 8,
        height: 8
      };

      var newBounds = {
        x: -4,
        y: -4,
        width: 4,
        height: 4
      };

      // then
      expect(AttachUtil.getNewAttachPoint(point, oldBounds, newBounds)).to.eql({ x: -4, y: 0 });
    });

    it('should return new point\'s position delta', function() {
      // given
      var point = {
        x: 21,
        y: 12
      };

      var oldBounds = {
        x: 18,
        y: 8,
        width: 4,
        height: 4
      };

      var newBounds = {
        x: 18,
        y: 8,
        width: 10,
        height: 2
      };

      // then
      expect(AttachUtil.getNewAttachPoint(point, oldBounds, newBounds)).to.eql({ x: 26, y: 10 });
    });

  });

});

