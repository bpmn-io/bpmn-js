'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var resizeBounds = require('../../../../lib/features/resize/Util').resizeBounds;

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - resize shape', function() {

  beforeEach(Matchers.addDeepEquals);


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  describe('basics', function() {

    var rootShape, shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 50, y: 250, width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);
    }));


    it('should change size of shape', inject(function(modeling) {

      // when
      modeling.resizeShape(shape2, { width: 124, height: 202 });

      // then
      expect(shape2.width).toBe(124);
      expect(shape2.height).toBe(202);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { width: 124, height: 202 });
      modeling.resizeShape(shape2, { width: 999, height: 999 });

      // when
      commandStack.undo();

      // then
      expect(shape2.width).toBe(124);
      expect(shape2.height).toBe(202);

      // when
      commandStack.undo();

      // then
      expect(shape2.width).toBe(100);
      expect(shape2.height).toBe(100);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { width: 124, height: 202 });
      modeling.resizeShape(shape2, { width: 999, height: 999 });

      commandStack.undo();
      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(shape2.width).toBe(124);
      expect(shape2.height).toBe(202);

      // when
      commandStack.redo();

      // then
      expect(shape2.width).toBe(999);
      expect(shape2.height).toBe(999);
    }));

  });


  describe('resize directions', function() {

    it('should shrink sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: 5, y: -15 }));

      // then
      expect(shape.height).toBe(85);
      expect(shape.width).toBe(95);

      expect(shape.x).toBe(105); // move right
      expect(shape.y).toBe(100); // stay the same
    }));


    it('should expand sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: -5, y: 15 }));

      // then
      expect(shape.height).toBe(115);
      expect(shape.width).toBe(105);

      expect(shape.x).toBe(95);  // move left
      expect(shape.y).toBe(100); // stay the same
    }));


    it('should shrink nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: 5, y: 15 }));

      // then
      expect(shape.height).toBe(85);
      expect(shape.width).toBe(95);

      expect(shape.x).toBe(105); // move right
      expect(shape.y).toBe(115); // move down
    }));


    it('should expand nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: -5, y: -15 }));

      // then
      expect(shape.height).toBe(115);
      expect(shape.width).toBe(105);

      expect(shape.x).toBe(95); // move left
      expect(shape.y).toBe(85); // move up
    }));


    it('should shrink ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: -5, y: 15 }));

      // then
      expect(shape.height).toBe(85);
      expect(shape.width).toBe(95);

      expect(shape.x).toBe(100);
      expect(shape.y).toBe(115);
    }));


    it('should expand ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: 5, y: -15 }));

      // then
      expect(shape.height).toBe(115);
      expect(shape.width).toBe(105);

      expect(shape.x).toBe(100);
      expect(shape.y).toBe(85);
    }));


    it('should shrink se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: -5, y: -15 }));

      // then
      expect(shape.height).toBe(85);
      expect(shape.width).toBe(95);

      expect(shape.x).toBe(100);
      expect(shape.y).toBe(100);
    }));


    it('should expand se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: 5, y: 15 }));

      // then
      expect(shape.height).toBe(115);
      expect(shape.width).toBe(105);

      expect(shape.x).toBe(100);
      expect(shape.y).toBe(100);
    }));

  });

});
