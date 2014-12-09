var ResizeUtil = require('../../../../lib/features/resize/Util');


describe('resize/Util', function() {


  describe('resizeBounds', function() {

    // given
    var bounds = { x: 0, y: 0, width: 100, height: 100 };


    it('nw (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'nw', { x: 10, y: 20 });

      // then
      expect(resized).toEqual({ x: 10, y: 20, width: 90, height: 80 });
    });


    it('nw (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'nw', { x: -10, y: -20 });

      // then
      expect(resized).toEqual({ x: -10, y: -20, width: 110, height: 120 });
    });


    it('ne (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'ne', { x: 10, y: -20 });

      // then
      expect(resized).toEqual({ x: 0, y: -20, width: 110, height: 120 });
    });


    it('ne (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'ne', { x: -10, y: 20 });

      // then
      expect(resized).toEqual({ x: 0, y: 20, width: 90, height: 80 });
    });


    it('se (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'se', { x: 10, y: 20 });

      // then
      expect(resized).toEqual({ x: 0, y: 0, width: 110, height: 120 });
    });


    it('se (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'se', { x: -10, y: -20 });

      // then
      expect(resized).toEqual({ x: 0, y: 0, width: 90, height: 80 });
    });


    it('sw (shrink)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'sw', { x: 10, y: -20 });

      // then
      expect(resized).toEqual({ x: 10, y: 0, width: 90, height: 80 });
    });


    it('sw (expand)', function() {

      // when
      var resized = ResizeUtil.resizeBounds(bounds, 'sw', { x: -10, y: 20 });

      // then
      expect(resized).toEqual({ x: -10, y: 0, width: 110, height: 120 });
    });

  });


  describe('reattachPoint', function() {

    it('should just work', function() {

      var oldBounds = { x: 0, y: 0, width: 60, height: 60 },
          newBounds = { x: 30, y: 30, width: 30, height: 30 };

      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 30, y: 0 })).toEqual({ x: 45, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 30 })).toEqual({ x: 60, y: 45 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 30, y: 60 })).toEqual({ x: 45, y: 60 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 30 })).toEqual({ x: 30, y: 45 });

      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 0 })).toEqual({ x: 30, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 0 })).toEqual({ x: 60, y: 30 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 60, y: 60 })).toEqual({ x: 60, y: 60 });
      expect(ResizeUtil.reattachPoint(oldBounds, newBounds, { x: 0, y: 60 })).toEqual({ x: 30, y: 60 });
    });

  });
});