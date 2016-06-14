'use strict';

var forEach = require('lodash/collection/forEach');

/* global bootstrapDiagram, inject */

var distributeElementsModule = require('../../../../lib/features/distribute-elements'),
    modelingModule = require('../../../../lib/features/modeling');


function expectRanges(rangeGroups, expectedRanges) {
  expect(rangeGroups).to.have.length(expectedRanges.length);

  forEach(rangeGroups, function(group, idx) {

    expect(group.range).to.eql({
      min: expectedRanges[idx].min,
      max: expectedRanges[idx].max
    });

    expect(group.elements).to.eql(expectedRanges[idx].elements);
  });
}

describe('features/distribute-elements', function() {

  beforeEach(bootstrapDiagram({
    modules: [ distributeElementsModule, modelingModule ]
  }));

  describe('methods', function() {
    var s1 = {
          id: 's1',
          x: -200,
          y: -200,
          width: 100,
          height: 100
        },
        s2 = {
          id: 's2',
          x: -150,
          y: -100,
          width: 100,
          height: 100
        },
        s3 = {
          id: 's3',
          x: 325,
          y: 250,
          width: 100,
          height: 100
        },
        s4 = {
          id: 's4',
          x: 600,
          y: 350,
          width: 100,
          height: 100
        },
        s5 = {
          id: 's5',
          x: 650,
          y: 451,
          width: 100,
          height: 100
        };

    var elements = [ s1, s2, s3, s4, s5 ];

    describe('#createGroups', function() {

      it('should group elements horizontally', inject(function(distributeElements) {
        // given
        distributeElements._setOrientation('horizontal');

        // when
        var rangeGroups = distributeElements._createGroups(elements);

        // then
        expectRanges(rangeGroups, [
          { min: -195, max: -105, elements: [ s1, s2 ] },
          { min: 330, max: 420, elements: [ s3 ] },
          { min: 605, max: 695, elements: [ s4, s5 ] }
        ]);
      }));


      it('should group elements vertically', inject(function(distributeElements) {
        // given
        distributeElements._setOrientation('vertical');

        // when
        var rangeGroups = distributeElements._createGroups(elements);

        // then
        expectRanges(rangeGroups, [
          { min: -195, max: -105, elements: [ s1] },
          { min: -95, max: -5, elements: [ s2 ] },
          { min: 255, max: 345, elements: [ s3 ] },
          { min: 355, max: 445, elements: [ s4 ] },
          { min: 456, max: 546, elements: [ s5 ] }
        ]);
      }));

    });


    describe('hasIntersection', function() {

      it('should return true for intersecting ranges', inject(function(distributeElements) {
        // when
        var result = distributeElements._hasIntersection({ min: 100, max: 200 }, { min: 150, max: 200 });

        // then
        expect(result).to.be.true;
      }));


      it('should return false for NON intersecting ranges', inject(function(distributeElements) {
        // when
        var result = distributeElements._hasIntersection({ min: 100, max: 200 }, { min: 250, max: 300 });

        // then
        expect(result).to.be.false;
      }));


      it('should return true for negative intersecting ranges', inject(function(distributeElements) {
        // when
        var result = distributeElements._hasIntersection({ min: -200, max: -100 }, { min: -150, max: -50 });

        // then
        expect(result).to.be.true;
      }));

    });

  });


  describe('integration', function() {
    var rootShape, shape1, shape2, shape3, shape4, shape5, shapeBig;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 's1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 's2',
        x: 250, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);

      shape3 = elementFactory.createShape({
        id: 's3',
        x: 325, y: 250, width: 100, height: 100
      });

      canvas.addShape(shape3, rootShape);

      shape4 = elementFactory.createShape({
        id: 's4',
        x: 600, y: 350, width: 100, height: 100
      });

      canvas.addShape(shape4, rootShape);

      shape5 = elementFactory.createShape({
        id: 's5',
        x: 650, y: 451, width: 100, height: 100
      });

      canvas.addShape(shape5, rootShape);

      shapeBig = elementFactory.createShape({
        id: 'sBig',
        x: 150, y: 400, width: 200, height: 200
      });

      canvas.addShape(shapeBig, rootShape);
    }));


    it('should align shapes of same size horizontally', inject(function(distributeElements) {
      // given
      var elements = [ shape5, shape3, shape1, shape4, shape2, shapeBig ];

      // when
      distributeElements.trigger(elements, 'horizontal');

      expect(shape1.x).to.equal(100);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(373);
      expect(shape2.y).to.equal(100);

      expect(shape3.x).to.equal(373);
      expect(shape3.y).to.equal(250);

      expect(shape4.x).to.equal(650);
      expect(shape4.y).to.equal(350);

      expect(shape5.x).to.equal(650);
      expect(shape5.y).to.equal(451);

      expect(shapeBig.x).to.equal(150);
      expect(shapeBig.y).to.equal(400);
    }));


    it('should align shapes of same size vertically', inject(function(distributeElements) {
      // given
      var elements = [ shape5, shape3, shape1, shape4, shape2, shapeBig ];

      // when
      distributeElements.trigger(elements, 'vertical');

      expect(shape1.x).to.equal(100);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(250);
      expect(shape2.y).to.equal(100);

      expect(shape3.x).to.equal(325);
      expect(shape3.y).to.equal(219);

      expect(shape4.x).to.equal(600);
      expect(shape4.y).to.equal(338);

      expect(shape5.x).to.equal(650);
      expect(shape5.y).to.equal(451);

      expect(shapeBig.x).to.equal(150);
      expect(shapeBig.y).to.equal(400);
    }));

  });

});
