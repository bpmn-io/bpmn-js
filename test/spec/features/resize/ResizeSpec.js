'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject, iit */

var createSpy = jasmine.createSpy;


var resizeModule = require('../../../../lib/features/resize'),
    selectModule = require('../../../../lib/features/selection');


describe('features/resize', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ resizeModule, selectModule ] }));

    it('should bootstrap diagram with component', inject(function(resize) {

      expect(resize).toBeDefined();
    }));

  });

  describe('#resizeShape - absolute', function() {

    beforeEach(bootstrapDiagram({ modules: [ resizeModule, selectModule ] }));

    it('should fire shape.resized', inject(function(resize, elementFactory, canvas, eventBus) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      var listener = createSpy('listener');
      eventBus.on('shape.resized', listener);

      // when
      resize.resizeShape(c1Shape, {delta: {x: 0, y: 0}});

      // then
      expect(listener).toHaveBeenCalled();

    }));

    it('should resize Shape', inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when
      resize.resizeShape(c1Shape, {delta: {x: -107, y: -108}});

      var updatedShape = elementRegistry.getById('c1');

      // then
      expect(updatedShape.height).toBe(208);
      expect(updatedShape.width).toBe(207);
    }));
  });

  describe('#resizeShape - with direction', function() {

    beforeEach(bootstrapDiagram({ modules: [ resizeModule, selectModule ] }));

    it('should resize Shape using sw anchor (shrink)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'sw',
        delta: {
          x: -5,
          y: 15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(85);
      expect(updatedShape1.width).toBe(95);

      expect(updatedShape1.x).toBe(105); // move right
      expect(updatedShape1.y).toBe(100); // stay the same
    }));

    it('should resize Shape using sw anchor (expand)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'sw',
        delta: {
          x: 5,
          y: -15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(115);
      expect(updatedShape1.width).toBe(105);

      expect(updatedShape1.x).toBe(95);  // move left
      expect(updatedShape1.y).toBe(100); // stay the same
    }));


    it('should resize Shape using nw anchor (shrink)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'nw',
        delta: {
          x: -5,
          y: -15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(85);
      expect(updatedShape1.width).toBe(95);

      expect(updatedShape1.x).toBe(105); // move right
      expect(updatedShape1.y).toBe(115); // move down
    }));


    it('should resize Shape using nw anchor (expand)', inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'nw',
        delta: {
          x: 5,
          y: 15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(115);
      expect(updatedShape1.width).toBe(105);

      expect(updatedShape1.x).toBe(95); // move left
      expect(updatedShape1.y).toBe(85); // move up
    }));


    it('should resize Shape using ne anchor (shrink)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'ne',
        delta: {
          x: 5,
          y: -15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(85);
      expect(updatedShape1.width).toBe(95);

      expect(updatedShape1.x).toBe(100); // stay at 100
      expect(updatedShape1.y).toBe(115); // move down
    }));


    it('should resize Shape using ne anchor (expand)', inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'ne',
        delta: {
          x: -5,
          y: 15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(115);
      expect(updatedShape1.width).toBe(105);

      expect(updatedShape1.x).toBe(100); // stay at 100
      expect(updatedShape1.y).toBe(85); // move up
    }));


    it('should resize Shape using se anchor (shrink)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'se',
        delta: {
          x: 5,
          y: 15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(85);
      expect(updatedShape1.width).toBe(95);

      expect(updatedShape1.x).toBe(100); // stay at 100
      expect(updatedShape1.y).toBe(100); // stay at 100
    }));


    it('should resize Shape using se anchor (expand)',
      inject(function(resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when - reduce size
      resize.resizeShape(c1Shape, {
        direction: 'se',
        delta: {
          x: -5,
          y: -15
        }
      });

      var updatedShape1 = elementRegistry.getById('c1');

      // then
      expect(updatedShape1.height).toBe(115);
      expect(updatedShape1.width).toBe(105);

      expect(updatedShape1.x).toBe(100); // stay at 100
      expect(updatedShape1.y).toBe(100); // stay at 100
    }));

  });


  describe('ResizeVisual ', function() {

    beforeEach(bootstrapDiagram({ modules: [ resizeModule, selectModule ] }));

    it('should add anchors on selection', inject(function(selection, resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when
      selection.select(c1Shape, false);

      // then
      var selectedShape = elementRegistry.getGraphicsByElement(c1Shape);

      var resizeAnchors = selectedShape.selectAll('.resize');

      expect(resizeAnchors.length).toBe(4);
    }));


    it('should remove anchors on deselect',
      inject(function(selection, resize, elementFactory, canvas, elementRegistry) {

      // given
      var c1Shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(c1Shape);

      // when
      selection.select(c1Shape, false);
      selection.deselect(c1Shape, false);

      // then
      var selectedShape = elementRegistry.getGraphicsByElement(c1Shape);

      var resizeAnchors = selectedShape.selectAll('.resize');

      expect(resizeAnchors.length).toBe(0);
    }));
  });
});
