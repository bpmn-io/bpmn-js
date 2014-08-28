'use strict';

var Elements = require('../../../lib/util/Elements');


describe('util/Elements', function() {

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
      var result = Elements.selfAndDirectChildren([shapeA]);

      expect(result.length).toBe(4);
      expect(result).toEqual([ a ].concat(a.children));
    });


    it('should return self (no children)', function() {

      // when
      var result = Elements.selfAndDirectChildren([shapeB]);

      expect(result.length).toBe(1);
      expect(result).toEqual([ shapeB ]);
    });


    it('should return unique elements', function() {

      // given
      var a = shapeA,
          child = shapeA.children[1];

      // when
      var result = Elements.selfAndDirectChildren([ a, child ]);

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
      var result = Elements.selfAndAllChildren([ a, d ]);

      expect(result.length).toBe(14);
    });

  });

});