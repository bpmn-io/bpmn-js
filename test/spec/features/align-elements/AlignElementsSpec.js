'use strict';

/* global bootstrapDiagram, inject */

var alignElementsModule = require('../../../../lib/features/align-elements'),
    modelingModule = require('../../../../lib/features/modeling');


describe('features/align-elements', function() {

  beforeEach(bootstrapDiagram({
    modules: [ alignElementsModule, modelingModule ]
  }));

  describe('methods', function() {

    var elements = [
      { x: 50, y: 100, width: 100, height: 100 },
      { x: 200, y: 250, width: 100, height: 100 },
      { x: 400, y: 450, width: 300, height: 300 }
    ];

    describe('#_alignmentPosition', function() {

      function expectAlignmentPosition(type, result) {
        return function(alignElements) {
          // when
          var position = alignElements._alignmentPosition(type, elements);

          expect(position).to.eql(result);
        };
      }

      it('should get "left" position', inject(expectAlignmentPosition('left', { left: 50 })));


      it('should get "right" position', inject(expectAlignmentPosition('right', { right: 700 })));


      it('should get "center" position', inject(expectAlignmentPosition('center', { center: 375 })));


      it('should get "top" position', inject(expectAlignmentPosition('top', { top: 100 })));


      it('should get "bottom" position', inject(expectAlignmentPosition('bottom', { bottom: 750 })));


      it('should get "middle" position', inject(expectAlignmentPosition('middle', { middle: 425 })));

    });

  });

  describe('integration', function() {
    var rootShape, shape1, shape2, shape3, shapeBig, elements;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 's1',
        x: 50, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 's2',
        x: 200, y: 250, width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);

      shape3 = elementFactory.createShape({
        id: 's3',
        x: 800, y: 550, width: 100, height: 100
      });

      canvas.addShape(shape3, rootShape);

      shapeBig = elementFactory.createShape({
        id: 'sBig',
        x: 400, y: 450, width: 300, height: 300
      });

      canvas.addShape(shapeBig, rootShape);

      elements = [ shape1, shape2, shapeBig ];
    }));

    it('should align to the "left"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements, 'left');

      // then
      expect(shape1.x).to.equal(50);
      expect(shape2.x).to.equal(50);
      expect(shapeBig.x).to.equal(50);
    }));


    it('should align to the "right"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements, 'right');

      // then
      expect(shape1.x).to.equal(600);
      expect(shape2.x).to.equal(600);
      expect(shapeBig.x).to.equal(400);
    }));


    it('should align to the "center"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements, 'center');

      // then
      expect(shape1.x).to.equal(325);
      expect(shape2.x).to.equal(325);
      expect(shapeBig.x).to.equal(225);
    }));


    it('should align to the "top"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements, 'top');

      // then
      expect(shape1.y).to.equal(100);
      expect(shape2.y).to.equal(100);
      expect(shapeBig.y).to.equal(100);
    }));


    it('should align to the "bottom"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements, 'bottom');

      // then
      expect(shape1.y).to.equal(650);
      expect(shape2.y).to.equal(650);
      expect(shapeBig.y).to.equal(450);
    }));


    it('should align to the "middle"', inject(function(alignElements) {
      // when
      alignElements.trigger(elements.concat(shape3), 'middle');

      // then
      expect(shape1.y).to.equal(550);
      expect(shape2.y).to.equal(550);
      expect(shape3.y).to.equal(550);
      expect(shapeBig.y).to.equal(450);
    }));

  });

});
