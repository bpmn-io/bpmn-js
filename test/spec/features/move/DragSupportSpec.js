'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');

var MockEvent = require('../../../Event');


describe('features/move - DragSupport', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, moveModule ] }));


  var rootShape, shape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    shape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape, rootShape);
  }));


  describe('drag events', function() {

    it('should fire <shape.drag.start>', inject(function(dragSupport, eventBus) {

      // given
      var draggable = dragSupport.get(shape);

      var lastEvent;
      eventBus.on('shape.drag.start', function(e) {
        lastEvent = e;
      });

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(5, 5, 15, 15, new MockEvent());

      // then
      // threshould should not have kicked in yet
      expect(lastEvent).not.toBeDefined();

      // when
      draggable.dragMove(20, 20, 30, 30, new MockEvent());

      // then
      expect(lastEvent).toBeDefined();
      expect(lastEvent.dragContext).toBeDefined();
    }));


    it('should fire <shape.drag.move>', inject(function(dragSupport, eventBus) {

      // given
      var draggable = dragSupport.get(shape);

      var lastEvent;
      eventBus.on('shape.drag.move', function(e) {
        lastEvent = e;
      });

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(20, 20, 30, 30, new MockEvent());

      // then
      expect(lastEvent).toBeDefined();
      expect(lastEvent.dragContext).toBeDefined();

      expect(lastEvent.dragContext.delta).toEqual({ x: 20, y: 20 });
    }));

  });


  describe('drag behavior', function() {

    it('should scale delta during <shape.drag.move>', inject(function(dragSupport, eventBus, canvas) {

      // given
      var draggable = dragSupport.get(shape);

      canvas.zoom(0.5);

      var lastEvent;
      eventBus.on('shape.drag.move', function(e) {
        lastEvent = e;
      });

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(20, 20, 30, 30, new MockEvent());

      // then
      expect(lastEvent.dragContext.delta).toEqual({ x: 40, y: 40 });
    }));

  });

});