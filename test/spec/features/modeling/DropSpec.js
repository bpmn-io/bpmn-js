'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move shape - drop', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parent1, parent2, parent3, shape1, shape2, shape3;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    // parents
    parent1 = elementFactory.createShape({
      id: 'parent1',
      x: 10, y: 50, width: 70, height: 70
    });

    canvas.addShape(parent1, rootShape);

    parent2 = elementFactory.createShape({
      id: 'parent2',
      x: 100, y: 50, width: 70, height: 70
    });

    canvas.addShape(parent2, rootShape);

    parent3 = elementFactory.createShape({
      id: 'parent3',
      x: 190, y: 50, width: 120, height: 120
    });

    canvas.addShape(parent3, rootShape);

    // childs
    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 10, y: 10, width: 10, height: 10
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 30, y: 10, width: 10, height: 10
    });

    canvas.addShape(shape2, rootShape);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      x: 50, y: 10, width: 10, height: 10
    });

    canvas.addShape(shape3, rootShape);
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('shapes', function() {

    it('should drop single shape', inject(function(modeling) {

      // given

      // when
      modeling.moveShape(shape1, { x: 5, y: 50 }, parent1);

      // then
      expect(shape1.parent).to.equal(parent1);
    }));


    it('should drop multiple shapes', inject(function(modeling) {

      // given

      // when
      modeling.moveElements([shape1, shape2], { x: 5, y: 50 }, parent1);

      // then
      expect(shape1.parent).to.equal(parent1);
      expect(shape2.parent).to.equal(parent1);
    }));


    it('should drop multiple shapes from multiple source parents', inject(function(modeling) {

      // given
      modeling.moveShape(shape1, { x: 5, y: 50 }, parent1);
      modeling.moveShape(shape2, { x: 75, y: 50 }, parent2);

      // when
      modeling.moveElements([shape1, shape2], { x: 180, y: 0 }, parent3);

      // then
      expect(shape1.parent).to.equal(parent3);
      expect(shape2.parent).to.equal(parent3);
    }));


    it('should drop container in container', inject(function(modeling) {

      // given
      modeling.moveElements([shape1, shape2], { x: 110, y: 50 }, parent2);

      // when
      modeling.moveShape(parent2, { x: 115, y: 25 }, parent3);

      // then
      expect(shape1.parent).to.equal(parent2);
      expect(shape2.parent).to.equal(parent2);
      expect(parent2.parent).to.equal(parent3);
    }));

  });

});
