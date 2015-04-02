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

      expect(result.length).to.equal(4);
      expect(result).to.eql([ a ].concat(a.children));
    });


    it('should return self (no children)', function() {

      // when
      var result = Elements.selfAndDirectChildren([shapeB]);

      expect(result.length).to.equal(1);
      expect(result).to.eql([ shapeB ]);
    });


    it('should return unique elements', function() {

      // given
      var a = shapeA,
          child = shapeA.children[1];

      // when
      var result = Elements.selfAndDirectChildren([ a, child ]);

      expect(result.length).to.equal(6);
      expect(ids(result)).to.eql(ids([ a ].concat(a.children).concat(child.children)));
    });
  });


  describe('selfAndAllChildren', function() {

    it('should return self + ALL children', function() {

      // given
      var a = shapeA,
          d = shapeD; // parent of A

      // when
      var result = Elements.selfAndAllChildren([ a, d ]);

      expect(result.length).to.equal(14);
    });

  });


  describe('getClosure', function() {
    it('should test getClosure');
  });

  describe('#getBBox', function() {

    var shape1 = {
      id: 'shape1',
      x: 100,
      y: 100,
      height: 10,
      width: 10
    };

    var shape2 = {
      id: 'shape2',
      x: 120,
      y: 100,
      height: 30,
      width:  40
    };

    var shape3 = {
      id: 'shape3',
      x: -10,
      y: -10,
      height: 20,
      width:  20
    };

    var connection1 = {
      id: 'connection1',
      waypoints: [ { x: 110, y: 105 }, {x: 120, y: 115} ]
    };


    it('should return bbox for element', function() {

      //given
      var elements = shape2;

      var bbox = Elements.getBBox(elements);

      expect(bbox).to.eql({
        x: 120,
        y: 100,
        height: 30,
        width:  40
      });
    });

    it('should return bbox for connection', function() {

      //given
      var elements = connection1;

      var bbox = Elements.getBBox(elements);

      expect(bbox).to.eql({
        x: 110,
        y: 105,
        height: 10,
        width:  10
      });
    });

    it('should return bbox for elements', function() {

      //given
      var elements = [shape1, shape2, connection1];

      var bbox = Elements.getBBox(elements);

      expect(bbox).to.eql({
        x: 100,
        y: 100,
        height: 30,
        width:  60
      });
    });

    it('should return bbox for elements at negative x,y', function() {

      //given
      var elements = [shape1, shape2, shape3, connection1];

      var bbox = Elements.getBBox(elements);

      expect(bbox).to.eql({
        x: -10,
        y: -10,
        height: 140,
        width:  170
      });
    });

    it('should return bbox for elements with a connection at the bbox border', function() {

      //given
      var elements = [shape1, connection1];

      var bbox = Elements.getBBox(elements);

      expect(bbox).to.eql({
        x: 100,
        y: 100,
        height: 15,
        width:  20
      });
    });
  });
});
