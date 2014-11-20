var resizeBounds = require('../../../../lib/features/resize/Util').resizeBounds;


describe('resize/Util', function() {


  describe('resizeBounds', function() {

    // given
    var bounds = { x: 0, y: 0, width: 100, height: 100 };


    it('nw (shrink)', function() {

      // when
      var resized = resizeBounds(bounds, 'nw', { x: 10, y: 20 });

      // then
      expect(resized).toEqual({ x: 10, y: 20, width: 90, height: 80 });
    });


    it('nw (expand)', function() {

      // when
      var resized = resizeBounds(bounds, 'nw', { x: -10, y: -20 });

      // then
      expect(resized).toEqual({ x: -10, y: -20, width: 110, height: 120 });
    });


    it('ne (expand)', function() {

      // when
      var resized = resizeBounds(bounds, 'ne', { x: 10, y: -20 });

      // then
      expect(resized).toEqual({ x: 0, y: -20, width: 110, height: 120 });
    });


    it('ne (shrink)', function() {

      // when
      var resized = resizeBounds(bounds, 'ne', { x: -10, y: 20 });

      // then
      expect(resized).toEqual({ x: 0, y: 20, width: 90, height: 80 });
    });


    it('se (expand)', function() {

      // when
      var resized = resizeBounds(bounds, 'se', { x: 10, y: 20 });

      // then
      expect(resized).toEqual({ x: 0, y: 0, width: 110, height: 120 });
    });


    it('se (shrink)', function() {

      // when
      var resized = resizeBounds(bounds, 'se', { x: -10, y: -20 });

      // then
      expect(resized).toEqual({ x: 0, y: 0, width: 90, height: 80 });
    });


    it('sw (shrink)', function() {

      // when
      var resized = resizeBounds(bounds, 'sw', { x: 10, y: -20 });

      // then
      expect(resized).toEqual({ x: 10, y: 0, width: 90, height: 80 });
    });


    it('sw (expand)', function() {

      // when
      var resized = resizeBounds(bounds, 'sw', { x: -10, y: 20 });

      // then
      expect(resized).toEqual({ x: -10, y: 0, width: 110, height: 120 });
    });

  });

});