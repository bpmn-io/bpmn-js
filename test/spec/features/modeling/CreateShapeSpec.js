'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - create shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'childShape',
      x: 0, y: 0, width: 100, height: 100
    });

  }));

  var position = {
    x: 175,
    y: 175
  };


  describe('basics', function() {

    it('should create a shape', inject(function(modeling, elementRegistry) {

      // when
      modeling.createShape(childShape, position, parentShape);

      var shape = elementRegistry.get('childShape');

      // then
      expect(shape).to.include({
        id: 'childShape',
        x: 125, y: 125,
        width: 100, height: 100
      });

    }));


    it('should have a parent', inject(function(modeling) {

      // given
      modeling.createShape(childShape, position, parentShape);

      // when
      var parent = childShape.parent;

      // then
      expect(parent).to.equal(parentShape);
    }));


    it('should return a graphics element', inject(function(modeling, elementRegistry) {

      // given
      modeling.createShape(childShape, position, parentShape);

      // when
      var shape = elementRegistry.getGraphics(childShape);

      // then
      expect(shape).to.exist;
    }));


    it('should undo', inject(function(modeling, commandStack, elementRegistry) {

      // given
      modeling.createShape(childShape, position, parentShape);

      // when
      commandStack.undo();

      var shape = elementRegistry.get('childShape');

      // then
      expect(shape).to.not.exist;
    }));

  });

});
