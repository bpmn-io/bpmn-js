'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move'),
    orderingProviderModule = require('./provider');


describe('features/ordering', function() {

  beforeEach(bootstrapDiagram({ modules: [ moveModule, modelingModule, orderingProviderModule ] }));


  var rootShape,
      level1Shape_alwaysTopLevel, level3Shape_Parent, level5Shape_alwaysTopLevel,
      nestedLevel1Shape, nestedLevel2Shape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    level1Shape_alwaysTopLevel = elementFactory.createShape({
      id: 'level1',
      x: 100, y: 100,
      width: 100, height: 100,
      level: 1,
      alwaysTopLevel: true
    });

    canvas.addShape(level1Shape_alwaysTopLevel, rootShape);

    level3Shape_Parent = elementFactory.createShape({
      id: 'level3_Parent',
      x: 50, y: 50,
      width: 400, height: 400,
      level: 3
    });

    canvas.addShape(level3Shape_Parent, rootShape);

    nestedLevel1Shape = elementFactory.createShape({
      id: 'nestedLevel1',
      x: 100, y: 100,
      width: 100, height: 100,
      level: 1
    });

    canvas.addShape(nestedLevel1Shape, level3Shape_Parent);

    nestedLevel2Shape = elementFactory.createShape({
      id: 'nestedLevel2',
      x: 150, y: 150,
      width: 100, height: 100,
      level: 2
    });

    canvas.addShape(nestedLevel2Shape, level3Shape_Parent);


    level5Shape_alwaysTopLevel = elementFactory.createShape({
      id: 'level5_alwaysTopLevel',
      x: 200, y: 200,
      width: 100, height: 100,
      level: 5,
      alwaysTopLevel: true
    });

    canvas.addShape(level5Shape_alwaysTopLevel, rootShape);
  }));


  describe('should define sibling order', function() {

    it('should move behind shape', inject(function(modeling) {

      // when
      modeling.moveElements([ nestedLevel1Shape ], { x: -20, y: +20 }, level3Shape_Parent);

      // then
      expect(level3Shape_Parent.children).to.eql([ nestedLevel1Shape, nestedLevel2Shape ]);
    }));


    it('should move in from of same level changing parent', inject(function(modeling) {

      // when
      modeling.moveElements([ nestedLevel1Shape ], { x: -20, y: +20 }, rootShape);

      // then
      expect(rootShape.children).to.eql([
        level1Shape_alwaysTopLevel,
        nestedLevel1Shape,
        level3Shape_Parent,
        level5Shape_alwaysTopLevel
      ]);
    }));


    it('should remain on top', inject(function(modeling) {

      // when
      modeling.moveElements([ level5Shape_alwaysTopLevel ], { x: -20, y: +20 }, level3Shape_Parent);

      // then
      expect(rootShape.children).to.eql([
        level1Shape_alwaysTopLevel,
        level3Shape_Parent,
        level5Shape_alwaysTopLevel
      ]);
    }));


    it('should reorder multiple elements', inject(function(modeling) {

      var elements = [
        level1Shape_alwaysTopLevel,
        nestedLevel1Shape,
        level5Shape_alwaysTopLevel
      ];

      // when

      modeling.moveElements(elements, { x: -20, y: +20 }, level3Shape_Parent);

      // then
      expect(level3Shape_Parent.children).to.eql([
        nestedLevel1Shape,
        nestedLevel2Shape
      ]);

      expect(rootShape.children).to.eql([
        level1Shape_alwaysTopLevel,
        level3Shape_Parent,
        level5Shape_alwaysTopLevel
      ]);
    }));

  });

});
