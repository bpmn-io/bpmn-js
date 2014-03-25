var shapeUtil = require('../../../src/util/shapeUtil');

describe('util/shapeUtil', function() {

  'use strict';

  var shapeA = {
    id: 'a',
    children: [
      { id: 'a.0', children: [] },
      { id: 'a.1', children: [
        { id: 'a.1.0' },
        { id: 'a.1.1' }
      ]},
      { id: 'a.2', children: [
        { id: 'a.2.0' },
        { id: 'a.2.1', children: [
          { id: 'a.2.1.0' }
        ]}
      ]}
    ]
  };

  var shapeB = {
    id: 'b'
  };

  var shapeC = {
    id: 'c',
    children: [
      { id: 'c.0' },
      { id: 'c.1' }
    ]
  };

  var shapeD = {
    id: 'd',
    children: [
      shapeA,
      shapeB,
      shapeC
    ]
  };

  function ids(array) {
    return array.map(function(e) {
      return e.id;
    });
  }

  describe('selfAndDirectChildren', function() {

    it('should return self + children', function() {

      // given
      var a = shapeA;

      // when
      var result = shapeUtil.selfAndDirectChildren([shapeA]);

      expect(result.length).toBe(4);
      expect(result).toEqual([ a ].concat(a.children));
    });

    it('should return self (no children)', function() {

      // when
      var result = shapeUtil.selfAndDirectChildren([shapeB]);

      expect(result.length).toBe(1);
      expect(result).toEqual([ shapeB ]);
    });

    it('should return unique elements', function() {
      
      // given
      var a = shapeA,
          child = shapeA.children[1];

      // when
      var result = shapeUtil.selfAndDirectChildren([ a, child ]);

      expect(result.length).toBe(6);
      expect(ids(result)).toEqual(ids([ a ].concat(a.children).concat(child.children)));
    });
  });

  describe('selfAndAllChildren', function() {

    it('should return self + ALL children', function() {

      // given
      var a = shapeA,
          d = shapeD; // parent of A

      // when
      var result = shapeUtil.selfAndAllChildren([ a, d ]);

      expect(result.length).toBe(14);
    });
  });


  describe('setParent', function() {

    it('should initialize parent', function() {
      
      // given    
      var shape = { };
      var parent = { };

      // when
      shapeUtil.setParent(shape, parent);

      // then
      expect(shape.parent).toBe(parent);
      expect(parent.children).toEqual([ shape ]);
    });

    it('should handle undefined parent#children', function() {

      // given
      var oldParent = {};
      var newParent = {};

      var s = { parent: oldParent };

      // when
      shapeUtil.setParent(s, newParent);

      // then
      expect(s.parent).toBe(newParent);
    });

    it('should unwire old parent relationship', function() {

      // given    
      var shape = { };
      var oldParent = { };
      var newParent = { };

      shapeUtil.setParent(shape, oldParent);

      // when
      shapeUtil.setParent(shape, newParent);

      // then
      expect(shape.parent).toBe(newParent);
      expect(newParent.children).toEqual([ shape ]);
      expect(oldParent.children.indexOf(shape)).toBe(-1);
    });

  });


  describe('translateShape', function() {

    it('should move shape correctly', function() {

      // given
      var shape = {x: 11, y: 23};

      // when
      shapeUtil.translateShape(shape, 7, 9);

      expect(shape.x).toEqual(18);
      expect(shape.y).toEqual(32);

      // when
      shapeUtil.translateShape(shape, -14, -9);

      expect(shape.x).toEqual(4);
      expect(shape.y).toEqual(23);
    });
  });
});