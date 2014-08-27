'use strict';

var _ = require('lodash');

var LayoutUtil = require('../../../lib/layout/Util');


function rect(x, y, width, height) {
  return { x: x, y: y, width: width, height: height };
}


describe('layout/Util', function() {

  describe('#getMidPoint', function() {

    it('should return rectangle mid point', function() {
      // given
      var r = rect(100, 100, 100, 200);

      // then
      expect(LayoutUtil.getMidPoint(r)).toEqual({ x: 150, y: 200 });
    });

  });


  describe('#getOrientation', function() {

    // a rectangle 100,100 -> 200,200
    var a = rect(100, 100, 100, 100);


    it('should detect top', function() {

      // given
      var b = rect(100, 0, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('top');
    });


    it('should detect top-right', function() {

      // given
      var b = rect(200, 0, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('top-right');
    });


    it('should detect right', function() {

      // given
      var b = rect(200, 100, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('right');
    });


    it('should detect bottom-right', function() {

      // given
      var b = rect(200, 200, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('bottom-right');
    });


    it('should detect bottom', function() {

      // given
      var b = rect(100, 200, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('bottom');
    });


    it('should detect bottom-left', function() {

      // given
      var b = rect(0, 200, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('bottom-left');
    });


    it('should detect left', function() {

      // given
      var b = rect(0, 100, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('left');
    });


    it('should detect top-left', function() {

      // given
      var b = rect(0, 0, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('top-left');
    });


    it('should detect intersect', function() {

      // given
      var b = rect(120, 120, 100, 100);

      expect(LayoutUtil.getOrientation(b, a)).toBe('intersect');
    });

  });

});