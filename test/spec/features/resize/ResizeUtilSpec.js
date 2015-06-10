'use strict';

var ResizeUtil = require('../../../../lib/features/resize/ResizeUtil');


describe('resize/ResizeUtil', function() {


  describe('resizeBounds', function() {

    // given
    var bounds = { x: 0, y: 0, width: 100, height: 100 };


    it('nw (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'nw', { x: 10, y: 20 });

      // then
      expect(resized).to.eql({ x: 10, y: 20, width: 90, height: 80 });
    });


    it('nw (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'nw', { x: -10, y: -20 });

      // then
      expect(resized).to.eql({ x: -10, y: -20, width: 110, height: 120 });
    });


    it('ne (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'ne', { x: 10, y: -20 });

      // then
      expect(resized).to.eql({ x: 0, y: -20, width: 110, height: 120 });
    });


    it('ne (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'ne', { x: -10, y: 20 });

      // then
      expect(resized).to.eql({ x: 0, y: 20, width: 90, height: 80 });
    });


    it('se (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'se', { x: 10, y: 20 });

      // then
      expect(resized).to.eql({ x: 0, y: 0, width: 110, height: 120 });
    });


    it('se (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'se', { x: -10, y: -20 });

      // then
      expect(resized).to.eql({ x: 0, y: 0, width: 90, height: 80 });
    });


    it('sw (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'sw', { x: 10, y: -20 });

      // then
      expect(resized).to.eql({ x: 10, y: 0, width: 90, height: 80 });
    });


    it('sw (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'sw', { x: -10, y: 20 });

      // then
      expect(resized).to.eql({ x: -10, y: 0, width: 110, height: 120 });
    });

  });


  describe('reattachPoint', function() {

    it('should just work', function() {

      var oldBounds = { x: 0, y: 0, width: 60, height: 60 },
          newBounds = { x: 30, y: 30, width: 30, height: 30 };

      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 30, y: 0 })).to.eql({ x: 45, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 30 })).to.eql({ x: 60, y: 45 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 30, y: 60 })).to.eql({ x: 45, y: 60 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 30 })).to.eql({ x: 30, y: 45 });

      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 0 })).to.eql({ x: 30, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 0 })).to.eql({ x: 60, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 60 })).to.eql({ x: 60, y: 60 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 60 })).to.eql({ x: 30, y: 60 });
    });

  });


  describe('ensureMinBounds', function() {

    var minBounds = {
      x: 100, y: 100,
      width: 300, height: 300
    };


    it('should ensure minimum bounds when changing height and width', function() {

      // given
      var currentBounds = {
        x: 100, y: 100,
        width: 250, height: 250
      };

      var newBounds = ResizeUtil.ensureMinBounds(currentBounds, minBounds);

      // then
      expect(newBounds).to.deep.equal({
        x: 100, y: 100,
        width: 300, height: 300
      });
    });


    it('should ensure minimum bounds when changing x and y', function() {

      // given
      var currentBounds = {
        x: 150, y: 150,
        width: 400, height: 400
      };

      var newBounds = ResizeUtil.ensureMinBounds(currentBounds, minBounds);

      // then
      expect(newBounds).to.deep.equal({
        x: 100, y: 100,
        width: 450, height: 450
      });

    });

  });


  describe('getMinResizeBounds', function () {

    describe('using minDimensions', function() {

      var currentBounds = {
        x: 100, y: 100,
        width: 100, height: 100
      };

      var minDimensions = {
        width: 50, height: 50
      };


      it('should compute <nw> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('nw', currentBounds, minDimensions);

        // then
        expect(newBounds).to.eql({ x: 150, y: 150, width: 50, height: 50 });
      });


      it('should compute <sw> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('sw', currentBounds, minDimensions);

        // then
        expect(newBounds).to.eql({ x: 150, y: 100, width: 50, height: 50 });
      });


      it('should compute <ne> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('ne', currentBounds, minDimensions);

        // then
        expect(newBounds).to.eql({ x: 100, y: 150, width: 50, height: 50 });
      });


      it('should compute <se> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('se', currentBounds, minDimensions);

        // then
        expect(newBounds).to.eql({ x: 100, y: 100, width: 50, height: 50 });
      });

    });


    describe('using minDimensions + childrenBounds', function() {

      var currentBounds = {
        x: 100, y: 100,
        width: 100, height: 100
      };

      var minDimensions = {
        width: 50, height: 50
      };

      var childrenBounds = {
        x: 120,
        y: 110,
        width: 40, height: 50
      };


      it('should compute <nw> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('nw', currentBounds, minDimensions, childrenBounds);

        // then
        expect(newBounds).to.eql({ x: 120, y: 110, width: 80, height: 90 });
      });


      it('should compute <sw> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('sw', currentBounds, minDimensions, childrenBounds);

        // then
        expect(newBounds).to.eql({ x: 120, y: 100, width: 80, height: 60 });
      });


      it('should compute <ne> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('ne', currentBounds, minDimensions, childrenBounds);

        // then
        expect(newBounds).to.eql({ x: 100, y: 110, width: 60, height: 90 });
      });


      it('should compute <se> resize bounds', function() {

        // when
        var newBounds = ResizeUtil.getMinResizeBounds('se', currentBounds, minDimensions, childrenBounds);

        // then
        expect(newBounds).to.eql({ x: 100, y: 100, width: 60, height: 60 });
      });

    });

  });


  describe('getMinResizeBounds', function () {

    var currentBounds = {
      x: 100, y: 100,
      width: 100, height: 100
    };

    var minDimensions = {
      width: 50, height: 50
    };


    it('should give min bounds for "nw"', function() {
      // when
      var newBounds = ResizeUtil.getMinResizeBounds('nw', currentBounds, minDimensions);

      // then
      expect(newBounds).to.eql({x: 150, y: 150, width: 50, height: 50});
    });


    it('should give min bounds for "sw"', function() {
      // when
      var newBounds = ResizeUtil.getMinResizeBounds('sw', currentBounds, minDimensions);

      // then
      expect(newBounds).to.eql({x: 150, y: 100, width: 50, height: 50});
    });


    it('should give min bounds for "ne"', function() {
      // when
      var newBounds = ResizeUtil.getMinResizeBounds('ne', currentBounds, minDimensions);

      // then
      expect(newBounds).to.eql({x: 100, y: 150, width: 50, height: 50});
    });


    it('should give min bounds for "se"', function() {
      // when
      var newBounds = ResizeUtil.getMinResizeBounds('se', currentBounds, minDimensions);

      // then
      expect(newBounds).to.eql({x: 100, y: 100, width: 50, height: 50});
    });


  });

});
