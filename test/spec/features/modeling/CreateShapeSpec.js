'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - create shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, childShape3, childShape4;

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


  describe('attachment - basics', function() {

    beforeEach(inject(function(canvas, elementFactory, modeling) {
      childShape = elementFactory.createShape({
        id: 'childShape',
        x: 125, y: 125, width: 100, height: 100
      });

      modeling.createShape(childShape, position, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'childShape2',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(childShape2, { x: 225, y: 225 }, childShape, true);
    }));

    it('should have a host', inject(function() {

      // when
      var host = childShape2.host;

      // then
      expect(host).to.equal(childShape);
    }));


    it('should have an attacher', inject(function() {

      // when
      var attachers = childShape.attachers;

      // then
      expect(attachers).to.include(childShape2);
    }));


    it('should have same parent', inject(function() {

      // then
      expect(childShape.parent).to.equal(childShape2.parent);
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      expect(childShape2.host).to.not.exist;

      expect(childShape.attachers).to.not.include(childShape2);
    }));


    it('should on redo', inject(function(commandStack) {

      // when
      commandStack.redo();

      var host = childShape2.host;
      var attachers = childShape.attachers;

      // then
      expect(host).to.equal(childShape);

      expect(attachers).to.include(childShape2);
    }));

  });

  describe('attachment - multiple attachers', function () {

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      modeling.createShape(childShape, position, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'childShape2',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(childShape2, { x: 225, y: 225 }, childShape, true);

      childShape3 = elementFactory.createShape({
        id: 'childShape3',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(childShape3, { x: 125, y: 225 }, childShape, true);

      childShape4 = elementFactory.createShape({
        id: 'childShape4',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(childShape4, { x: 225, y: 125 }, childShape, true);

    }));

    it('should have multiple attachers', inject(function(elementFactory, modeling) {

      // then
      expect(childShape.attachers).to.contain(childShape3, childShape4);
    }));

  });

});
