'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');

var MockEvent = require('../../../Event');


describe('features/move - MoveVisuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, moveModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('style integration via <djs-dragging>', function() {

    it('should append class to shape + outgoing connections', inject(function(dragSupport, elementRegistry) {

      // given
      var draggable = dragSupport.get(childShape);
      expect(draggable).toBeDefined();

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(20, 20, 30, 30, new MockEvent());

      // then
      expect(elementRegistry.getGraphicsByElement(childShape).hasClass('djs-dragging')).toBe(true);
      expect(elementRegistry.getGraphicsByElement(connection).hasClass('djs-dragging')).toBe(true);
    }));


    it('should append class to shape + incoming connections', inject(function(dragSupport, elementRegistry) {

      // given
      var draggable = dragSupport.get(childShape2);
      expect(draggable).toBeDefined();

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(20, 20, 30, 30, new MockEvent());

      // then
      expect(elementRegistry.getGraphicsByElement(childShape2).hasClass('djs-dragging')).toBe(true);
      expect(elementRegistry.getGraphicsByElement(connection).hasClass('djs-dragging')).toBe(true);
    }));


    it('should remove class on drag end', inject(function(dragSupport, elementRegistry) {

      // given
      var draggable = dragSupport.get(childShape2);
      expect(draggable).toBeDefined();

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(20, 20, 30, 30, new MockEvent());
      draggable.dragEnd(30, 30, new MockEvent());

      // then
      expect(elementRegistry.getGraphicsByElement(childShape2).hasClass('djs-dragging')).toBe(false);
      expect(elementRegistry.getGraphicsByElement(connection).hasClass('djs-dragging')).toBe(false);
    }));

  });

});